// Página de callback para Google OAuth
import { useEffect } from 'react'

export default function GoogleCallback() {
    useEffect(() => {
        // Extraer el token de la URL (hash fragment)
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        const accessToken = hashParams.get('access_token')
        const error = hashParams.get('error')

        if (accessToken) {
            // Enviar el token a la ventana principal
            if (window.opener) {
                window.opener.postMessage(
                    {
                        type: 'GOOGLE_AUTH_SUCCESS',
                        token: accessToken
                    },
                    window.location.origin
                )
                window.close()
            }
        } else if (error) {
            // Enviar el error a la ventana principal
            if (window.opener) {
                window.opener.postMessage(
                    {
                        type: 'GOOGLE_AUTH_ERROR',
                        error: error
                    },
                    window.location.origin
                )
                window.close()
            }
        }
    }, [])

    return (
        <div className="min-h-screen bg-linear-to-br from-gray-900 to-black flex items-center justify-center">
            <div className="text-center">
                <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-white text-lg">Autenticando con Google...</p>
            </div>
        </div>
    )
}
