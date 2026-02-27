import {Avatar, Box, Flex, Text, VStack} from '@chakra-ui/react'
import {motion, type Variants} from 'framer-motion'
import type {useChat} from '@/hooks/useChat'
import type {Conversation, LastMessage} from '@/lib/types'

const MotionBox = motion.create(Box)

const fadeUp: Variants = {
	hidden: {opacity: 0, y: 10},
	visible: (i: number) => ({
		opacity: 1,
		y: 0,
		transition: {delay: i * 0.05, duration: 0.3, ease: 'easeOut' as const}
	})
}

export function ConversationList({chat}: {chat: ReturnType<typeof useChat>}) {
	return (
		<VStack align='stretch' flex='1' gap='0' overflowY='auto' w='full'>
			{chat.conversations.map((conv, i) => (
				<ConversationItem
					conversation={conv}
					currentUserId={chat.currentUserId}
					index={i}
					key={conv.id}
					onSelect={chat.selectConversation}
					selected={conv.id === chat.selectedId}
				/>
			))}
		</VStack>
	)
}

function ConversationItem({
	conversation,
	currentUserId,
	index,
	selected,
	onSelect
}: {
	conversation: Conversation
	currentUserId: string
	index: number
	selected: boolean
	onSelect: (id: string) => void
}) {
	const other = conversation.participants.find(p => p.id !== currentUserId)
	if (!other) return null

	const hasUnread = conversation.unreadCount > 0
	const lastMsg = conversation.lastMessage
	const preview = getPreview(lastMsg, currentUserId)

	return (
		<MotionBox
			animate='visible'
			custom={index}
			initial='hidden'
			variants={fadeUp}
		>
			<Flex
				_hover={{bg: {base: 'gray.50', _dark: 'gray.800'}}}
				align='center'
				bg={selected ? {base: 'brand.50', _dark: 'brand.950'} : 'transparent'}
				cursor='pointer'
				gap='3'
				onClick={() => onSelect(conversation.id)}
				px='4'
				py='3'
				transition='background 0.15s'
			>
				<Box position='relative'>
					<Avatar.Root size='md'>
						<Avatar.Image alt={other.name} src={other.avatarUrl} />
						<Avatar.Fallback name={other.name} />
					</Avatar.Root>
					{other.online && <OnlineDot />}
				</Box>
				<ItemContent
					hasUnread={hasUnread}
					name={other.name}
					preview={preview}
				/>
				{lastMsg && (
					<ItemMeta
						createdAt={lastMsg.createdAt}
						hasUnread={hasUnread}
						unreadCount={conversation.unreadCount}
					/>
				)}
			</Flex>
		</MotionBox>
	)
}

function OnlineDot() {
	return (
		<Box
			bg='green.400'
			border='2px solid'
			borderColor={{base: 'white', _dark: 'gray.900'}}
			bottom='0'
			h='3'
			position='absolute'
			right='0'
			rounded='full'
			w='3'
		/>
	)
}

function ItemContent({
	name,
	preview,
	hasUnread
}: {
	name: string
	preview: string
	hasUnread: boolean
}) {
	return (
		<Box flex='1' minW='0'>
			<Text
				fontSize='sm'
				fontWeight={hasUnread ? 'bold' : 'medium'}
				truncate={true}
			>
				{name}
			</Text>
			<Text
				color={
					hasUnread
						? {base: 'gray.800', _dark: 'gray.200'}
						: {base: 'gray.500', _dark: 'gray.400'}
				}
				fontSize='xs'
				fontWeight={hasUnread ? 'semibold' : 'normal'}
				truncate={true}
			>
				{preview}
			</Text>
		</Box>
	)
}

function ItemMeta({
	createdAt,
	hasUnread,
	unreadCount
}: {
	createdAt: string
	hasUnread: boolean
	unreadCount: number
}) {
	return (
		<VStack align='end' gap='1'>
			<Text color={{base: 'gray.400', _dark: 'gray.500'}} fontSize='xs'>
				{formatTime(createdAt)}
			</Text>
			{hasUnread && <UnreadBadge count={unreadCount} />}
		</VStack>
	)
}

function UnreadBadge({count}: {count: number}) {
	return (
		<Flex
			align='center'
			bg='brand.500'
			color='white'
			fontSize='xs'
			fontWeight='bold'
			h='5'
			justify='center'
			minW='5'
			px='1'
			rounded='full'
		>
			{count}
		</Flex>
	)
}

function formatTime(iso: string): string {
	const date = new Date(iso)
	const now = new Date()
	const diffDays = Math.floor(
		(now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
	)
	if (diffDays === 0) {
		return date.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})
	}
	if (diffDays === 1) return 'Yesterday'
	return date.toLocaleDateString([], {month: 'short', day: 'numeric'})
}

function getPreview(
	lastMsg: LastMessage | undefined,
	currentUserId: string
): string {
	if (!lastMsg) return 'No messages yet'
	if (lastMsg.senderId === currentUserId) return `You: ${lastMsg.text}`
	return lastMsg.text
}
