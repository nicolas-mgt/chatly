import {Avatar, Box, Button, Flex, HStack, Text} from '@chakra-ui/react'
import {LuArrowLeft} from 'react-icons/lu'
import type {useChat} from '@/hooks/useChat'

export function ConversationHeader({chat}: {chat: ReturnType<typeof useChat>}) {
	const conv = chat.conversations.find(c => c.id === chat.selectedId)
	const other = conv?.participants.find(p => p.id !== chat.currentUserId)
	if (!other) return null

	return (
		<Flex
			align='center'
			bg={{base: 'white', _dark: 'gray.900'}}
			borderBottom='1px solid'
			borderColor={{base: 'gray.200', _dark: 'gray.800'}}
			gap='3'
			px='4'
			py='3'
			w='full'
		>
			<Button
				display={{base: 'flex', md: 'none'}}
				onClick={chat.clearSelection}
				size='sm'
				variant='ghost'
			>
				<LuArrowLeft />
			</Button>
			<Box position='relative'>
				<Avatar.Root size='sm'>
					<Avatar.Image alt={other.name} src={other.avatarUrl} />
					<Avatar.Fallback name={other.name} />
				</Avatar.Root>
			</Box>
			<HStack gap='2'>
				<Text fontSize='sm' fontWeight='semibold'>
					{other.name}
				</Text>
				{other.online && (
					<Text color='green.500' fontSize='xs'>
						Online
					</Text>
				)}
			</HStack>
		</Flex>
	)
}
