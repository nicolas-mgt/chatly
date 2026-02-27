import {Box, VStack} from '@chakra-ui/react'
import {useEffect, useRef} from 'react'
import type {useChat} from '@/hooks/useChat'
import {MessageBubble} from './MessageBubble'

export function MessageList({
	chat,
	onImageClick
}: {
	chat: ReturnType<typeof useChat>
	onImageClick: (url: string) => void
}) {
	const bottomRef = useRef<HTMLDivElement>(null)
	const isFirstRender = useRef(true)

	// biome-ignore lint/correctness/useExhaustiveDependencies: reset scroll behavior on conversation switch
	useEffect(() => {
		isFirstRender.current = true
	}, [chat.selectedId])

	// biome-ignore lint/correctness/useExhaustiveDependencies: scroll on message count change only
	useEffect(() => {
		const behavior = isFirstRender.current ? 'instant' : 'smooth'
		bottomRef.current?.scrollIntoView({behavior})
		isFirstRender.current = false
	}, [chat.messages.length])

	const lastSentIdx = findLastSentIndex(chat.messages, chat.currentUserId)

	return (
		<Box flex='1' overflowY='auto' w='full'>
			<VStack align='stretch' gap='2' p='4'>
				{chat.messages.map((msg, i) => (
					<MessageBubble
						addReaction={chat.addReaction}
						currentUserId={chat.currentUserId}
						isLastSent={i === lastSentIdx}
						key={msg.id}
						message={msg}
						onImageClick={onImageClick}
					/>
				))}
				<div ref={bottomRef} />
			</VStack>
		</Box>
	)
}

function findLastSentIndex(
	messages: ReturnType<typeof useChat>['messages'],
	currentUserId: string
): number {
	for (let i = messages.length - 1; i >= 0; i -= 1) {
		if (messages[i]?.senderId === currentUserId) return i
	}
	return -1
}
