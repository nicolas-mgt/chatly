import {
	Box,
	Button,
	Container,
	Flex,
	Grid,
	Heading,
	HStack,
	Icon,
	Text,
	VStack
} from '@chakra-ui/react'
import {motion, type Variants} from 'framer-motion'
import {LuLock, LuMessageCircle, LuSend, LuUsers, LuZap} from 'react-icons/lu'
import {Link} from 'react-router'
import {Head} from '@/components/Head'
import {ColorModeButton} from '@/components/ui/color-mode'

const MotionBox = motion.create(Box)
const MotionHeading = motion.create(Heading)
const MotionText = motion.create(Text)
const MotionButton = motion.create(Button)

const fadeUp: Variants = {
	hidden: {opacity: 0, y: 20},
	visible: (i: number) => ({
		opacity: 1,
		y: 0,
		transition: {delay: i * 0.15, duration: 0.5, ease: 'easeOut' as const}
	})
}

const features = [
	{
		icon: LuZap,
		title: 'Real-time Messaging',
		description:
			'Instant delivery powered by WebSockets. Your messages arrive before you blink.'
	},
	{
		icon: LuLock,
		title: 'End-to-End Encrypted',
		description:
			'Your conversations stay private. Always encrypted, never compromised.'
	},
	{
		icon: LuUsers,
		title: 'Group Conversations',
		description:
			'Create channels, teams, and group chats. Collaborate with anyone, anywhere.'
	}
]

function FloatingBubble({
	delay,
	x,
	y,
	size
}: {
	delay: number
	x: string
	y: string
	size: string
}) {
	return (
		<MotionBox
			animate={{
				scale: [0, 1.2, 1],
				opacity: [0, 0.3, 0.15]
			}}
			bg='brand.500/10'
			h={size}
			initial={{scale: 0, opacity: 0}}
			left={x}
			position='absolute'
			rounded='full'
			top={y}
			transition={{
				delay,
				duration: 2,
				ease: 'easeOut',
				repeat: Number.POSITIVE_INFINITY,
				repeatType: 'reverse',
				repeatDelay: 3
			}}
			w={size}
		/>
	)
}

function Navbar() {
	return (
		<Flex
			align='center'
			as='nav'
			backdropFilter='blur(12px)'
			bg={{base: 'white/80', _dark: 'gray.900/80'}}
			borderBottom='1px solid'
			borderColor={{base: 'gray.100', _dark: 'gray.800'}}
			justify='space-between'
			left='0'
			position='fixed'
			px='6'
			py='3'
			right='0'
			top='0'
			zIndex='banner'
		>
			<HStack gap='2'>
				<Icon color='brand.500' size='lg'>
					<LuMessageCircle />
				</Icon>
				<Text fontSize='lg' fontWeight='bold'>
					Chatly
				</Text>
			</HStack>
			<HStack gap='2'>
				<ColorModeButton />
				<Button asChild={true} colorPalette='brand' size='sm'>
					<Link to='/login'>Sign In</Link>
				</Button>
			</HStack>
		</Flex>
	)
}

function HeroBadge() {
	return (
		<MotionBox animate='visible' custom={0} initial='hidden' variants={fadeUp}>
			<HStack
				bg={{base: 'brand.50', _dark: 'brand.950'}}
				color='brand.500'
				fontSize='sm'
				fontWeight='medium'
				justify='center'
				px='4'
				py='1.5'
				rounded='full'
			>
				<Icon size='sm'>
					<LuZap />
				</Icon>
				<Text>Now in Early Access</Text>
			</HStack>
		</MotionBox>
	)
}

function HeroActions() {
	return (
		<MotionBox animate='visible' custom={3} initial='hidden' variants={fadeUp}>
			<HStack gap='4' pt='2'>
				<Button
					asChild={true}
					colorPalette='brand'
					fontSize='md'
					fontWeight='semibold'
					px='8'
					size='lg'
				>
					<Link to='/register'>
						<Icon>
							<LuSend />
						</Icon>
						Get Started
					</Link>
				</Button>
				<Button
					fontSize='md'
					fontWeight='semibold'
					px='8'
					size='lg'
					variant='outline'
				>
					Learn More
				</Button>
			</HStack>
		</MotionBox>
	)
}

