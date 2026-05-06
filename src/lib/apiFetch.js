import { authHeaders, handleUnauthorizedResponse } from './auth'

/**
 * Shared fetch helper for authenticated API calls.
 * - Adds Bearer token automatically.
 * - Redirects to login on 401 when navigate is provided.
 * - Parses JSON safely (empty/invalid JSON => {}).
 */
export async function apiFetch(url, options = {}, navigate) {
  const { headers = {}, ...rest } = options

  const response = await fetch(url, {
    ...rest,
    headers: {
      ...authHeaders(),
      ...headers,
    },
  })

  if (navigate && handleUnauthorizedResponse(response, navigate)) {
    return { response, data: {}, unauthorized: true }
  }

  const data = await response.json().catch(() => ({}))
  return { response, data, unauthorized: false }
}
