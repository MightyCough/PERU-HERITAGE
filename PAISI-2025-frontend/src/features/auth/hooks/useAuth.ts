import { useAuthStore } from '../../../store/useAuthStore'
import { authService } from '../../../services/authService'

/**
 * Hook personalizado para manejar la lógica de autenticación
 * Conecta el store de Zustand con los servicios del backend
 */
export function useAuth() {
    const {
        user,
        isAuthenticated,
        isLoading,
        error,
        setUser,
        setToken,
        logout: logoutStore,
        clearError,
        setLoading,
        setError
    } = useAuthStore()

    /**
     * Iniciar sesión
     */
    const login = async (email: string, password: string) => {
        try {
            setLoading(true)
            clearError()
            
            const response = await authService.login({ email, password })
            
            // El backend retorna: { user: {...}, access_token: "...", refresh_token: "..." }
            const userFormatted = {
                id: response.user.id?.toString() || '1',
                username: response.user.first_name || response.user.email?.split('@')[0] || response.user.email,
                email: response.user.email,
                avatar: response.user.avatar_url
            }
            
            setUser(userFormatted)
            setToken(response.access_token)
            setLoading(false)

            return { success: true }
        } catch (err: any) {
            console.error('Error en login:', err)
            const errorMessage = err.message || 'Error al iniciar sesión'
            setError(errorMessage)
            setLoading(false)
            return { success: false, error: errorMessage }
        }
    }

    /**
     * Registrar nuevo usuario
     */
    const register = async (email: string, password: string) => {
        try {
            setLoading(true)
            clearError()
            
            const response = await authService.register({ 
                email, 
                password,
                password_confirm: password 
            })
            
            // El backend retorna: { user: {...}, access_token: "...", refresh_token: "..." }
            const userFormatted = {
                id: response.user.id?.toString() || '1',
                username: response.user.email?.split('@')[0] || response.user.email,
                email: response.user.email,
                avatar: response.user.avatar_url
            }
            
            setUser(userFormatted)
            setToken(response.access_token)
            setLoading(false)

            return { success: true }
        } catch (err: any) {
            console.error('Error en registro:', err)
            const errorMessage = err.message || 'Error al registrarse'
            setError(errorMessage)
            setLoading(false)
            return { success: false, error: errorMessage }
        }
    }

    /**
     * Cerrar sesión
     */
    const logout = async () => {
        try {
            await authService.logout()
            logoutStore()
            return { success: true }
        } catch (err) {
            console.error('Error en logout:', err)
            // Aunque falle la llamada al backend, cerramos sesión localmente
            logoutStore()
            return { success: false, error: err instanceof Error ? err.message : 'Error al cerrar sesión' }
        }
    }

    /**
     * Verificar sesión actual (para futuras implementaciones)
     */
    const verifySession = async () => {
        try {
            // Por ahora, si hay token consideramos la sesión válida
            return { success: !!user && !!isAuthenticated }
        } catch (err) {
            console.error('Error al verificar sesión:', err)
            logoutStore()
            return { success: false }
        }
    }

    return {
        // Estado
        user,
        isAuthenticated,
        isLoading,
        error,

        // Acciones
        login,
        register,
        logout,
        verifySession,
        clearError
    }
}
