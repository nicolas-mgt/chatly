import {Icon, Text, VStack} from '@chakra-ui/react'
import {LuMessageCircle} from 'react-icons/lu'
import type {useChat} from '@/hooks/useChat'
import {ConversationHeader} from './ConversationHeader'
import {MessageInput} from './MessageInput'
import {MessageList} from './MessageList'

export function ConversationPanel({chat}: {chat: ReturnType<typeof useChat>}) {
	if (!chat.selectedId) return <EmptyState />

	return (
		<VStack bg={{base: 'gray.50', _dark: 'gray.950'}} flex='1' gap='0' h='full'>
			<ConversationHeader chat={chat} />
			<MessageList chat={chat} />
			<MessageInput chat={chat} />
		</VStack>
	)
}

function EmptyState() {
	return (
		<VStack
			align='center'
			bg={{base: 'gray.50', _dark: 'gray.950'}}
			flex='1'
			gap='3'
			h='full'
			justify='center'
		>
			<Icon color={{base: 'gray.300', _dark: 'gray.600'}} size='2xl'>
				<LuMessageCircle />
			</Icon>
			<Text color={{base: 'gray.400', _dark: 'gray.500'}} fontSize='lg'>
				Select a conversation to start chatting
			</Text>
		</VStack>
	)
}
