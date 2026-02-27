import {Button, Field, Input, Text, VStack} from '@chakra-ui/react'
import {type FormEvent, useState} from 'react'
import {LuLogIn} from 'react-icons/lu'
import {Link} from 'react-router'
import * as v from 'valibot'
import {AuthLayout} from '@/components/AuthLayout'
import {Head} from '@/components/Head'
import {useAuth} from '@/hooks/useAuth'
import {extractFieldErrors, LoginSchema} from '@/lib/validation'

interface LoginErrors {
	email?: string
	password?: string
	form?: string
}

const LOGIN_FIELDS: (keyof LoginErrors)[] = ['email', 'password']

export function Login() {
	const {signin} = useAuth()
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [errors, setErrors] = useState<LoginErrors>({})
	const [submitting, setSubmitting] = useState(false)

	async function handleSubmit(e: FormEvent) {
		e.preventDefault()
		setErrors({})

		const result = v.safeParse(LoginSchema, {email, password})
		if (!result.success) {
			setErrors(extractFieldErrors<LoginErrors>(result.issues, LOGIN_FIELDS))
			return
		}

		setSubmitting(true)
		try {
			await signin(email, password)
		} catch {
			setErrors({form: 'Invalid email or password'})
		} finally {
			setSubmitting(false)
		}
	}

	return (
		<>
			<Head title='Sign In — Chatly' />
			<AuthLayout subtitle='Sign in to continue to Chatly' title='Welcome back'>
				<form onSubmit={handleSubmit}>
					<VStack gap='5'>
						<FormFields
							email={email}
							errors={errors}
							password={password}
							setEmail={setEmail}
							setPassword={setPassword}
						/>
						{errors.form && (
							<Text color='red.500' fontSize='sm'>
								{errors.form}
							</Text>
						)}
						<Button
							colorPalette='brand'
							loading={submitting}
							type='submit'
							w='full'
						>
							<LuLogIn />
							Sign In
						</Button>
						<Text color={{base: 'gray.600', _dark: 'gray.400'}} fontSize='sm'>
							Don&apos;t have an account?{' '}
							<Link to='/register'>
								<Text as='span' color='brand.500' fontWeight='medium'>
									Create one
								</Text>
							</Link>
						</Text>
					</VStack>
				</form>
			</AuthLayout>
		</>
	)
}

function FormFields({
	email,
	password,
	errors,
	setEmail,
	setPassword
}: {
	email: string
	password: string
	errors: LoginErrors
	setEmail: (v: string) => void
	setPassword: (v: string) => void
}) {
	return (
		<>
			<Field.Root invalid={Boolean(errors.email)}>
				<Field.Label>Email</Field.Label>
				<Input
					onChange={e => setEmail(e.target.value)}
					placeholder='you@example.com'
					type='email'
					value={email}
				/>
				{errors.email && <Field.ErrorText>{errors.email}</Field.ErrorText>}
			</Field.Root>
			<Field.Root invalid={Boolean(errors.password)}>
				<Field.Label>Password</Field.Label>
				<Input
					onChange={e => setPassword(e.target.value)}
					placeholder='Enter your password'
					type='password'
					value={password}
				/>
				{errors.password && (
					<Field.ErrorText>{errors.password}</Field.ErrorText>
				)}
			</Field.Root>
		</>
	)
}
