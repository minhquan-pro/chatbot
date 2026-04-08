import { useContext } from 'react'
import { AuthUserContext } from '@/contexts/authUserContext'

export function useAuthUser() {
  const ctx = useContext(AuthUserContext)
  if (!ctx) {
    throw new Error('useAuthUser must be used within AuthUserProvider')
  }
  return ctx
}