function Hero() {
	return (
		<Box
			alignItems='center'
			display='flex'
			minH='100vh'
			overflow='hidden'
			position='relative'
		>
			<FloatingBubble delay={0} size='300px' x='10%' y='20%' />
			<FloatingBubble delay={1} size='200px' x='70%' y='10%' />
			<FloatingBubble delay={2} size='150px' x='80%' y='60%' />
			<FloatingBubble delay={0.5} size='100px' x='5%' y='70%' />

			<Container maxW='4xl' position='relative' zIndex='1'>
				<VStack gap='6' textAlign='center'>
					<HeroBadge />
					<MotionHeading
						animate='visible'
						as='h1'
						custom={1}
						fontSize={{base: '4xl', md: '6xl', lg: '7xl'}}
						fontWeight='extrabold'
						initial='hidden'
						letterSpacing='tight'
						lineHeight='1.1'
						variants={fadeUp}
					>
						Chat that feels{' '}
						<Text
							as='span'
							bgClip='text'
							bgGradient='to-r'
							gradientFrom='brand.400'
							gradientTo='purple.500'
						>
							instant
						</Text>
					</MotionHeading>
					<MotionText
						animate='visible'
						color={{base: 'gray.600', _dark: 'gray.400'}}
						custom={2}
						fontSize={{base: 'lg', md: 'xl'}}
						initial='hidden'
						lineHeight='relaxed'
						maxW='2xl'
						variants={fadeUp}
					>
						A modern messaging platform built for speed, privacy, and seamless
						collaboration. Connect with your team in real time.
					</MotionText>
					<HeroActions />
				</VStack>
			</Container>
		</Box>
	)
}

interface ChatMessage {
	name: string
	text: string
	time: string
	align: 'start' | 'end'
}

const chatMessages: ChatMessage[] = [
	{
		name: 'Alice',
		text: 'Hey! Have you tried Chatly yet?',
		time: '2:41 PM',
		align: 'start'
	},
	{
		name: 'You',
		text: 'Just signed up. This is so fast!',
		time: '2:42 PM',
		align: 'end'
	},
	{
		name: 'Alice',
		text: 'Right? Real-time messaging done right.',
		time: '2:42 PM',
		align: 'start'
	}
]

function ChatBubble({msg, index}: {msg: ChatMessage; index: number}) {
	return (
		<MotionBox
			alignSelf={msg.align === 'end' ? 'flex-end' : 'flex-start'}
			initial={{opacity: 0, x: msg.align === 'end' ? 20 : -20}}
			maxW='80%'
			transition={{delay: 0.2 + index * 0.2, duration: 0.4}}
			viewport={{once: true}}
			whileInView={{opacity: 1, x: 0}}
		>
			<Box
				bg={
					msg.align === 'end'
						? {base: 'brand.500', _dark: 'brand.700'}
						: {base: 'gray.100', _dark: 'gray.800'}
				}
				color={msg.align === 'end' ? 'white' : undefined}
				px='4'
				py='2'
				rounded='2xl'
				roundedBottomLeft={msg.align === 'start' ? 'sm' : undefined}
				roundedBottomRight={msg.align === 'end' ? 'sm' : undefined}
			>
				<Text fontSize='sm'>{msg.text}</Text>
			</Box>
			<Text
				color={{base: 'gray.400', _dark: 'gray.500'}}
				fontSize='xs'
				mt='1'
				textAlign={msg.align}
			>
				{msg.time}
			</Text>
		</MotionBox>
	)
}

function ChatPreview() {
	return (
		<MotionBox
			border='1px solid'
			borderColor={{base: 'gray.200', _dark: 'gray.700'}}
			initial={{opacity: 0, y: 40}}
			maxW='md'
			mx='auto'
			overflow='hidden'
			rounded='2xl'
			shadow='2xl'
			transition={{duration: 0.6}}
			viewport={{once: true, margin: '-100px'}}
			whileInView={{opacity: 1, y: 0}}
		>
			<Flex
				align='center'
				bg={{base: 'gray.50', _dark: 'gray.800'}}
				borderBottom='1px solid'
				borderColor={{base: 'gray.200', _dark: 'gray.700'}}
				gap='3'
				px='4'
				py='3'
			>
				<Box bg='brand.500' h='8' rounded='full' w='8' />
				<Box>
					<Text fontSize='sm' fontWeight='semibold'>
						Alice
					</Text>
					<Text color={{base: 'gray.500', _dark: 'gray.400'}} fontSize='xs'>
						Online
					</Text>
				</Box>
			</Flex>
			<VStack
				align='stretch'
				bg={{base: 'white', _dark: 'gray.900'}}
				gap='3'
				p='4'
			>
				{chatMessages.map((msg, i) => (
					<ChatBubble index={i} key={msg.time + msg.name} msg={msg} />
				))}
			</VStack>
		</MotionBox>
	)
}

