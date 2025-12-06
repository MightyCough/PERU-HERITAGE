// Hook para manejar Google OAuth usando Google Identity Services (Token Model)
import { useState } from 'react'
import { authService } from '../../../services'
import { useAuthStore } from '../../../store/useAuthStore'

// Declarar tipos globales para Google Identity Services
declare global {
    interface Window {
        google?: {
            accounts: {
                oauth2: {
                    initTokenClient: (config: any) => {
                        requestAccessToken: () => void
                    }
                }
            }
        }
    }
}

export const useGoogleAuth = () => {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const { setUser, setToken } = useAuthStore()

    const initGoogleAuth = () => {
        // Cargar el script de Google Identity Services si no está cargado
        if (!document.getElementById('google-oauth-script')) {
            const script = document.createElement('script')
            script.id = 'google-oauth-script'
            script.src = 'https://accounts.google.com/gsi/client'
            script.async = true
            script.defer = true
            document.body.appendChild(script)
        }
    }

    const handleGoogleLogin = async (): Promise<any> => {
        setIsLoading(true)
        setError(null)

        try {
            const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID

            if (!clientId) {
                throw new Error('Google Client ID no configurado')
            }

            // Esperar a que el script de Google se cargue
            await waitForGoogleScript()

            return new Promise((resolve, reject) => {
                if (!window.google?.accounts?.oauth2) {
                    setError('Google Identity Services no está disponible')
                    setIsLoading(false)
                    reject(new Error('Google Identity Services no está disponible'))
                    return
                }

                try {
                    // Inicializar Token Client (Flujo Implícito para botones personalizados)
                    const client = window.google.accounts.oauth2.initTokenClient({
                        client_id: clientId,
                        scope: 'email profile openid',
                        callback: async (tokenResponse: any) => {
                            if (tokenResponse.error) {
                                console.error('Error en Google Auth:', tokenResponse)
                                setError('Error al autenticar con Google')
                                setIsLoading(false)
                                reject(tokenResponse)
                                return
                            }

                            if (tokenResponse.access_token) {
                                try {
                                    // Enviar access_token al backend
                                    const result = await authService.googleAuth({ token: tokenResponse.access_token })
                                    
                                    // Actualizar el store con los datos del usuario
                                    const userFormatted = {
                                        id: result.user.id?.toString() || '1',
                                        username: result.user.first_name || result.user.email?.split('@')[0] || result.user.email,
                                        email: result.user.email,
                                        avatar: result.user.avatar_url
                                    }
                                    setUser(userFormatted)
                                    setToken(result.access_token)

                                    setIsLoading(false)
                                    resolve(result)
                                } catch (err: any) {
                                    console.error('Error enviando token al backend:', err)
                                    setError(err.message || 'Error al autenticar con Google')
                                    setIsLoading(false)
                                    reject(err)
                                }
                            }
                        },
                    })

                    // Solicitar token (abre popup)
                    client.requestAccessToken()

                } catch (err: any) {
                    console.error('Error al inicializar Google Token Client:', err)
                    setError(err.message || 'Error al inicializar Google')
                    setIsLoading(false)
                    reject(err)
                }
            })
        } catch (err: any) {
            console.error('Error en handleGoogleLogin:', err)
            setError(err.message || 'Error al iniciar sesión con Google')
            setIsLoading(false)
            throw err
        }
    }

    // Función auxiliar para esperar a que el script de Google se cargue
    const waitForGoogleScript = (): Promise<void> => {
        return new Promise((resolve, reject) => {
            if (window.google?.accounts?.oauth2) {
                resolve()
                return
            }

            let attempts = 0
            const maxAttempts = 50 // 5 segundos máximo

            const interval = setInterval(() => {
                attempts++
                
                if (window.google?.accounts?.oauth2) {
                    clearInterval(interval)
                    resolve()
                } else if (attempts >= maxAttempts) {
                    clearInterval(interval)
                    reject(new Error('Timeout esperando Google Identity Services'))
                }
            }, 100)
        })
    }

    return {
        handleGoogleLogin,
        isLoading,
        error,
        initGoogleAuth,
    }
}
