import {useCallback, useEffect, useRef, useState} from 'react'
import {useAuth} from '@/hooks/useAuth'
import {useLiveQuery} from '@/hooks/useLiveQuery'
import {
	sendMessage as apiSendMessage,
	toggleReaction as apiToggleReaction,
	fetchConversation,
	fetchConversations,
	fetchMessages,
	findOrCreateConversation,
	mapConversation,
	mapMessage,
	markConversationSeen,
	searchUsers
} from '@/lib/chatApi'
import type {Conversation, Message, UserProfile} from '@/lib/types'

// biome-ignore lint/suspicious/noConsole: fire-and-forget error handler
const logError = console.error.bind(console)

export interface UseChatReturn {
	addReaction: (messageId: string, emoji: string) => void
	clearSelection: () => void
	conversations: Conversation[]
	currentUserId: string
	messages: Message[]
	searchQuery: string
	searchResults: UserProfile[]
	selectConversation: (id: string) => void
	selectedId: string | undefined
	sendMessage: (text: string, imageUrl?: string) => void
	setSearchQuery: (q: string) => void
	startConversation: (userId: string) => void
}

export function useChat(): UseChatReturn {
	const {user} = useAuth()
	const currentUserId = user ? user.id.toString() : ''
	const [conversations, setConversations] = useState<Conversation[]>([])
	const [messages, setMessages] = useState<Message[]>([])
	const [selectedId, setSelectedId] = useState<string | undefined>(undefined)
	const [searchQuery, setSearchQuery] = useState('')
	const [searchResults, setSearchResults] = useState<UserProfile[]>([])
	const selectedRef = useRef(selectedId)
	selectedRef.current = selectedId

	useInitialFetch(setConversations)
	useMessageFetch(selectedId, currentUserId, setMessages)
	useSearchEffect(searchQuery, setSearchResults)
	useConversationLive(setConversations)
	useMessageLive(selectedRef, currentUserId, setMessages, setConversations)
	useUserLive(setConversations)

	const navActions = useNavActions({
		setConversations,
		setSearchQuery,
		setSelectedId
	})
	const apiActions = useApiActions(selectedId, currentUserId)

	return {
		...navActions,
		...apiActions,
		conversations,
		currentUserId,
		messages,
		searchQuery,
		searchResults,
		selectedId,
		setSearchQuery
	}
}

// ---- Effects ----

function useInitialFetch(
	setConversations: React.Dispatch<React.SetStateAction<Conversation[]>>
) {
	useEffect(() => {
		fetchConversations().then(setConversations).catch(logError)
	}, [setConversations])
}

function useMessageFetch(
	selectedId: string | undefined,
	currentUserId: string,
	setMessages: React.Dispatch<React.SetStateAction<Message[]>>
) {
	useEffect(() => {
		if (!selectedId) {
			setMessages([])
			return
		}
		fetchMessages(selectedId).then(setMessages).catch(logError)
		if (currentUserId) {
			markConversationSeen(selectedId).catch(logError)
		}
	}, [selectedId, currentUserId, setMessages])
}

function useSearchEffect(
	searchQuery: string,
	setSearchResults: React.Dispatch<React.SetStateAction<UserProfile[]>>
) {
	useEffect(() => {
		if (searchQuery.length === 0) {
			setSearchResults([])
			return
		}
		searchUsers(searchQuery).then(setSearchResults).catch(logError)
	}, [searchQuery, setSearchResults])
}

function useConversationLive(
	setConversations: React.Dispatch<React.SetStateAction<Conversation[]>>
) {
	useLiveQuery('conversation', msg => {
		const raw = msg.value as unknown as Parameters<typeof mapConversation>[0]
		const conv = mapConversation(raw, 0)
		if (msg.action === 'CREATE') {
			fetchConversation(conv.id)
				.then(fetched => {
					setConversations(prev =>
						prev.some(c => c.id === fetched.id) ? prev : [fetched, ...prev]
					)
				})
				.catch(logError)
		} else if (msg.action === 'UPDATE') {
			setConversations(prev =>
				prev.map(c =>
					c.id === conv.id ? {...c, lastMessage: conv.lastMessage} : c
				)
			)
		} else if (msg.action === 'DELETE') {
			const id = msg.recordId.toString()
			setConversations(prev => prev.filter(c => c.id !== id))
		}
	})
}