function FeatureCard({
	feature,
	index
}: {
	feature: (typeof features)[number]
	index: number
}) {
	return (
		<MotionBox
			initial={{opacity: 0, y: 30}}
			transition={{delay: index * 0.15, duration: 0.5}}
			viewport={{once: true, margin: '-50px'}}
			whileInView={{opacity: 1, y: 0}}
		>
			<VStack
				_hover={{
					borderColor: 'brand.200',
					shadow: 'lg',
					transform: 'translateY(-2px)',
					transition: 'all 0.2s'
				}}
				align='start'
				bg={{base: 'white', _dark: 'gray.900/50'}}
				border='1px solid'
				borderColor={{base: 'gray.200', _dark: 'gray.800'}}
				gap='4'
				h='full'
				p='8'
				rounded='xl'
				transition='all 0.2s'
			>
				<Flex
					align='center'
					bg={{base: 'brand.50', _dark: 'brand.950'}}
					h='12'
					justify='center'
					rounded='lg'
					w='12'
				>
					<Icon color='brand.500' size='lg'>
						<feature.icon />
					</Icon>
				</Flex>
				<Heading as='h3' fontSize='lg' fontWeight='semibold'>
					{feature.title}
				</Heading>
				<Text
					color={{base: 'gray.600', _dark: 'gray.400'}}
					fontSize='sm'
					lineHeight='relaxed'
				>
					{feature.description}
				</Text>
			</VStack>
		</MotionBox>
	)
}

function Features() {
	return (
		<Box py='24'>
			<Container maxW='5xl'>
				<VStack gap='16'>
					<VStack gap='4' textAlign='center'>
						<MotionHeading
							as='h2'
							fontSize={{base: '3xl', md: '4xl'}}
							fontWeight='bold'
							initial={{opacity: 0, y: 20}}
							transition={{duration: 0.5}}
							viewport={{once: true}}
							whileInView={{opacity: 1, y: 0}}
						>
							Everything you need to communicate
						</MotionHeading>
						<MotionText
							color={{base: 'gray.600', _dark: 'gray.400'}}
							fontSize='lg'
							initial={{opacity: 0, y: 20}}
							maxW='xl'
							transition={{delay: 0.1, duration: 0.5}}
							viewport={{once: true}}
							whileInView={{opacity: 1, y: 0}}
						>
							Built with modern technology for the best messaging experience.
						</MotionText>
					</VStack>
					<ChatPreview />
					<Grid
						gap='8'
						templateColumns={{base: '1fr', md: 'repeat(3, 1fr)'}}
						w='full'
					>
						{features.map((feature, i) => (
							<FeatureCard feature={feature} index={i} key={feature.title} />
						))}
					</Grid>
				</VStack>
			</Container>
		</Box>
	)
}

function Cta() {
	return (
		<Box py='24'>
			<Container maxW='3xl'>
				<MotionBox
					bg={{base: 'brand.50', _dark: 'brand.950/50'}}
					border='1px solid'
					borderColor={{base: 'brand.100', _dark: 'brand.900'}}
					initial={{opacity: 0, scale: 0.95}}
					p={{base: '8', md: '12'}}
					rounded='2xl'
					textAlign='center'
					transition={{duration: 0.5}}
					viewport={{once: true}}
					whileInView={{opacity: 1, scale: 1}}
				>
					<VStack gap='6'>
						<Heading
							as='h2'
							fontSize={{base: '2xl', md: '3xl'}}
							fontWeight='bold'
						>
							Ready to start chatting?
						</Heading>
						<Text
							color={{base: 'gray.600', _dark: 'gray.400'}}
							fontSize='lg'
							maxW='lg'
						>
							Join thousands of teams already using Chatly for faster, more
							secure communication.
						</Text>
						<MotionButton
							asChild={true}
							colorPalette='brand'
							fontSize='md'
							fontWeight='semibold'
							px='10'
							size='lg'
							whileHover={{scale: 1.05}}
							whileTap={{scale: 0.98}}
						>
							<Link to='/register'>
								<Icon>
									<LuSend />
								</Icon>
								Get Started for Free
							</Link>
						</MotionButton>
					</VStack>
				</MotionBox>
			</Container>
		</Box>
	)
}

function Footer() {
	return (
		<Box
			borderColor={{base: 'gray.200', _dark: 'gray.800'}}
			borderTop='1px solid'
			py='8'
		>
			<Container maxW='5xl'>
				<Flex
					align='center'
					direction={{base: 'column', md: 'row'}}
					gap='4'
					justify='space-between'
				>
					<HStack gap='2'>
						<Icon color='brand.500' size='md'>
							<LuMessageCircle />
						</Icon>
						<Text fontWeight='semibold'>Chatly</Text>
					</HStack>
					<Text color={{base: 'gray.500', _dark: 'gray.500'}} fontSize='sm'>
						&copy; {new Date().getFullYear()} Chatly. All rights reserved.
					</Text>
				</Flex>
			</Container>
		</Box>
	)
}

export function Landing() {
	return (
		<>
			<Head title='Chatly — Chat that feels instant' />
			<Navbar />
			<Hero />
			<Features />
			<Cta />
			<Footer />
		</>
	)
}
