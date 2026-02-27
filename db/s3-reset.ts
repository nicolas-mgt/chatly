import {execFileSync} from 'node:child_process'
import {dirname, join} from 'node:path'
import process from 'node:process'
import {fileURLToPath} from 'node:url'
import {
	DeleteBucketCommand,
	DeleteObjectsCommand,
	ListObjectsV2Command,
	S3Client
} from '@aws-sdk/client-s3'

const currentDir = dirname(fileURLToPath(import.meta.url))

const endpoint = process.env.S3_ENDPOINT
const bucket = process.env.S3_BUCKET

if (!(endpoint && bucket)) {
	console.error('Missing required env vars: S3_ENDPOINT, S3_BUCKET')
	process.exit(1)
}

const s3 = new S3Client({
	endpoint,
	region: 'us-east-1',
	forcePathStyle: true,
	credentials: {
		accessKeyId: process.env.S3_ACCESS_KEY ?? '',
		secretAccessKey: process.env.S3_SECRET_KEY ?? ''
	}
})

async function emptyBucket() {
	let token: string | undefined
	do {
		const list = await s3.send(
			new ListObjectsV2Command({
				Bucket: bucket,
				ContinuationToken: token
			})
		)
		const objects = list.Contents?.map(o => ({Key: o.Key}))
		if (objects && objects.length > 0) {
			await s3.send(
				new DeleteObjectsCommand({
					Bucket: bucket,
					Delete: {Objects: objects}
				})
			)
		}
		token = list.NextContinuationToken
	} while (token)
}

async function main() {
	console.log(`Emptying and deleting bucket "${bucket}"...`)

	try {
		await emptyBucket()
		await s3.send(new DeleteBucketCommand({Bucket: bucket}))
		console.log('Bucket deleted.')
	} catch (err: unknown) {
		const code = (err as {name?: string}).name
		if (code === 'NoSuchBucket') {
			console.log('Bucket did not exist.')
		} else {
			throw err
		}
	}

	console.log('Re-initializing S3...')
	execFileSync('pnpm', ['s3:init'], {
		cwd: join(currentDir, '..'),
		stdio: 'inherit'
	})
}

main().catch(() => process.exit(1))
