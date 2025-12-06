import { useState, useEffect } from 'react'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { useGoogleAuth } from '../hooks/useGoogleAuth'
import { useNavigate } from 'react-router-dom'

interface RegisterFormProps {
    onSubmit: (email: string, password: string) => Promise<void>
    isLoading?: boolean
    error?: string | null
    onToggle?: () => void
}

export function RegisterForm({ onSubmit, isLoading, error, onToggle }: RegisterFormProps) {
    const navigate = useNavigate()
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: ''
    })
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [validationError, setValidationError] = useState<string | null>(null)
    const { handleGoogleLogin, isLoading: googleLoading, error: googleError, initGoogleAuth } = useGoogleAuth()

    useEffect(() => {
        initGoogleAuth()
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setValidationError(null)

        // Validación básica
        if (formData.password !== formData.confirmPassword) {
            setValidationError('Las contraseñas no coinciden')
            return
        }

        if (formData.password.length < 8) {
            setValidationError('La contraseña debe tener al menos 8 caracteres')
            return
        }

        await onSubmit(formData.email, formData.password)
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
        // Limpiar error de validación al escribir
        if (validationError) {
            setValidationError(null)
        }
    }

    const handleGoogleSignUp = async () => {
        try {
            await handleGoogleLogin()
            navigate('/seleccion-personaje')
        } catch (err) {
            console.error('Google Sign Up error:', err)
        }
    }

    const displayError = validationError || error || googleError

    return (
        <>
            <div className="mb-4 md:mb-8">
                <h2 className="text-white text-xs md:text-sm font-medium mb-1 md:mb-2 tracking-wide">Cultura Huanuqueña Interactiva</h2>
                <h1 className="text-white text-3xl md:text-5xl font-bold mb-2 md:mb-4">¡Únete a nosotros!</h1>
                <p className="text-gray-400 text-xs md:text-sm">Crea tu cuenta y comienza tu aventura por Huánuco.</p>
            </div>

            <button
                type="button"
                onClick={handleGoogleSignUp}
                disabled={googleLoading || isLoading}
                className="w-full bg-gray-800 hover:bg-gray-700 text-white py-2.5 md:py-3 px-4 rounded-xl flex items-center justify-center gap-3 transition-all duration-300 mb-3 md:mb-6 border border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {googleLoading ? (
                    <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Autenticando...
                    </>
                ) : (
                    <>
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Regístrate con Google
                    </>
                )}
            </button>

            <div className="relative mb-3 md:mb-6">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-700"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-linear-to-br from-gray-900 to-black text-gray-500">OR</span>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-2 md:space-y-4">
                <div>
                    <label className="block text-white text-xs md:text-sm font-medium mb-1 md:mb-2">Email</label>
                    <div className="relative">
                        <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4 md:w-5 md:h-5" />
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="tu@email.com"
                            required
                            className="w-full bg-gray-800 text-white pl-10 md:pl-12 pr-4 py-2.5 md:py-3 text-sm md:text-base rounded-xl border border-gray-700 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-white text-xs md:text-sm font-medium mb-1 md:mb-2">Contraseña</label>
                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4 md:w-5 md:h-5" />
                        <input
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Mínimo 8 caracteres"
                            required
                            minLength={8}
                            className="w-full bg-gray-800 text-white pl-10 md:pl-12 pr-10 md:pr-12 py-2.5 md:py-3 text-sm md:text-base rounded-xl border border-gray-700 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all"
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-white transition-colors">
                            {showPassword ? <EyeOff className="w-4 h-4 md:w-5 md:h-5" /> : <Eye className="w-4 h-4 md:w-5 md:h-5" />}
                        </button>
                    </div>
                </div>

                <div>
                    <label className="block text-white text-xs md:text-sm font-medium mb-1 md:mb-2">Confirmar Contraseña</label>
                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4 md:w-5 md:h-5" />
                        <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder="Confirma tu contraseña"
                            required
                            minLength={8}
                            className="w-full bg-gray-800 text-white pl-10 md:pl-12 pr-10 md:pr-12 py-2.5 md:py-3 text-sm md:text-base rounded-xl border border-gray-700 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all"
                        />
                        <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-white transition-colors">
                            {showConfirmPassword ? <EyeOff className="w-4 h-4 md:w-5 md:h-5" /> : <Eye className="w-4 h-4 md:w-5 md:h-5" />}
                        </button>
                    </div>
                </div>

                {displayError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                        {displayError}
                    </div>
                )}

                <button type="submit" disabled={isLoading} className="w-full bg-linear-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white py-2.5 md:py-3 px-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-sm md:text-base">
                    {isLoading ? (
                        <div className="flex items-center justify-center gap-2">
                            <div className="w-4 h-4 md:w-5 md:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Registrando...
                        </div>
                    ) : (
                        'Registrarse'
                    )}
                </button>
            </form>

            <div className="mt-3 md:mt-6 text-center">
                <p className="text-gray-400 text-xs md:text-sm">¿Ya tienes una cuenta? <button onClick={() => onToggle?.()} className="text-red-400 hover:text-red-300 font-semibold transition-colors">Inicia sesión</button></p>
            </div>

            <div className="mt-4 md:mt-8 flex justify-center gap-6">
                <button className="text-gray-500 hover:text-white text-xs md:text-sm transition-colors">Sobre Nosotros</button>
                <button className="text-gray-500 hover:text-white text-xs md:text-sm transition-colors">Ayuda</button>
            </div>
        </>
    )
}
