import {
	Box,
	Container,
	Heading,
	HStack,
	Icon,
	Text,
	VStack
} from '@chakra-ui/react'
import {motion} from 'framer-motion'
import type {ReactNode} from 'react'
import {LuMessageCircle} from 'react-icons/lu'
import {Link} from 'react-router'
import {ColorModeButton} from '@/components/ui/color-mode'

const MotionBox = motion.create(Box)

export function AuthLayout({
	children,
	title,
	subtitle
}: {
	children: ReactNode
	title: string
	subtitle: string
}) {
	return (
		<Box
			alignItems='center'
			display='flex'
			justifyContent='center'
			minH='100vh'
			py='12'
		>
			<Box position='absolute' right='4' top='4'>
				<ColorModeButton />
			</Box>
			<Container maxW='md'>
				<MotionBox
					animate={{opacity: 1, y: 0}}
					initial={{opacity: 0, y: 20}}
					transition={{duration: 0.4}}
				>
					<VStack gap='8'>
						<Link to='/'>
							<HStack gap='2'>
								<Icon color='brand.500' size='lg'>
									<LuMessageCircle />
								</Icon>
								<Text fontSize='xl' fontWeight='bold'>
									Chatly
								</Text>
							</HStack>
						</Link>
						<VStack gap='1' textAlign='center'>
							<Heading fontSize='2xl' fontWeight='bold'>
								{title}
							</Heading>
							<Text color={{base: 'gray.600', _dark: 'gray.400'}}>
								{subtitle}
							</Text>
						</VStack>
						<Box
							bg={{base: 'white', _dark: 'gray.900'}}
							border='1px solid'
							borderColor={{base: 'gray.200', _dark: 'gray.800'}}
							p='8'
							rounded='xl'
							shadow='lg'
							w='full'
						>
							{children}
						</Box>
					</VStack>
				</MotionBox>
			</Container>
		</Box>
	)
}
