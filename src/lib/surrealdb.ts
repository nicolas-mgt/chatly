import {Surreal} from 'surrealdb'

export const TOKEN_KEY = 'chatly_token'

let db: Surreal | null = null

export async function getDb(): Promise<Surreal> {
	if (db) return db

	db = new Surreal()

	await db.connect(import.meta.env.VITE_SURREALDB_URL, {
		authentication: () => localStorage.getItem(TOKEN_KEY),
		database: import.meta.env.VITE_SURREALDB_DATABASE,
		namespace: import.meta.env.VITE_SURREALDB_NAMESPACE
	})

	return db
}

export async function closeDb(): Promise<void> {
	if (db) {
		await db.close()
		db = null
	}
}
