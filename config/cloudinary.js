import { v2 as cloudinary } from 'cloudinary'

let configured = false

const cleanEnvValue = (value) => {
  if (value == null) return ''
  const trimmed = String(value).trim()
  // Support pasted values like "abc123" or 'abc123'
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1).trim()
  }
  return trimmed
}

export const getCloudinary = () => {
  if (!configured) {
    const cloudName = cleanEnvValue(process.env.CLOUDINARY_CLOUD_NAME)
    const apiKey = cleanEnvValue(process.env.CLOUDINARY_API_KEY)
    const apiSecret = cleanEnvValue(process.env.CLOUDINARY_API_SECRET)

    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
    })
    configured = true
  }
  return cloudinary
}
