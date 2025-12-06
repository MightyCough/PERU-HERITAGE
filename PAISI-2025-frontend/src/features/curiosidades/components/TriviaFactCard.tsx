import { Lightbulb, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'

interface TriviaFactCardProps {
    title?: string
    content: string
    imageUrl?: string
    isVisible?: boolean
    theme?: string
    className?: string
    duration?: number // Duración en segundos para rotación automática
    onTimeout?: () => void // Callback cuando termina el tiempo
}

// Mapa de colores por tema
const themeColors: Record<string, { header: string; accent: string; border: string }> = {
    Historia: { header: 'from-amber-700 to-red-900', accent: 'text-amber-400', border: 'border-amber-500' },
    Tradición: { header: 'from-purple-600 to-indigo-900', accent: 'text-purple-300', border: 'border-purple-500' },
    Arquitectura: { header: 'from-stone-500 to-stone-800', accent: 'text-stone-300', border: 'border-stone-500' },
    Arqueología: { header: 'from-emerald-700 to-teal-900', accent: 'text-emerald-300', border: 'border-emerald-500' },
    Guerra: { header: 'from-yellow-700 to-orange-900', accent: 'text-yellow-400', border: 'border-yellow-500' },
    Gastronomía: { header: 'from-lime-600 to-green-800', accent: 'text-lime-300', border: 'border-lime-500' },
    Leyenda: { header: 'from-rose-700 to-pink-900', accent: 'text-rose-300', border: 'border-rose-500' },
    Religión: { header: 'from-violet-700 to-fuchsia-900', accent: 'text-violet-300', border: 'border-violet-500' },
    Mito: { header: 'from-cyan-600 to-blue-900', accent: 'text-cyan-300', border: 'border-cyan-500' },
    Comida: { header: 'from-orange-600 to-red-700', accent: 'text-orange-200', border: 'border-orange-500' },
    default: { header: 'from-amber-600 to-red-700', accent: 'text-amber-400', border: 'border-amber-500' }
}

export function TriviaFactCard({ 
    title = "Sabías que...", 
    content, 
    imageUrl, 
    isVisible = true,
    theme = "Cultura",
    className = "",
    duration = 0,
    onTimeout
}: TriviaFactCardProps) {
    const [isHovered, setIsHovered] = useState(false)
    const [isFinished, setIsFinished] = useState(false)
    const colors = themeColors[theme] || themeColors.default

    // Resetear el estado de finalizado cuando cambia el contenido
    useEffect(() => {
        setIsFinished(false)
    }, [title, content])

    // Si termina la animación pero estaba en hover, esperar a que salga del hover para cambiar
    useEffect(() => {
        if (!isHovered && isFinished && onTimeout) {
            onTimeout()
        }
    }, [isHovered, isFinished, onTimeout])

    return (
        <AnimatePresence mode="wait">
            {isVisible && (
                <motion.div 
                    key={title}
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -20 }}
                    transition={{ duration: 0.4, type: "spring", stiffness: 300, damping: 30 }}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    className={`w-full max-w-sm mx-auto lg:max-w-none ${className}`}
                >
                    {/* Main Card Container */}
                    <motion.div 
                        animate={isHovered ? { y: -5 } : { y: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        className="bg-[#2A2A24] rounded-3xl overflow-hidden shadow-2xl border-2 hover:shadow-2xl transition-all duration-300 relative group flex flex-col h-full"
                        style={{ borderColor: isHovered ? colors.border : '#4A4A3F' }}
                    >
                        {/* Animated Background Glow */}
                        <motion.div 
                            animate={isHovered ? { opacity: 0.8 } : { opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className={`absolute inset-0 bg-linear-to-br ${colors.header} opacity-10 pointer-events-none z-20`}
                        />

                        {/* Full Height Image Area with Overlay */}
                        <div className="relative flex-1 min-h-96 overflow-hidden rounded-3xl">
                            {/* Background Image */}
                            {imageUrl ? (
                                <motion.img 
                                    animate={isHovered ? { scale: 1.05 } : { scale: 1 }}
                                    transition={{ duration: 0.3 }}
                                    src={imageUrl} 
                                    alt="Trivia" 
                                    className="absolute inset-0 w-full h-full object-cover"
                                />
                            ) : (
                                <div className="absolute inset-0 bg-linear-to-r from-gray-700 to-gray-800" />
                            )}
                            
                            {/* Dark Overlay - always present */}
                            <div className="absolute inset-0 bg-black/50" />

                            {/* Content Overlay - appears on hover */}
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={isHovered ? { opacity: 1 } : { opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                className="absolute inset-0 bg-linear-to-t from-black/90 via-black/50 to-transparent p-4 sm:p-6 md:p-8 flex flex-col justify-end z-10 pointer-events-none"
                            >
                                <div className="mb-3 sm:mb-4 flex items-center gap-2">
                                    <motion.div 
                                        animate={isHovered ? { scaleX: 1.3 } : { scaleX: 1 }}
                                        className={`h-1 w-2 rounded-full ${colors.accent}`}
                                    />
                                    <span className={`text-xs font-semibold ${colors.accent} uppercase tracking-wider`}>
                                        {theme}
                                    </span>
                                </div>
                                
                                <motion.p 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={isHovered ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                                    transition={{ delay: 0.1, duration: 0.3 }}
                                    className="text-gray-200 text-xs sm:text-sm md:text-base leading-relaxed"
                                >
                                    {content}
                                </motion.p>
                            </motion.div>

                            {/* Title and Icon - always visible */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center z-10 p-4">
                                <motion.div 
                                    animate={isHovered ? { rotate: 20, scale: 1.2 } : { rotate: 0, scale: 1 }}
                                    transition={{ type: "spring", stiffness: 400 }}
                                    className="bg-white/20 p-2 rounded-full mb-3 backdrop-blur-sm border border-white/30"
                                >
                                    <motion.div
                                        animate={isHovered ? { y: [0, -3, 0] } : {}}
                                        transition={{ repeat: isHovered ? Infinity : 0, duration: 0.6 }}
                                    >
                                        <Lightbulb className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-300" />
                                    </motion.div>
                                </motion.div>
                                <h3 className="text-white font-bold text-lg sm:text-2xl md:text-3xl tracking-wide shadow-lg px-4 text-center line-clamp-2">
                                    {title}
                                </h3>
                            </div>

                            {/* Sparkles on Hover */}
                            {isHovered && (
                                <>
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0 }}
                                        className="absolute top-4 right-4 z-30"
                                    >
                                        <Sparkles className="w-6 h-6 text-yellow-300" />
                                    </motion.div>
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0 }}
                                        className="absolute bottom-4 left-4 z-30"
                                    >
                                        <Sparkles className="w-5 h-5 text-yellow-200" />
                                    </motion.div>
                                </>
                            )}
                        </div>
                        
                        {/* Footer / Progress Bar */}
                        <div className="relative h-1.5 w-full bg-gray-800/50 shrink-0 z-20">
                            {/* Barra de progreso animada */}
                            {duration > 0 && (
                                <motion.div 
                                    key={`progress-${title}`} // Forzar reinicio de animación al cambiar título
                                    initial={{ scaleX: 0 }}
                                    animate={{ scaleX: isHovered ? undefined : 1 }}
                                    transition={{ duration: duration, ease: "linear" }}
                                    onAnimationComplete={() => {
                                        setIsFinished(true)
                                        if (onTimeout && !isHovered) onTimeout()
                                    }}
                                    className={`absolute inset-0 h-full bg-linear-to-r ${colors.header} origin-left`}
                                />
                            )}
                            {/* Decoración estática si no hay duración */}
                            {duration <= 0 && (
                                <motion.div 
                                    animate={isHovered ? { scaleX: 1 } : { scaleX: 0.8 }}
                                    transition={{ duration: 0.3 }}
                                    className={`h-full w-full bg-linear-to-r ${colors.header}`}
                                />
                            )}
                        </div>

                        {/* Animated Border Glow */}
                        <motion.div 
                            animate={isHovered ? { opacity: 0.5 } : { opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className={`absolute inset-0 rounded-3xl border-2 pointer-events-none ${colors.border}`}
                        />
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
