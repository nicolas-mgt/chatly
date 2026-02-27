import {Navigate} from 'react-router'
import {LoadingOrError} from '@/components/LoadingOrError'
import {useAuth} from '@/hooks/useAuth'

export function ProtectedRoute({children}: {children: React.ReactNode}) {
	const {user, loading} = useAuth()

	if (loading) return <LoadingOrError />
	if (!user) return <Navigate replace={true} to='/login' />

	return children
}
