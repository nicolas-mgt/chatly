import type {RecordId} from 'surrealdb'
import {RecordId as RecordIdClass} from 'surrealdb'
import {getDb} from './surrealdb'
import type {
	Conversation,
	LastMessage,
	Message,
	Reaction,
	UserProfile
} from './types'

// ---- Raw DB record shapes ----

interface RawProfile {
	avatar_url: string | undefined
	id: RecordId
	name: string
	online: boolean
}

interface RawReaction {
	emoji: string
	user_ids: RecordId[]
}

interface RawLastMessage {
	created_at: string
	sender_id: RecordId
	text: string
}

interface RawMessage {
	conversation_id: RecordId
	created_at: string
	id: RecordId
	image_url: string | undefined
	reactions: RawReaction[]
	seen_by: RecordId[]
	sender_id: RecordId
	text: string | undefined
}

interface RawConversation {
	id: RecordId
	last_message: RawLastMessage | null
	participants: (RawProfile | RecordId)[]
}

interface RawReactionsResult {
	reactions: RawReaction[]
}

// ---- RecordId helpers ----

function rid(id: RecordId | string): string {
	return typeof id === 'string' ? id : id.toString()
}

function toRecordId(id: string): RecordId {
	const [table, ...rest] = id.split(':')
	return new RecordIdClass(table ?? '', rest.join(':'))
}

// ---- Mappers ----

function mapProfile(raw: RawProfile): UserProfile {
	return {
		avatarUrl: raw.avatar_url ?? undefined,
		id: rid(raw.id),
		name: raw.name ?? '',
		online: Boolean(raw.online)
	}
}

function mapReaction(raw: RawReaction): Reaction {
	return {
		emoji: raw.emoji,
		userIds: (raw.user_ids ?? []).map(rid)
	}
}

function mapLastMessage(
	raw: RawLastMessage | null | undefined
): LastMessage | undefined {
	if (!raw) return
	return {
		createdAt: String(raw.created_at ?? ''),
		senderId: rid(raw.sender_id),
		text: String(raw.text ?? '')
	}
}

export function mapMessage(raw: RawMessage): Message {
	return {
		conversationId: rid(raw.conversation_id),
		createdAt: String(raw.created_at ?? ''),
		id: rid(raw.id),
		imageUrl: raw.image_url ?? undefined,
		reactions: (raw.reactions ?? []).map(mapReaction),
		seenByIds: (raw.seen_by ?? []).map(rid),
		senderId: rid(raw.sender_id),
		text: raw.text ?? undefined
	}
}

export function mapConversation(
	raw: RawConversation,
	unreadCount: number
): Conversation {
	const participants = Array.isArray(raw.participants)
		? raw.participants.map(p =>
				typeof p === 'object' && p !== null && 'name' in p
					? mapProfile(p as RawProfile)
					: mapProfile({
							avatar_url: undefined,
							id: p as RecordId,
							name: '?',
							online: false
						})
			)
		: []
	return {
		id: rid(raw.id),
		lastMessage: mapLastMessage(raw.last_message),
		participants,
		unreadCount
	}
}

// ---- Queries ----

export async function fetchConversation(
	conversationId: string
): Promise<Conversation> {
	const db = await getDb()
	const rows = await db.query<[RawConversation[]]>(
		'SELECT * FROM $convId FETCH participants',
		{convId: toRecordId(conversationId)}
	)
	const raw = rows[0]?.[0]
	if (!raw) throw new Error('Conversation not found')
	return countUnreadAndMap(raw)
}

export async function fetchConversations(): Promise<Conversation[]> {
	const db = await getDb()
	const rows = await db.query<[RawConversation[]]>(
		`SELECT * FROM conversation
		 WHERE $auth IN participants
		 ORDER BY updated_at DESC
		 FETCH participants`
	)
	const convs = rows[0] ?? []
	return Promise.all(convs.map(countUnreadAndMap))
}

async function countUnreadAndMap(raw: RawConversation): Promise<Conversation> {
	const db = await getDb()
	const convId = raw.id
	const result = await db.query<[{count: number}[]]>(
		`SELECT count() as count FROM message
		 WHERE conversation_id = $convId
		   AND sender_id != $auth
		   AND seen_by CONTAINSNOT $auth
		 GROUP ALL`,
		{convId}
	)
	const count = result[0]?.[0]?.count ?? 0
	return mapConversation(raw, count)
}

