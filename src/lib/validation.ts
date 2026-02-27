import * as v from 'valibot'

export const LoginSchema = v.object({
	email: v.pipe(
		v.string(),
		v.nonEmpty('Email is required'),
		v.email('Please enter a valid email')
	),
	password: v.pipe(
		v.string(),
		v.nonEmpty('Password is required'),
		v.minLength(8, 'Password must be at least 8 characters')
	)
})

export const RegisterSchema = v.pipe(
	v.object({
		name: v.pipe(
			v.string(),
			v.nonEmpty('Name is required'),
			v.minLength(2, 'Name must be at least 2 characters')
		),
		email: v.pipe(
			v.string(),
			v.nonEmpty('Email is required'),
			v.email('Please enter a valid email')
		),
		password: v.pipe(
			v.string(),
			v.nonEmpty('Password is required'),
			v.minLength(8, 'Password must be at least 8 characters')
		),
		confirmPassword: v.pipe(
			v.string(),
			v.nonEmpty('Please confirm your password')
		)
	}),
	v.forward(
		v.partialCheck(
			[['password'], ['confirmPassword']],
			input => input.password === input.confirmPassword,
			'Passwords do not match'
		),
		['confirmPassword']
	)
)

export type LoginInput = v.InferInput<typeof LoginSchema>
export type RegisterInput = v.InferInput<typeof RegisterSchema>

export function extractFieldErrors<T>(
	issues: v.BaseIssue<unknown>[],
	keys: readonly string[]
): Partial<T> {
	const errors: Record<string, string> = {}
	for (const issue of issues) {
		const key = issue.path?.[0]?.key
		if (typeof key === 'string' && keys.includes(key)) {
			errors[key] = issue.message
		}
	}
	return errors as Partial<T>
}
