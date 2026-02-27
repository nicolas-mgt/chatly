import {Box, Button, Flex, HStack, Icon, Text, VStack} from '@chakra-ui/react'
import {LuLogOut, LuMessageCircle} from 'react-icons/lu'
import {ColorModeButton} from '@/components/ui/color-mode'
import {useAuth} from '@/hooks/useAuth'
import type {useChat} from '@/hooks/useChat'
import {ConversationList} from './ConversationList'
import {SearchBox} from './SearchBox'

export function ChatSidebar({chat}: {chat: ReturnType<typeof useChat>}) {
	return (
		<VStack
			bg={{base: 'white', _dark: 'gray.900'}}
			borderColor={{base: 'gray.200', _dark: 'gray.800'}}
			borderRight='1px solid'
			gap='0'
			h='full'
			w={{base: 'full', md: '360px'}}
		>
			<SidebarHeader />
			<Box px='3' py='2' w='full'>
				<SearchBox chat={chat} />
			</Box>
			<ConversationList chat={chat} />
		</VStack>
	)
}

function SidebarHeader() {
	const {signout} = useAuth()

	return (
		<Flex
			align='center'
			borderBottom='1px solid'
			borderColor={{base: 'gray.200', _dark: 'gray.800'}}
			justify='space-between'
			px='4'
			py='3'
			w='full'
		>
			<HStack gap='2'>
				<Icon color='brand.500' size='lg'>
					<LuMessageCircle />
				</Icon>
				<Text fontSize='lg' fontWeight='bold'>
					Chatly
				</Text>
			</HStack>
			<HStack gap='1'>
				<ColorModeButton />
				<Button onClick={signout} size='sm' variant='ghost'>
					<LuLogOut />
				</Button>
			</HStack>
		</Flex>
	)
}
