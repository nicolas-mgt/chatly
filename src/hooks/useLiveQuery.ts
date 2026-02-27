import {useEffect, useRef} from 'react'
import type {LiveMessage, LiveSubscription} from 'surrealdb'
import {Table} from 'surrealdb'
import {getDb} from '@/lib/surrealdb'

export type LiveHandler = (message: LiveMessage) => void

export function useLiveQuery(
	table: string,
	handler: LiveHandler,
	enabled = true
): void {
	const handlerRef = useRef(handler)
	handlerRef.current = handler

	useEffect(() => {
		if (!enabled) return

		let cancelled = false
		let sub: LiveSubscription | undefined
		let unsubscribe: (() => void) | undefined

		async function start() {
			const db = await getDb()
			if (cancelled) return

			sub = await db.live(new Table(table))
			if (cancelled) {
				sub.kill()
				return
			}

			unsubscribe = sub.subscribe(msg => {
				handlerRef.current(msg)
			})
		}

		// biome-ignore lint/suspicious/noEmptyBlockStatements: intentional fire-and-forget
		start().catch(() => {})

		return () => {
			cancelled = true
			unsubscribe?.()
			sub?.kill()
		}
	}, [table, enabled])
}
