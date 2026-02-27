import {Avatar, Box, Flex, Input, Text, VStack} from '@chakra-ui/react'
import {AnimatePresence, motion} from 'framer-motion'
import {useRef, useState} from 'react'
import {LuSearch} from 'react-icons/lu'
import type {useChat} from '@/hooks/useChat'
import type {UserProfile} from '@/lib/types'

const MotionBox = motion.create(Box)

export function SearchBox({chat}: {chat: ReturnType<typeof useChat>}) {
	const [focused, setFocused] = useState(false)
	const blurTimeout = useRef<ReturnType<typeof setTimeout>>(undefined)
	const showResults = focused && chat.searchResults.length > 0

	function handleBlur() {
		blurTimeout.current = setTimeout(() => setFocused(false), 150)
	}

	function handleFocus() {
		clearTimeout(blurTimeout.current)
		setFocused(true)
	}

	return (
		<Box position='relative'>
			<Flex
				align='center'
				bg={{base: 'gray.100', _dark: 'gray.800'}}
				gap='2'
				px='3'
				rounded='lg'
			>
				<LuSearch />
				<Input
					border='none'
					onBlur={handleBlur}
					onChange={e => chat.setSearchQuery(e.target.value)}
					onFocus={handleFocus}
					placeholder='Search users...'
					size='sm'
					value={chat.searchQuery}
					variant='flushed'
				/>
			</Flex>
			<AnimatePresence>
				{showResults && (
					<SearchResults
						onSelect={chat.startConversation}
						results={chat.searchResults}
					/>
				)}
			</AnimatePresence>
		</Box>
	)
}

function SearchResults({
	results,
	onSelect
}: {
	results: UserProfile[]
	onSelect: (id: string) => void
}) {
	return (
		<MotionBox
			animate={{opacity: 1, y: 0}}
			bg={{base: 'white', _dark: 'gray.900'}}
			border='1px solid'
			borderColor={{base: 'gray.200', _dark: 'gray.700'}}
			exit={{opacity: 0, y: -8}}
			initial={{opacity: 0, y: -8}}
			left='0'
			position='absolute'
			right='0'
			rounded='lg'
			shadow='lg'
			top='100%'
			transition={{duration: 0.15}}
			zIndex='dropdown'
		>
			<VStack align='stretch' gap='0' maxH='200px' overflowY='auto'>
				{results.map(profile => (
					<SearchResultItem
						key={profile.id}
						onSelect={onSelect}
						profile={profile}
					/>
				))}
			</VStack>
		</MotionBox>
	)
}

function SearchResultItem({
	profile,
	onSelect
}: {
	profile: UserProfile
	onSelect: (id: string) => void
}) {
	return (
		<Flex
			_hover={{bg: {base: 'gray.50', _dark: 'gray.800'}}}
			align='center'
			cursor='pointer'
			gap='3'
			onClick={() => onSelect(profile.id)}
			px='3'
			py='2'
		>
			<Avatar.Root size='sm'>
				<Avatar.Image alt={profile.name} src={profile.avatarUrl} />
				<Avatar.Fallback name={profile.name} />
			</Avatar.Root>
			<Text fontSize='sm' fontWeight='medium'>
				{profile.name}
			</Text>
			{profile.online && (
				<Text color='green.500' fontSize='xs'>
					Online
				</Text>
			)}
		</Flex>
	)
}
