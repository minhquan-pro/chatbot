import { useAuthUser } from '@/hooks/useAuthUser'

/** User đang đăng nhập (GET /auth/me qua AuthUserProvider). Giống useAuthUser. */
export function useLoggedInUser() {
  return useAuthUser()
}
