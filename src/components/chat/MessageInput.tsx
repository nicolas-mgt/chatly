import {Box, Flex, IconButton, Input} from '@chakra-ui/react'
import {type KeyboardEvent, useState} from 'react'
import {LuImage, LuSend} from 'react-icons/lu'
import type {useChat} from '@/hooks/useChat'

const MOCK_IMAGE_URL = 'https://picsum.photos/seed/chatly-send/400/300'

export function MessageInput({chat}: {chat: ReturnType<typeof useChat>}) {
	const [text, setText] = useState('')
	const [hasImage, setHasImage] = useState(false)

	function handleSend() {
		const trimmed = text.trim()
		if (!(trimmed || hasImage)) return
		chat.sendMessage(trimmed, hasImage ? MOCK_IMAGE_URL : undefined)
		setText('')
		setHasImage(false)
	}

	function handleKeyDown(e: KeyboardEvent) {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault()
			handleSend()
		}
	}

	return (
		<Box
			borderColor={{base: 'gray.200', _dark: 'gray.800'}}
			borderTop='1px solid'
			p='3'
			w='full'
		>
			{hasImage && <ImagePreview onRemove={() => setHasImage(false)} />}
			<Flex align='center' gap='2'>
				<IconButton
					aria-label='Attach image'
					color={hasImage ? 'brand.500' : undefined}
					onClick={() => setHasImage(h => !h)}
					rounded='full'
					size='sm'
					variant='ghost'
				>
					<LuImage />
				</IconButton>
				<Input
					flex='1'
					onChange={e => setText(e.target.value)}
					onKeyDown={handleKeyDown}
					placeholder='Type a message...'
					size='sm'
					value={text}
					variant='outline'
				/>
				<IconButton
					aria-label='Send message'
					colorPalette='brand'
					onClick={handleSend}
					rounded='full'
					size='sm'
				>
					<LuSend />
				</IconButton>
			</Flex>
		</Box>
	)
}

function ImagePreview({onRemove}: {onRemove: () => void}) {
	return (
		<Flex align='center' gap='2' mb='2' px='1'>
			<Box
				bg={{base: 'brand.50', _dark: 'brand.950'}}
				color='brand.500'
				fontSize='xs'
				px='3'
				py='1'
				rounded='full'
			>
				Image attached
			</Box>
			<Box
				_hover={{color: {base: 'gray.700', _dark: 'gray.200'}}}
				color={{base: 'gray.400', _dark: 'gray.500'}}
				cursor='pointer'
				fontSize='xs'
				onClick={onRemove}
			>
				Remove
			</Box>
		</Flex>
	)
}
