const USER_KEY = 'sesh_tracker_user'
const TOKEN_KEY = 'sesh_tracker_token'
export const SESSION_EXPIRED_MESSAGE = 'Session expired. Please log in again.'

export function saveAuth(user, token) {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function getUser() {
  const raw = localStorage.getItem(USER_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function logout() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

/** Use with fetch: `{ headers: { ...authHeaders() } }` — empty object if not logged in. */
export function authHeaders() {
  const token = getToken()
  if (!token) return {}
  return { Authorization: `Bearer ${token}` }
}

/**
 * If response is 401, clear local auth and redirect to login.
 * Returns true when redirect happened (caller should stop handling request).
 */
export function handleUnauthorizedResponse(response, navigate) {
  if (response?.status !== 401) return false
  logout()
  navigate('/login', {
    replace: true,
    state: { message: SESSION_EXPIRED_MESSAGE },
  })
  return true
}
