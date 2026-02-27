import {Suspense} from 'react'
import {ErrorBoundary, type FallbackProps} from 'react-error-boundary'
import {Route, Routes} from 'react-router'
import {LoadingOrError} from '@/components/LoadingOrError'
import {ProtectedRoute} from '@/components/ProtectedRoute'
import {AuthProvider} from '@/contexts/AuthContext'
import {Chat} from '@/pages/Chat'
import {Landing} from '@/pages/Landing'
import {Login} from '@/pages/Login'
import {Register} from '@/pages/Register'

function renderError({error}: FallbackProps) {
	return <LoadingOrError error={error} />
}

export function App() {
	return (
		<ErrorBoundary fallbackRender={renderError}>
			<Suspense fallback={<LoadingOrError />}>
				<AuthProvider>
					<Routes>
						<Route element={<Landing />} index={true} />
						<Route element={<Login />} path='/login' />
						<Route element={<Register />} path='/register' />
						<Route
							element={
								<ProtectedRoute>
									<Chat />
								</ProtectedRoute>
							}
							path='/chat'
						/>
					</Routes>
				</AuthProvider>
			</Suspense>
		</ErrorBoundary>
	)
}