function useMessageLive(
	selectedRef: React.RefObject<string | undefined>,
	currentUserId: string,
	setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
	setConversations: React.Dispatch<React.SetStateAction<Conversation[]>>
) {
	useLiveQuery('message', msg => {
		const mapped = mapMessage(
			msg.value as unknown as Parameters<typeof mapMessage>[0]
		)
		const isSelected = mapped.conversationId === selectedRef.current

		if (msg.action === 'CREATE' && isSelected) {
			setMessages(prev =>
				prev.some(m => m.id === mapped.id) ? prev : [...prev, mapped]
			)
			if (mapped.senderId !== currentUserId) {
				markConversationSeen(mapped.conversationId).catch(logError)
			}
		}
		if (
			msg.action === 'CREATE' &&
			mapped.senderId !== currentUserId &&
			!isSelected
		) {
			setConversations(prev =>
				prev.map(c =>
					c.id === mapped.conversationId
						? {...c, unreadCount: c.unreadCount + 1}
						: c
				)
			)
		}
		if (msg.action === 'UPDATE' && isSelected) {
			setMessages(prev => prev.map(m => (m.id === mapped.id ? mapped : m)))
		}
		if (msg.action === 'DELETE' && isSelected) {
			setMessages(prev => prev.filter(m => m.id !== mapped.id))
		}
	})
}

function useUserLive(
	setConversations: React.Dispatch<React.SetStateAction<Conversation[]>>
) {
	useLiveQuery('user', msg => {
		if (msg.action !== 'UPDATE') return
		const userId = msg.recordId.toString()
		const {online} = msg.value as unknown as {online: boolean}
		setConversations(prev =>
			prev.map(c => ({
				...c,
				participants: c.participants.map(p =>
					p.id === userId ? {...p, online} : p
				)
			}))
		)
	})
}

// ---- Actions ----

interface NavDeps {
	setConversations: React.Dispatch<React.SetStateAction<Conversation[]>>
	setSearchQuery: React.Dispatch<React.SetStateAction<string>>
	setSelectedId: React.Dispatch<React.SetStateAction<string | undefined>>
}

function useNavActions(deps: NavDeps) {
	const {setConversations, setSearchQuery, setSelectedId} = deps

	const selectConversation = useCallback(
		(id: string) => {
			setSelectedId(id)
			setSearchQuery('')
			setConversations(prev =>
				prev.map(c => (c.id === id ? {...c, unreadCount: 0} : c))
			)
		},
		[setSelectedId, setSearchQuery, setConversations]
	)

	const clearSelection = useCallback(
		() => setSelectedId(undefined),
		[setSelectedId]
	)

	const startConversation = useCallback(
		(userId: string) => {
			findOrCreateConversation(userId)
				.then(conv => {
					setConversations(prev =>
						prev.some(c => c.id === conv.id) ? prev : [conv, ...prev]
					)
					setSelectedId(conv.id)
					setSearchQuery('')
				})
				.catch(logError)
		},
		[setConversations, setSelectedId, setSearchQuery]
	)

	return {clearSelection, selectConversation, startConversation}
}

function useApiActions(selectedId: string | undefined, currentUserId: string) {
	const sendMessage = useCallback(
		(text: string, imageUrl?: string) => {
			if (!selectedId) return
			apiSendMessage({
				conversationId: selectedId,
				imageUrl,
				text
			}).catch(logError)
		},
		[selectedId]
	)

	const addReaction = useCallback(
		(messageId: string, emoji: string) => {
			if (!currentUserId) return
			apiToggleReaction(messageId, emoji, currentUserId).catch(logError)
		},
		[currentUserId]
	)

	return {addReaction, sendMessage}
}
