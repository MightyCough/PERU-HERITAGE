import { motion, AnimatePresence } from 'framer-motion'
import { useUIStore } from '../../store/useUIStore'
import { Trophy, AlertTriangle, Star, XCircle } from 'lucide-react'

export function GameMessageModal() {
    const { modalActivo, modalData, closeModal } = useUIStore()

    const isOpen = modalActivo === 'resultado' || modalActivo === 'game-over' || modalActivo === 'pausa'

    if (!isOpen) return null

    const getIcon = () => {
        if (modalActivo === 'game-over') return <Trophy className="w-16 h-16 text-yellow-500" />
        if (modalData?.type === 'bonus') return <Star className="w-16 h-16 text-yellow-400" />
        if (modalData?.type === 'penalty') return <AlertTriangle className="w-16 h-16 text-red-500" />
        if (modalData?.type === 'error') return <XCircle className="w-16 h-16 text-red-500" />
        return <Star className="w-16 h-16 text-blue-500" />
    }

    const getTitle = () => {
        if (modalActivo === 'game-over') return '¡Juego Completado!'
        if (modalData?.type === 'bonus') return '¡Bonificación!'
        if (modalData?.type === 'penalty') return '¡Penalización!'
        if (modalData?.type === 'error') return 'Error'
        return 'Información'
    }

    const handleContinue = () => {
        closeModal()

        // Si es un mensaje de bonus o penalización, intentar avanzar si es necesario
        // Esto depende de si queremos que avance automáticamente o no.
        // Por ahora, asumimos que el avance se maneja externamente o que el usuario debe hacer algo más.
        // Pero para el caso de BONUS en GameBoard, se quitó el setTimeout, así que deberíamos disparar algo aquí
        // O mejor, exponer una función global como se hizo con actualizarSesion.

        if (modalData?.type === 'bonus' && (window as any).avanzarACasillaSiguiente) {
            (window as any).avanzarACasillaSiguiente()
        }
    }

    return (
        <AnimatePresence>
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl text-center relative overflow-hidden"
                >
                    {/* Background decoration */}
                    <div className="absolute top-0 left-0 w-full h-2 bg-linear-to-r from-purple-500 to-pink-500" />

                    <div className="flex justify-center mb-6">
                        <div className="p-4 bg-gray-50 rounded-full shadow-inner">
                            {getIcon()}
                        </div>
                    </div>

                    <h2 className="text-2xl font-bold text-gray-800 mb-4">
                        {getTitle()}
                    </h2>

                    <p className="text-gray-600 text-lg mb-8">
                        {modalData?.message || 'Mensaje del sistema'}
                    </p>

                    <button
                        onClick={handleContinue}
                        className="w-full bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 px-6 rounded-xl transition-all transform hover:scale-105 shadow-lg"
                    >
                        Continuar
                    </button>
                </motion.div>
            </div>
        </AnimatePresence>
    )
}
