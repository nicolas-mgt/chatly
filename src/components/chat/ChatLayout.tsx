import {Box, Flex} from '@chakra-ui/react'
import {AnimatePresence, motion} from 'framer-motion'
import {useChat} from '@/hooks/useChat'
import {ChatSidebar} from './ChatSidebar'
import {ConversationPanel} from './ConversationPanel'

const MotionBox = motion.create(Box)

export function ChatLayout() {
	const chat = useChat()
	const showPanel = chat.selectedId !== undefined

	return (
		<MotionBox
			animate={{opacity: 1}}
			h='100vh'
			initial={{opacity: 0}}
			transition={{duration: 0.3}}
		>
			{/* Desktop */}
			<Flex direction='row' display={{base: 'none', md: 'flex'}} h='full'>
				<ChatSidebar chat={chat} />
				<ConversationPanel chat={chat} />
			</Flex>

			{/* Mobile */}
			<Box display={{base: 'block', md: 'none'}} h='full'>
				<AnimatePresence mode='wait'>
					{showPanel ? (
						<MobilePanel chat={chat} key='panel' />
					) : (
						<MobileSidebar chat={chat} key='sidebar' />
					)}
				</AnimatePresence>
			</Box>
		</MotionBox>
	)
}

function MobileSidebar({chat}: {chat: ReturnType<typeof useChat>}) {
	return (
		<MotionBox
			animate={{x: 0, opacity: 1}}
			exit={{x: -100, opacity: 0}}
			h='full'
			initial={{x: -100, opacity: 0}}
			transition={{duration: 0.2}}
		>
			<ChatSidebar chat={chat} />
		</MotionBox>
	)
}

function MobilePanel({chat}: {chat: ReturnType<typeof useChat>}) {
	return (
		<MotionBox
			animate={{x: 0, opacity: 1}}
			exit={{x: 100, opacity: 0}}
			h='full'
			initial={{x: 100, opacity: 0}}
			transition={{duration: 0.2}}
		>
			<ConversationPanel chat={chat} />
		</MotionBox>
	)
}
