import axios from 'axios'
import { API_ENDPOINTS } from '@/config/apiEndpoints'
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  setTokens,
} from '@/libs/authStorage'

const baseURL = import.meta.env.VITE_BASE_API ?? ''

/**
 * Unwrap API envelope `{ data: T }` so `response.data` is `T` (not Axios-only; matches backend shape).
 */
function unwrapEnvelope(response) {
  const body = response.data
  if (body && typeof body === 'object' && 'data' in body) {
    response.data = body.data
  }
  return response
}

const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30_000,
})

let isRefreshing = false
/** @type {Array<{ resolve: (v: string) => void, reject: (e: unknown) => void }>} */
let refreshQueue = []

function subscribeTokenRefresh() {
  return new Promise((resolve, reject) => {
    refreshQueue.push({ resolve, reject })
  })
}

function onRefreshed(token) {
  refreshQueue.forEach(({ resolve }) => resolve(token))
  refreshQueue = []
}

function onRefreshFailed(err) {
  refreshQueue.forEach(({ reject }) => reject(err))
  refreshQueue = []
}

api.interceptors.request.use((config) => {
  if (config.skipAuth) return config
  const token = getAccessToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => unwrapEnvelope(response),
  async (error) => {
    const originalRequest = error.config
    const status = error.response?.status

    if (status !== 401 || !originalRequest) {
      return Promise.reject(error)
    }

    if (originalRequest._retry) {
      clearTokens()
      if (typeof window !== 'undefined') window.location.assign('/login')
      return Promise.reject(error)
    }

    if (originalRequest.skipAuth) {
      return Promise.reject(error)
    }

    const refreshToken = getRefreshToken()
    if (!refreshToken) {
      clearTokens()
      if (typeof window !== 'undefined') window.location.assign('/login')
      return Promise.reject(error)
    }

    if (isRefreshing) {
      return subscribeTokenRefresh().then((token) => {
        originalRequest.headers.Authorization = `Bearer ${token}`
        return api(originalRequest)
      })
    }

    originalRequest._retry = true
    isRefreshing = true

    try {
      const refreshUrl = `${baseURL}${API_ENDPOINTS.auth.refresh}`
      const refreshRes = await axios.post(
        refreshUrl,
        { refresh_token: refreshToken },
        { headers: { 'Content-Type': 'application/json' } },
      )
      let payload = refreshRes.data
      if (payload && typeof payload === 'object' && 'data' in payload) {
        payload = payload.data
      }
      const access_token = payload?.access_token ?? payload?.access
      const new_refresh = payload?.refresh_token ?? payload?.refresh
      if (access_token) {
        setTokens({
          access_token,
          refresh_token: new_refresh ?? refreshToken,
        })
      } else {
        throw new Error('No access_token in refresh response')
      }
      const token = access_token
      onRefreshed(token)
      isRefreshing = false
      originalRequest.headers.Authorization = `Bearer ${token}`
      return api(originalRequest)
    } catch (refreshErr) {
      onRefreshFailed(refreshErr)
      isRefreshing = false
      clearTokens()
      if (typeof window !== 'undefined') window.location.assign('/login')
      return Promise.reject(refreshErr)
    }
  },
)

export default api
