import { useCallback, useEffect, useMemo, useState } from 'react'
import api from '@/libs/api'
import { API_ENDPOINTS } from '@/config/apiEndpoints'
import { getAccessToken } from '@/libs/authStorage'
import { AuthUserContext } from '@/contexts/authUserContext'

export function AuthUserProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    const token = getAccessToken()
    if (!token) {
      setUser(null)
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const { data } = await api.get(API_ENDPOINTS.auth.me)
      setUser(data)
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const value = useMemo(
    () => ({ user, loading, refresh, setUser }),
    [user, loading, refresh],
  )

  return (
    <AuthUserContext.Provider value={value}>{children}</AuthUserContext.Provider>
  )
}
