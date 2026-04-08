const ACCESS = 'access_token'
const REFRESH = 'refresh_token'

export function getAccessToken() {
  return localStorage.getItem(ACCESS)
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH)
}

export function setTokens({ access_token, refresh_token }) {
  if (access_token != null) localStorage.setItem(ACCESS, access_token)
  if (refresh_token != null) localStorage.setItem(REFRESH, refresh_token)
}

export function clearTokens() {
  localStorage.removeItem(ACCESS)
  localStorage.removeItem(REFRESH)
}
