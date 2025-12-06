import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Tipos para el usuario
export interface User {
  id: string
  username: string
  email: string
  avatar?: string
}

// Tipos para el estado de autenticación
interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  
  // Acciones
  login: (username: string, password: string) => Promise<void>
  register: (username: string, email: string, password: string) => Promise<void>
  logout: () => void
  setUser: (user: User) => void
  setToken: (token: string) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (username: string, _password: string) => {
        set({ isLoading: true, error: null })
        try {
          // TODO: Implementar llamada a la API
          // const response = await api.login(username, _password)
          
          // Simulación temporal
          const mockUser: User = {
            id: '1',
            username,
            email: `${username}@example.com`
          }
          const mockToken = 'mock-token-123'
          
          set({
            user: mockUser,
            token: mockToken,
            isAuthenticated: true,
            isLoading: false
          })
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Error al iniciar sesión',
            isLoading: false
          })
        }
      },

      register: async (username: string, email: string, _password: string) => {
        set({ isLoading: true, error: null })
        try {
          // TODO: Implementar llamada a la API
          // const response = await api.register(username, email, _password)
          
          // Simulación temporal
          const mockUser: User = {
            id: '1',
            username,
            email
          }
          const mockToken = 'mock-token-123'
          
          set({
            user: mockUser,
            token: mockToken,
            isAuthenticated: true,
            isLoading: false
          })
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Error al registrarse',
            isLoading: false
          })
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null
        })
      },

      setUser: (user: User) => {
        set({ user, isAuthenticated: true })
      },

      setToken: (token: string) => {
        set({ token })
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading })
      },

      setError: (error: string | null) => {
        set({ error })
      },

      clearError: () => {
        set({ error: null })
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
)
