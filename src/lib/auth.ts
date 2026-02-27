import type {RecordId, Tokens} from 'surrealdb'
import {getDb, TOKEN_KEY} from './surrealdb'

export interface User {
	id: RecordId
	email: string
	name: string
	createdAt: string
}

const ACCESS_NAME = 'account'

function saveToken(tokens: Tokens) {
	localStorage.setItem(TOKEN_KEY, tokens.access)
}

function clearToken() {
	localStorage.removeItem(TOKEN_KEY)
}

export async function setOnlineStatus(online: boolean): Promise<void> {
	const db = await getDb()
	await db.query('UPDATE $auth SET online = $online', {online})
}

export async function signup(
	email: string,
	password: string,
	name: string
): Promise<Tokens> {
	const db = await getDb()
	const tokens = await db.signup({
		access: ACCESS_NAME,
		variables: {email, pass: password, name}
	})
	saveToken(tokens)
	await setOnlineStatus(true)
	return tokens
}

export async function signin(email: string, password: string): Promise<Tokens> {
	const db = await getDb()
	const tokens = await db.signin({
		access: ACCESS_NAME,
		variables: {email, pass: password}
	})
	saveToken(tokens)
	await setOnlineStatus(true)
	return tokens
}

export async function signout(): Promise<void> {
	await setOnlineStatus(false)
	const db = await getDb()
	await db.invalidate()
	clearToken()
}

export async function getUser(): Promise<User | undefined> {
	const token = localStorage.getItem(TOKEN_KEY)
	if (!token) return

	const db = await getDb()
	try {
		const user = await db.auth<User>()
		if (user) await setOnlineStatus(true)
		return user
	} catch {
		clearToken()
		return
	}
}
