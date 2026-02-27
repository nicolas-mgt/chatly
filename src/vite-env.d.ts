/// <reference types="vite/client" />

import type DetachedWindowApi from 'happy-dom/lib/window/DetachedWindowAPI.js'

declare global {
	interface ImportMetaEnv {
		readonly VITE_SURREALDB_URL: string
		readonly VITE_SURREALDB_NAMESPACE: string
		readonly VITE_SURREALDB_DATABASE: string
		readonly VITE_S3_ENDPOINT: string
		readonly VITE_S3_BUCKET: string
	}

	interface Window {
		happyDOM?: DetachedWindowApi
	}
}
