export async function uploadImage(file: File): Promise<string> {
	const key = `${crypto.randomUUID()}-${file.name}`
	const endpoint = import.meta.env.VITE_S3_ENDPOINT
	const bucket = import.meta.env.VITE_S3_BUCKET
	const url = `${endpoint}/${bucket}/${key}`

	const res = await fetch(url, {
		method: 'PUT',
		body: file,
		headers: {'Content-Type': file.type}
	})

	if (!res.ok) {
		throw new Error(`Upload failed: ${res.status}`)
	}

	return url
}
