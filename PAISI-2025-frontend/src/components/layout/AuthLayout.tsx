import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

interface AuthLayoutProps {
    children: ReactNode
    illustration?: {
        icon?: ReactNode
        imageSrc?: string
        imageAlt?: string
        title: string
        description: string
        gradientFrom?: string
        gradientVia?: string
        gradientTo?: string
    }
}

/**
 * AuthLayout - Layout de 2 columnas para páginas de autenticación
 * Columna izquierda: formulario (children)
 * Columna derecha: ilustración o imagen |Falta agregar que sea como en el mockup|
 */
export function AuthLayout({ children, illustration }: AuthLayoutProps) {
    const defaultIllustration = {
        icon: (
            <svg className="w-32 h-32" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 2L15 8L22 9L17 14L18 21L12 18L6 21L7 14L2 9L9 8L12 2Z" />
            </svg>
        ),
        imageSrc: undefined,
        imageAlt: undefined,
        title: 'Cultura Huanuqueña',
        description: 'Descubre las vibrantes tradiciones y la rica herencia de Huánuco',
        gradientFrom: 'from-orange-500',
        gradientVia: 'via-red-600',
        gradientTo: 'to-purple-700'
    }

    const illustrationData = illustration || defaultIllustration

    return (
        <div className="h-screen w-full grid grid-cols-1 md:grid-cols-2 overflow-hidden">
            {/* Left column - Content (Form) */}
            <div className="flex items-center justify-center p-8 bg-linear-to-br from-gray-900 to-black h-full overflow-y-auto">
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="w-full max-w-md"
                >
                    {children}
                </motion.div>
            </div>

            {/* Right column - Illustration */}
            <div className="hidden md:flex items-center justify-center p-8 bg-linear-to-br from-gray-900 to-gray-800 h-full">
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="relative rounded-3xl overflow-hidden p-8 border border-gray-700 w-full max-w-lg"
                >
                    <div className="relative rounded-2xl overflow-hidden">
                        <div className={`absolute inset-0 bg-linear-to-br ${illustrationData.gradientFrom} ${illustrationData.gradientVia} ${illustrationData.gradientTo} opacity-30`}></div>
                        <div className="relative py-20 flex items-center justify-center">
                            <div className="text-center text-white">
                                {illustrationData.imageSrc ? (
                                    <div className="w-48 h-48 mx-auto mb-4 rounded-full overflow-hidden bg-gray-800 flex items-center justify-center">
                                        <img
                                            src={illustrationData.imageSrc}
                                            alt={illustrationData.imageAlt || illustrationData.title}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                ) : (
                                    <div className={`w-48 h-48 mx-auto mb-4 rounded-full bg-linear-to-br ${illustrationData.gradientFrom} ${illustrationData.gradientVia} ${illustrationData.gradientTo} flex items-center justify-center`}>
                                        {illustrationData.icon}
                                    </div>
                                )}
                                <h3 className="text-2xl font-bold mb-2">{illustrationData.title}</h3>
                                <p className="text-gray-300 text-sm px-4">{illustrationData.description}</p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
