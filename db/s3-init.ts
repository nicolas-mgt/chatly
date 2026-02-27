import process from 'node:process'
import {
	CreateBucketCommand,
	PutBucketPolicyCommand,
	S3Client
} from '@aws-sdk/client-s3'

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

async function main() {
	console.log(`Creating bucket "${bucket}" at ${endpoint}...`)

	try {
		await s3.send(new CreateBucketCommand({Bucket: bucket}))
		console.log('Bucket created.')
	} catch (err: unknown) {
		const code = (err as {name?: string}).name
		if (code === 'BucketAlreadyOwnedByYou' || code === 'BucketAlreadyExists') {
			console.log('Bucket already exists.')
		} else {
			throw err
		}
	}

	const policy = JSON.stringify({
		Version: '2012-10-17',
		Statement: [
			{
				Sid: 'PublicRead',
				Effect: 'Allow',
				Principal: '*',
				Action: ['s3:GetObject'],
				Resource: [`arn:aws:s3:::${bucket}/*`]
			}
		]
	})

	await s3.send(new PutBucketPolicyCommand({Bucket: bucket, Policy: policy}))
	console.log('Public-read policy applied.')

	console.log('S3 initialization complete.')
}

void main()
