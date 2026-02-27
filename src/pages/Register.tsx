import {Button, Field, Input, Text, VStack} from '@chakra-ui/react'
import {type FormEvent, useState} from 'react'
import {LuUserPlus} from 'react-icons/lu'
import {Link} from 'react-router'
import * as v from 'valibot'
import {AuthLayout} from '@/components/AuthLayout'
import {Head} from '@/components/Head'
import {useAuth} from '@/hooks/useAuth'
import {extractFieldErrors, RegisterSchema} from '@/lib/validation'

interface RegisterErrors {
	name?: string
	email?: string
	password?: string
	confirmPassword?: string
	form?: string
}

const REGISTER_FIELDS: (keyof RegisterErrors)[] = [
	'name',
	'email',
	'password',
	'confirmPassword'
]

export function Register() {
	const {signup} = useAuth()
	const [name, setName] = useState('')
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [confirmPassword, setConfirmPassword] = useState('')
	const [errors, setErrors] = useState<RegisterErrors>({})
	const [submitting, setSubmitting] = useState(false)

	async function handleSubmit(e: FormEvent) {
		e.preventDefault()
		setErrors({})

		const result = v.safeParse(RegisterSchema, {
			name,
			email,
			password,
			confirmPassword
		})
		if (!result.success) {
			setErrors(
				extractFieldErrors<RegisterErrors>(result.issues, REGISTER_FIELDS)
			)
			return
		}

		setSubmitting(true)
		try {
			await signup(email, password, name)
		} catch {
			setErrors({form: 'Registration failed. Email may already be in use.'})
		} finally {
			setSubmitting(false)
		}
	}

	return (
		<>
			<Head title='Create Account — Chatly' />
			<RegisterForm
				confirmPassword={confirmPassword}
				email={email}
				errors={errors}
				name={name}
				onSubmit={handleSubmit}
				password={password}
				setConfirmPassword={setConfirmPassword}
				setEmail={setEmail}
				setName={setName}
				setPassword={setPassword}
				submitting={submitting}
			/>
		</>
	)
}

function RegisterForm({
	name,
	email,
	password,
	confirmPassword,
	errors,
	submitting,
	setName,
	setEmail,
	setPassword,
	setConfirmPassword,
	onSubmit
}: {
	name: string
	email: string
	password: string
	confirmPassword: string
	errors: RegisterErrors
	submitting: boolean
	setName: (v: string) => void
	setEmail: (v: string) => void
	setPassword: (v: string) => void
	setConfirmPassword: (v: string) => void
	onSubmit: (e: FormEvent) => void
}) {
	return (
		<AuthLayout
			subtitle='Create your account to get started'
			title='Join Chatly'
		>
			<form onSubmit={onSubmit}>
				<VStack gap='5'>
					<RegisterFields
						confirmPassword={confirmPassword}
						email={email}
						errors={errors}
						name={name}
						password={password}
						setConfirmPassword={setConfirmPassword}
						setEmail={setEmail}
						setName={setName}
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
						<LuUserPlus />
						Create Account
					</Button>
					<Text color={{base: 'gray.600', _dark: 'gray.400'}} fontSize='sm'>
						Already have an account?{' '}
						<Link to='/login'>
							<Text as='span' color='brand.500' fontWeight='medium'>
								Sign in
							</Text>
						</Link>
					</Text>
				</VStack>
			</form>
		</AuthLayout>
	)
}

function RegisterFields({
	name,
	email,
	password,
	confirmPassword,
	errors,
	setName,
	setEmail,
	setPassword,
	setConfirmPassword
}: {
	name: string
	email: string
	password: string
	confirmPassword: string
	errors: RegisterErrors
	setName: (v: string) => void
	setEmail: (v: string) => void
	setPassword: (v: string) => void
	setConfirmPassword: (v: string) => void
}) {
	return (
		<>
			<Field.Root invalid={Boolean(errors.name)}>
				<Field.Label>Name</Field.Label>
				<Input
					onChange={e => setName(e.target.value)}
					placeholder='Your name'
					value={name}
				/>
				{errors.name && <Field.ErrorText>{errors.name}</Field.ErrorText>}
			</Field.Root>
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
					placeholder='At least 8 characters'
					type='password'
					value={password}
				/>
				{errors.password && (
					<Field.ErrorText>{errors.password}</Field.ErrorText>
				)}
			</Field.Root>
			<Field.Root invalid={Boolean(errors.confirmPassword)}>
				<Field.Label>Confirm Password</Field.Label>
				<Input
					onChange={e => setConfirmPassword(e.target.value)}
					placeholder='Repeat your password'
					type='password'
					value={confirmPassword}
				/>
				{errors.confirmPassword && (
					<Field.ErrorText>{errors.confirmPassword}</Field.ErrorText>
				)}
			</Field.Root>
		</>
	)
}
