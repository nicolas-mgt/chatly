export interface UserProfile {
	id: string
	name: string
	avatarUrl: string | undefined
	online: boolean
}

export interface Reaction {
	emoji: string
	userIds: string[]
}

export interface LastMessage {
	text: string
	senderId: string
	createdAt: string
}

export interface Message {
	id: string
	conversationId: string
	senderId: string
	text: string | undefined
	imageUrl: string | undefined
	reactions: Reaction[]
	seenByIds: string[]
	createdAt: string
}

export interface Conversation {
	id: string
	participants: UserProfile[]
	lastMessage: LastMessage | undefined
	unreadCount: number
}
