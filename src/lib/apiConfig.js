const DEFAULT_API_URL = 'http://localhost:5001'

/**
 * Frontend API base URL.
 * - Local desktop default: http://localhost:5001
 * - Local iPhone testing: set VITE_API_URL=http://YOUR_MAC_LAN_IP:5001 in .env
 * - Production later: point VITE_API_URL to your deployed backend URL.
 */
export const API_URL = (import.meta.env.VITE_API_URL || DEFAULT_API_URL).replace(
  /\/+$/,
  '',
)

export const API_ROUTES = {
  auth: {
    login: `${API_URL}/api/auth/login`,
    register: `${API_URL}/api/auth/register`,
  },
  sessions: `${API_URL}/api/sessions`,
}
