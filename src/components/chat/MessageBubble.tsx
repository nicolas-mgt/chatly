import {Box, Flex, HStack, Image, Text} from '@chakra-ui/react'
import {AnimatePresence, motion} from 'framer-motion'
import {useState} from 'react'
import {LuCheckCheck, LuSmile} from 'react-icons/lu'
import type {Message, Reaction} from '@/lib/types'

const MotionBox = motion.create(Box)

const REACTION_EMOJIS = ['👍', '❤️', '😂', '😮', '😢']

export function MessageBubble({
	message,
	isLastSent,
	addReaction,
	currentUserId,
	onImageClick
}: {
	message: Message
	isLastSent: boolean
	addReaction: (messageId: string, emoji: string) => void
	currentUserId: string
	onImageClick: (url: string) => void
}) {
	const isMine = message.senderId === currentUserId
	const [showPicker, setShowPicker] = useState(false)

	return (
		<MotionBox
			alignSelf={isMine ? 'flex-end' : 'flex-start'}
			initial={{opacity: 0, x: isMine ? 20 : -20}}
			maxW='75%'
			position='relative'
			transition={{duration: 0.3}}
			viewport={{once: true}}
			whileInView={{opacity: 1, x: 0}}
		>
			<BubbleContent
				isMine={isMine}
				message={message}
				onImageClick={onImageClick}
				onTogglePicker={() => setShowPicker(p => !p)}
			/>
			<ReactionBar reactions={message.reactions} />
			<AnimatePresence>
				{showPicker && (
					<ReactionPicker
						messageId={message.id}
						onClose={() => setShowPicker(false)}
						onReact={addReaction}
					/>
				)}
			</AnimatePresence>
			{isLastSent && isMine && (
				<SeenIndicator currentUserId={currentUserId} message={message} />
			)}
		</MotionBox>
	)
}

function BubbleContent({
	message,
	isMine,
	onImageClick,
	onTogglePicker
}: {
	message: Message
	isMine: boolean
	onImageClick: (url: string) => void
	onTogglePicker: () => void
}) {
	return (
		<Flex _hover={{'& > .react-btn': {opacity: 1}}} align='flex-end' gap='1'>
			{!isMine && (
				<Box
					className='react-btn'
					cursor='pointer'
					onClick={onTogglePicker}
					opacity='0'
					transition='opacity 0.15s'
				>
					<LuSmile size={14} />
				</Box>
			)}
			<Box
				bg={
					isMine
						? {base: 'brand.500', _dark: 'brand.700'}
						: {base: 'white', _dark: 'gray.800'}
				}
				border={isMine ? undefined : '1px solid'}
				borderColor={isMine ? undefined : {base: 'gray.200', _dark: 'gray.700'}}
				color={isMine ? 'white' : undefined}
				overflow='hidden'
				rounded='2xl'
				roundedBottomLeft={isMine ? undefined : 'sm'}
				roundedBottomRight={isMine ? 'sm' : undefined}
			>
				{message.imageUrl && (
					<Image
						alt='Shared image'
						cursor='pointer'
						maxH='200px'
						objectFit='cover'
						onClick={() => onImageClick(message.imageUrl as string)}
						src={message.imageUrl}
						w='full'
					/>
				)}
				{message.text && (
					<Text fontSize='sm' px='3' py='2'>
						{message.text}
					</Text>
				)}
			</Box>
			{isMine && (
				<Box
					className='react-btn'
					cursor='pointer'
					onClick={onTogglePicker}
					opacity='0'
					transition='opacity 0.15s'
				>
					<LuSmile size={14} />
				</Box>
			)}
		</Flex>
	)
}

function ReactionBar({reactions}: {reactions: Reaction[]}) {
	if (reactions.length === 0) return null

	return (
		<HStack gap='1' mt='1'>
			{reactions.map(r => (
				<Flex
					align='center'
					bg={{base: 'gray.100', _dark: 'gray.700'}}
					fontSize='xs'
					gap='1'
					key={r.emoji}
					px='2'
					py='0.5'
					rounded='full'
				>
					<Text>{r.emoji}</Text>
					{r.userIds.length > 1 && <Text>{r.userIds.length}</Text>}
				</Flex>
			))}
		</HStack>
	)
}

function ReactionPicker({
	messageId,
	onReact,
	onClose
}: {
	messageId: string
	onReact: (messageId: string, emoji: string) => void
	onClose: () => void
}) {
	return (
		<MotionBox
			animate={{scale: 1, opacity: 1}}
			bg={{base: 'white', _dark: 'gray.800'}}
			border='1px solid'
			borderColor={{base: 'gray.200', _dark: 'gray.700'}}
			exit={{scale: 0.8, opacity: 0}}
			initial={{scale: 0.8, opacity: 0}}
			position='absolute'
			right='0'
			rounded='full'
			shadow='lg'
			top='-10'
			transition={{type: 'spring', duration: 0.25}}
			zIndex='popover'
		>
			<HStack gap='0' px='2' py='1'>
				{REACTION_EMOJIS.map(emoji => (
					<Box
						_hover={{transform: 'scale(1.3)'}}
						cursor='pointer'
						fontSize='md'
						key={emoji}
						onClick={() => {
							onReact(messageId, emoji)
							onClose()
						}}
						px='1'
						transition='transform 0.1s'
					>
						{emoji}
					</Box>
				))}
			</HStack>
		</MotionBox>
	)
}

function SeenIndicator({
	message,
	currentUserId
}: {
	message: Message
	currentUserId: string
}) {
	const isSeen = message.seenByIds.some(id => id !== currentUserId)

	return (
		<HStack gap='1' justify='flex-end' mt='0.5'>
			<LuCheckCheck
				color={
					isSeen
						? 'var(--chakra-colors-brand-500)'
						: 'var(--chakra-colors-gray-400)'
				}
				size={14}
			/>
			{isSeen && (
				<Text color={{base: 'gray.500', _dark: 'gray.400'}} fontSize='xs'>
					Seen
				</Text>
			)}
		</HStack>
	)
}
