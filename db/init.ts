import {readdir, readFile} from 'node:fs/promises'
import {dirname, join} from 'node:path'
import process from 'node:process'
import {fileURLToPath} from 'node:url'
import {connectAsRoot, loadEnv} from './connect'

const currentDir = dirname(fileURLToPath(import.meta.url))
const schemasDir = join(currentDir, 'schemas')

async function main() {
	const env = loadEnv()
	const db = await connectAsRoot(env)

	try {
		await db.query(`DEFINE NAMESPACE IF NOT EXISTS ${env.namespace}`)
		await db.use({namespace: env.namespace})
		await db.query(`DEFINE DATABASE IF NOT EXISTS ${env.database}`)
		await db.use({namespace: env.namespace, database: env.database})

		console.log(`Connected to ${env.url} (${env.namespace}/${env.database})`)

		const files = await readdir(schemasDir)
		const surqlFiles = files.filter(f => f.endsWith('.surql')).sort()

		if (surqlFiles.length === 0) {
			console.warn('No .surql files found in db/schemas/')
			return
		}

		console.log(`Found ${surqlFiles.length} schema file(s)`)

		for (const file of surqlFiles) {
			const filePath = join(schemasDir, file)
			const content = await readFile(filePath, 'utf-8')
			console.log(`  Running ${file}...`)
			await db.query(content)
		}

		console.log('Schema initialization complete.')
	} catch (error) {
		console.error('Schema initialization failed:', error)
		process.exit(1)
	} finally {
		await db.close()
	}
}

main().catch(() => process.exit(1))
