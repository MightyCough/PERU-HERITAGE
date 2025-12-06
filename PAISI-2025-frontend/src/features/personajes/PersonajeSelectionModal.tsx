import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight, Check, User, X } from "lucide-react"
import { useAuthStore } from "../../store/useAuthStore"
import { gameplayService, type Avatar } from "../../services/gameplayService"
import { useUIStore } from "../../store/useUIStore"
import { useNavigate } from "react-router-dom"

interface PersonajeSelectionModalProps {
    isOpen: boolean
    onPersonajeSelected: (personaje: any) => void
    onClose?: () => void
}

export function PersonajeSelectionModal({ isOpen, onPersonajeSelected, onClose }: PersonajeSelectionModalProps) {
    const { user, logout } = useAuthStore()
    const { addNotification } = useUIStore()
    const navigate = useNavigate()
    
    const [avatares, setAvatares] = useState<Avatar[]>([])
    const [loading, setLoading] = useState(false)
    const [selectedId, setSelectedId] = useState<number | null>(null)
    const [currentIndex, setCurrentIndex] = useState(0)

    // Cargar avatares del backend
    useEffect(() => {
        if (isOpen) {
            const loadAvatares = async () => {
                setLoading(true)
                try {
                    const data = await gameplayService.obtenerAvatares()
                    console.log('✅ Avatares cargados:', data)
                    setAvatares(data)
                    if (data.length > 0) {
                        setSelectedId(data[0].id)
                    }
                } catch (error) {
                    console.error('Error al cargar avatares:', error)
                    addNotification({
                        type: 'error',
                        message: 'Error al cargar los personajes disponibles'
                    })
                } finally {
                    setLoading(false)
                }
            }
            loadAvatares()
        }
    }, [isOpen])

    const handleSelect = async () => {
        if (!selectedId || !user?.id) return

        setLoading(true)
        try {
            console.log('🎮 Creando nueva partida con avatar:', selectedId)
            
            const selectedAvatar = avatares.find(a => a.id === selectedId)
            if (!selectedAvatar) throw new Error("Avatar no encontrado")

            await gameplayService.iniciarPartida(selectedAvatar.name)
            
            addNotification({
                type: 'success',
                message: '¡Partida creada exitosamente!'
            })
            
            onPersonajeSelected(selectedAvatar)
            navigate('/juego')
            
        } catch (error: any) {
            console.error('Error al crear partida:', error)
            addNotification({
                type: 'error',
                message: error.message || 'Error al crear la partida'
            })
        } finally {
            setLoading(false)
        }
    }

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev + 1) % avatares.length)
        setSelectedId(avatares[(currentIndex + 1) % avatares.length].id)
    }

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev - 1 + avatares.length) % avatares.length)
        setSelectedId(avatares[(currentIndex - 1 + avatares.length) % avatares.length].id)
    }

    const handleClose = () => {
        if (onClose) {
            onClose()
        }
    }

    if (!isOpen) return null

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 max-w-5xl w-full shadow-2xl max-h-[90vh] overflow-y-auto relative"
                >
                    {/* Botón de cerrar */}
                    <button
                        onClick={handleClose}
                        className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10"
                        aria-label="Cerrar"
                    >
                        <X size={24} />
                    </button>

                    <div className="text-center mb-12 mt-8">
                        <h2 className="text-4xl font-bold text-white mb-3">Elige tu Héroe</h2>
                        <p className="text-lg text-white/70">Selecciona el personaje con el que recorrerás el Perú</p>
                    </div>

                    {loading && avatares.length === 0 ? (
                        <div className="flex justify-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
                        </div>
                    ) : (
                        <div className="relative flex items-center justify-center gap-8 mb-12">
                            {/* Botón Anterior */}
                            <button
                                onClick={prevSlide}
                                disabled={avatares.length === 0}
                                className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors disabled:opacity-50 hidden md:block"
                            >
                                <ChevronLeft size={36} />
                            </button>

                            {/* Carrusel / Grid - IMÁGENES MÁS GRANDES */}
                            <div className="flex flex-wrap justify-center gap-10 md:gap-12 py-8">
                                {avatares.map((avatar) => (
                                    <motion.div
                                        key={avatar.id}
                                        onClick={() => setSelectedId(avatar.id)}
                                        whileHover={{ scale: 1.08 }}
                                        whileTap={{ scale: 0.95 }}
                                        className={`
                                            relative cursor-pointer group rounded-2xl overflow-visible transition-all duration-300
                                            ${selectedId === avatar.id 
                                                ? 'ring-4 ring-rose-500 shadow-2xl shadow-rose-500/50 scale-105' 
                                                : 'opacity-70 hover:opacity-100 hover:ring-2 hover:ring-white/50'
                                            }
                                        `}
                                    >
                                        {/* Contenedor de imagen - TAMAÑO AUMENTADO Y FIJO */}
                                        <div className="w-48 h-48 md:w-56 md:h-56 flex items-center justify-center p-4 bg-black/20 rounded-2xl backdrop-blur-sm">
                                            <img
                                                src={avatar.image_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${avatar.name}`}
                                                alt={avatar.name}
                                                className="w-full h-full object-contain drop-shadow-2xl"
                                            />
                                        </div>
                                        
                                        {/* Nombre del personaje */}
                                        <div className="absolute -bottom-10 left-0 right-0 text-center">
                                            <p className="text-white font-bold text-base bg-black/70 px-4 py-2 rounded-full inline-block shadow-lg">
                                                {avatar.name}
                                            </p>
                                        </div>
                                        
                                        {/* Check de selección */}
                                        {selectedId === avatar.id && (
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                className="absolute -top-3 -right-3 bg-rose-500 rounded-full p-2.5 shadow-xl border-4 border-white/20"
                                            >
                                                <Check size={24} className="text-white" strokeWidth={3} />
                                            </motion.div>
                                        )}
                                    </motion.div>
                                ))}
                            </div>

                            {/* Botón Siguiente */}
                            <button
                                onClick={nextSlide}
                                disabled={avatares.length === 0}
                                className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors disabled:opacity-50 hidden md:block"
                            >
                                <ChevronRight size={36} />
                            </button>
                        </div>
                    )}

                    {/* Descripción del personaje seleccionado */}
                    {selectedId && avatares.find(a => a.id === selectedId) && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white/5 rounded-xl p-8 mb-8 text-center max-w-2xl mx-auto mt-16"
                        >
                            <h3 className="text-2xl font-bold text-rose-400 mb-3">
                                {avatares.find(a => a.id === selectedId)?.name}
                            </h3>
                            <p className="text-white/80 text-lg leading-relaxed">
                                {avatares.find(a => a.id === selectedId)?.description || "Un valiente aventurero listo para explorar la historia del Perú."}
                            </p>
                        </motion.div>
                    )}

                    <div className="flex justify-center">
                        <button
                            onClick={handleSelect}
                            disabled={!selectedId || loading}
                            className={`
                                px-10 py-5 rounded-xl font-bold text-xl flex items-center gap-3 transition-all
                                ${!selectedId || loading
                                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-rose-600 to-orange-600 hover:from-rose-500 hover:to-orange-500 text-white shadow-2xl hover:shadow-rose-500/40 transform hover:-translate-y-1'
                                }
                            `}
                        >
                            {loading ? (
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                            ) : (
                                <>
                                    <User size={28} />
                                    Comenzar Aventura
                                </>
                            )}
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    )
}
