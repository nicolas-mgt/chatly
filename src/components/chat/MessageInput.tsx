import {Box, Flex, IconButton, Image, Input, Spinner} from '@chakra-ui/react'
import {type KeyboardEvent, useRef, useState} from 'react'
import {LuImage, LuSend, LuX} from 'react-icons/lu'
import type {useChat} from '@/hooks/useChat'
import {uploadImage} from '@/lib/uploadImage'

export function MessageInput({chat}: {chat: ReturnType<typeof useChat>}) {
	const [text, setText] = useState('')
	const [file, setFile] = useState<File | undefined>(undefined)
	const [uploading, setUploading] = useState(false)
	const fileInputRef = useRef<HTMLInputElement>(null)

	async function handleSend() {
		const trimmed = text.trim()
		if (!(trimmed || file)) return

		let imageUrl: string | undefined
		if (file) {
			setUploading(true)
			try {
				imageUrl = await uploadImage(file)
			} finally {
				setUploading(false)
			}
		}

		chat.sendMessage(trimmed, imageUrl)
		setText('')
		setFile(undefined)
	}

	function handleKeyDown(e: KeyboardEvent) {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault()
			// biome-ignore lint/suspicious/noEmptyBlockStatements: fire-and-forget
			handleSend().catch(() => {})
		}
	}

	return (
		<Box
			borderColor={{base: 'gray.200', _dark: 'gray.800'}}
			borderTop='1px solid'
			p='3'
			w='full'
		>
			{file && <ImagePreview file={file} onRemove={() => setFile(undefined)} />}
			<InputBar
				fileInputRef={fileInputRef}
				hasFile={file !== undefined}
				onFileChange={e => {
					const selected = e.target.files?.[0]
					if (selected) setFile(selected)
					e.target.value = ''
				}}
				onKeyDown={handleKeyDown}
				onSend={handleSend}
				onTextChange={setText}
				text={text}
				uploading={uploading}
			/>
		</Box>
	)
}

function InputBar({
	fileInputRef,
	hasFile,
	onFileChange,
	onKeyDown,
	onSend,
	onTextChange,
	text,
	uploading
}: {
	fileInputRef: React.RefObject<HTMLInputElement | null>
	hasFile: boolean
	onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void
	onKeyDown: (e: KeyboardEvent) => void
	onSend: () => void
	onTextChange: (text: string) => void
	text: string
	uploading: boolean
}) {
	return (
		<Flex align='center' gap='2'>
			<input
				accept='image/*'
				hidden={true}
				onChange={onFileChange}
				ref={fileInputRef}
				type='file'
			/>
			<IconButton
				aria-label='Attach image'
				color={hasFile ? 'brand.500' : undefined}
				onClick={() => fileInputRef.current?.click()}
				rounded='full'
				size='sm'
				variant='ghost'
			>
				<LuImage />
			</IconButton>
			<Input
				flex='1'
				onChange={e => onTextChange(e.target.value)}
				onKeyDown={onKeyDown}
				placeholder='Type a message...'
				size='sm'
				value={text}
				variant='outline'
			/>
			<IconButton
				aria-label='Send message'
				colorPalette='brand'
				disabled={uploading}
				onClick={onSend}
				rounded='full'
				size='sm'
			>
				{uploading ? <Spinner size='sm' /> : <LuSend />}
			</IconButton>
		</Flex>
	)
}

function ImagePreview({file, onRemove}: {file: File; onRemove: () => void}) {
	const previewUrl = URL.createObjectURL(file)

	return (
		<Flex align='center' gap='2' mb='2' px='1'>
			<Box overflow='hidden' position='relative' rounded='md'>
				<Image alt='Preview' h='16' objectFit='cover' src={previewUrl} w='16' />
				<IconButton
					aria-label='Remove image'
					bg='blackAlpha.600'
					color='white'
					h='5'
					minW='5'
					onClick={onRemove}
					position='absolute'
					right='0.5'
					rounded='full'
					size='2xs'
					top='0.5'
					variant='plain'
				>
					<LuX size={10} />
				</IconButton>
			</Box>
		</Flex>
	)
}
