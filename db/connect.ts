import process from 'node:process'
import {Surreal} from 'surrealdb'

export interface DbEnv {
	url: string
	namespace: string
	database: string
	username: string
	password: string
}

export function loadEnv(): DbEnv {
	const url = process.env.SURREALDB_URL
	const namespace = process.env.SURREALDB_NAMESPACE
	const database = process.env.SURREALDB_DATABASE
	const username = process.env.SURREALDB_USER
	const password = process.env.SURREALDB_PASS

	if (!(url && namespace && database && username && password)) {
		console.error(
			'Missing required env vars: SURREALDB_URL, SURREALDB_NAMESPACE, SURREALDB_DATABASE, SURREALDB_USER, SURREALDB_PASS'
		)
		process.exit(1)
	}

	return {url, namespace, database, username, password}
}

export async function connectAsRoot(env: DbEnv): Promise<Surreal> {
	const db = new Surreal()
	await db.connect(env.url, {
		authentication: {username: env.username, password: env.password}
	})
	return db
}
