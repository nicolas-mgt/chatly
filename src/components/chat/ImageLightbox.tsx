import {Box, IconButton, Image, Portal} from '@chakra-ui/react'
import {AnimatePresence, motion} from 'framer-motion'
import {useEffect} from 'react'
import {LuX} from 'react-icons/lu'

const MotionBox = motion.create(Box)

export function ImageLightbox({
	src,
	onClose
}: {
	src: string | undefined
	onClose: () => void
}) {
	useEffect(() => {
		if (!src) return

		function handleKeyDown(e: KeyboardEvent) {
			if (e.key === 'Escape') onClose()
		}

		window.addEventListener('keydown', handleKeyDown)
		return () => window.removeEventListener('keydown', handleKeyDown)
	}, [src, onClose])

	return (
		<Portal>
			<AnimatePresence>
				{src && (
					<MotionBox
						animate={{opacity: 1}}
						exit={{opacity: 0}}
						initial={{opacity: 0}}
						transition={{duration: 0.2}}
					>
						<Box
							alignItems='center'
							bg='blackAlpha.800'
							display='flex'
							h='100dvh'
							justifyContent='center'
							left='0'
							onClick={onClose}
							position='fixed'
							top='0'
							w='100vw'
							zIndex='modal'
						>
							<IconButton
								aria-label='Close preview'
								color='white'
								onClick={onClose}
								position='absolute'
								right='4'
								rounded='full'
								top='4'
								variant='ghost'
							>
								<LuX size={24} />
							</IconButton>
							<Image
								alt='Full size preview'
								maxH='90dvh'
								maxW='90vw'
								objectFit='contain'
								onClick={e => e.stopPropagation()}
								rounded='lg'
								src={src}
							/>
						</Box>
					</MotionBox>
				)}
			</AnimatePresence>
		</Portal>
	)
}
