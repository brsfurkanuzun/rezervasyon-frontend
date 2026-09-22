import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AuthResponse, User } from '../../shared/types/api'
import { bindAuthTokens } from '../../shared/api/client'

interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  setSession: (auth: AuthResponse) => void
  clearSession: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      setSession: (auth) =>
        set({
          user: auth.user,
          accessToken: auth.accessToken,
          refreshToken: auth.refreshToken,
        }),
      clearSession: () => set({ user: null, accessToken: null, refreshToken: null }),
    }),
    { name: 'randevu-auth' },
  ),
)

bindAuthTokens({
  getAccessToken: () => useAuthStore.getState().accessToken,
  getRefreshToken: () => useAuthStore.getState().refreshToken,
  setTokens: (access, refresh) => {
    if (!access) {
      useAuthStore.getState().clearSession()
      return
    }
    useAuthStore.setState({
      accessToken: access,
      ...(refresh !== undefined ? { refreshToken: refresh } : {}),
    })
  },
})
