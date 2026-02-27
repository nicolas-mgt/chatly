import {execFileSync} from 'node:child_process'
import {dirname, join} from 'node:path'
import process from 'node:process'
import {fileURLToPath} from 'node:url'
import {connectAsRoot, loadEnv} from './connect'

const currentDir = dirname(fileURLToPath(import.meta.url))

async function main() {
	const env = loadEnv()
	const db = await connectAsRoot(env)

	try {
		await db.use({namespace: env.namespace})
		await db.query(`REMOVE DATABASE IF EXISTS ${env.database}`)
		console.log(`Removed database ${env.namespace}/${env.database}`)
	} catch (error) {
		console.error('Database reset failed:', error)
		process.exit(1)
	} finally {
		await db.close()
	}

	console.log('Re-initializing schema...')
	execFileSync('pnpm', ['db:init'], {
		cwd: join(currentDir, '..'),
		stdio: 'inherit'
	})
}

main().catch(() => process.exit(1))
