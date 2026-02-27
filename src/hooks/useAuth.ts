import {createContext, useContext} from 'react'
import type {User} from '@/lib/auth'

export interface AuthContextValue {
	user: User | null
	loading: boolean
	signup: (email: string, password: string, name: string) => Promise<void>
	signin: (email: string, password: string) => Promise<void>
	signout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth(): AuthContextValue {
	const context = useContext(AuthContext)
	if (!context) {
		throw new Error('useAuth must be used within an AuthProvider')
	}
	return context
}
