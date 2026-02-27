import type {ReactNode} from 'react'
import {useCallback, useEffect, useState} from 'react'
import {useNavigate} from 'react-router'
import {AuthContext} from '@/hooks/useAuth'
import {
	signin as authSignin,
	signout as authSignout,
	signup as authSignup,
	getUser,
	setOnlineStatus,
	type User
} from '@/lib/auth'

export function AuthProvider({children}: {children: ReactNode}) {
	const [user, setUser] = useState<User | null>(null)
	const [loading, setLoading] = useState(true)
	const navigate = useNavigate()

	useEffect(() => {
		getUser()
			.then(u => setUser(u ?? null))
			.catch(() => setUser(null))
			.finally(() => setLoading(false))

		const handleUnload = () => {
			setOnlineStatus(false)
		}
		window.addEventListener('beforeunload', handleUnload)
		return () => window.removeEventListener('beforeunload', handleUnload)
	}, [])

	const signup = useCallback(
		async (email: string, password: string, name: string) => {
			await authSignup(email, password, name)
			const u = await getUser()
			setUser(u ?? null)
			await navigate('/chat')
		},
		[navigate]
	)

	const signin = useCallback(
		async (email: string, password: string) => {
			await authSignin(email, password)
			const u = await getUser()
			setUser(u ?? null)
			await navigate('/chat')
		},
		[navigate]
	)

	const signout = useCallback(async () => {
		await authSignout()
		setUser(null)
		await navigate('/')
	}, [navigate])

	return (
		<AuthContext value={{user, loading, signup, signin, signout}}>
			{children}
		</AuthContext>
	)
}