export async function fetchMessages(
	conversationId: string
): Promise<Message[]> {
	const db = await getDb()
	const rows = await db.query<[RawMessage[]]>(
		`SELECT * FROM message
		 WHERE conversation_id = $convId
		 ORDER BY created_at ASC`,
		{convId: toRecordId(conversationId)}
	)
	return (rows[0] ?? []).map(mapMessage)
}

export async function sendMessage(params: {
	conversationId: string
	text: string | undefined
	imageUrl: string | undefined
}): Promise<Message> {
	const db = await getDb()
	const rows = await db.query<[RawMessage[]]>(
		`CREATE message SET
			conversation_id = $convId,
			sender_id = $auth,
			text = $text,
			image_url = $imageUrl,
			seen_by = [$auth]`,
		{
			convId: toRecordId(params.conversationId),
			imageUrl: params.imageUrl,
			text: params.text
		}
	)
	const row = rows[0]?.[0]
	if (!row) throw new Error('Failed to create message')
	return mapMessage(row)
}

export async function toggleReaction(
	messageId: string,
	emoji: string,
	authId: string
): Promise<void> {
	const db = await getDb()
	const msgRid = toRecordId(messageId)
	const authRid = toRecordId(authId)

	const result = await db.query<[RawReactionsResult[]]>(
		'SELECT reactions FROM $msgId',
		{msgId: msgRid}
	)
	const current = result[0]?.[0]?.reactions ?? []
	const updated = computeReactionToggle(current, emoji, authRid)

	await db.query('UPDATE $msgId SET reactions = $reactions', {
		msgId: msgRid,
		reactions: updated
	})
}

function computeReactionToggle(
	reactions: RawReaction[],
	emoji: string,
	authRid: RecordId
): RawReaction[] {
	const authStr = authRid.toString()
	const existing = reactions.find(r => r.emoji === emoji)

	if (existing) {
		const userIds = existing.user_ids ?? []
		const hasUser = userIds.some(id => rid(id) === authStr)
		if (hasUser) {
			const filtered = userIds.filter(id => rid(id) !== authStr)
			if (filtered.length === 0) {
				return reactions.filter(r => r.emoji !== emoji)
			}
			return reactions.map(r =>
				r.emoji === emoji ? {...r, user_ids: filtered} : r
			)
		}
		return reactions.map(r =>
			r.emoji === emoji ? {...r, user_ids: [...userIds, authRid]} : r
		)
	}
	return [...reactions, {emoji, user_ids: [authRid]}]
}

export async function markConversationSeen(
	conversationId: string
): Promise<void> {
	const db = await getDb()
	await db.query(
		`UPDATE message SET seen_by += [$auth]
		 WHERE conversation_id = $convId
		   AND sender_id != $auth
		   AND seen_by CONTAINSNOT $auth`,
		{convId: toRecordId(conversationId)}
	)
}

export async function searchUsers(query: string): Promise<UserProfile[]> {
	const db = await getDb()
	const rows = await db.query<[RawProfile[]]>(
		`SELECT id, name, avatar_url, online FROM user
		 WHERE string::contains(string::lowercase(name), string::lowercase($query))
		   AND id != $auth
		 LIMIT 10`,
		{query}
	)
	return (rows[0] ?? []).map(mapProfile)
}

export async function findOrCreateConversation(
	otherUserId: string
): Promise<Conversation> {
	const db = await getDb()
	const otherRid = toRecordId(otherUserId)

	const authResult = await db.query<[unknown]>('RETURN $auth')
	const authRid = authResult[0] as unknown as RecordId
	const sorted = sortParticipants(authRid, otherRid)

	const existing = await db.query<[RawConversation[]]>(
		`SELECT * FROM conversation
		 WHERE participants CONTAINSALL $sorted
		   AND array::len(participants) = 2
		 FETCH participants`,
		{sorted}
	)

	if (existing[0] && existing[0].length > 0) {
		return mapConversation(existing[0][0] as RawConversation, 0)
	}

	const created = await db.query<[RawConversation[]]>(
		`CREATE conversation SET
			participants = $sorted,
			updated_at = time::now()
		 RETURN AFTER`,
		{sorted}
	)
	const raw = created[0]?.[0]
	if (!raw) throw new Error('Failed to create conversation')

	const fetched = await db.query<[RawConversation[]]>(
		'SELECT * FROM $convId FETCH participants',
		{convId: raw.id}
	)
	return mapConversation(fetched[0]?.[0] ?? raw, 0)
}

function sortParticipants(a: RecordId, b: RecordId): RecordId[] {
	return a.toString() < b.toString() ? [a, b] : [b, a]
}
