import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy } from 'lucide-react'
import { gameplayService } from '../../services/gameplayService'
import { preguntasService } from '../../services/preguntasService'
import { useUIStore } from '../../store/useUIStore'

interface PreguntaModalProps {
    isOpen: boolean
    pregunta: {
        id: number
        text: string
        points: number
        answers: Array<{
            id: number
            text: string
            is_correct: boolean
        }>
    } | null
    onResponder: (respuestaId: number, esCorrecta: boolean, updatedSession?: any) => void
}

export function PreguntaModal({ isOpen, pregunta, onResponder }: PreguntaModalProps) {
    const [respuestaSeleccionada, setRespuestaSeleccionada] = useState<number | null>(null)
    const [mostrarResultado, setMostrarResultado] = useState(false)
    const [esCorrecta, setEsCorrecta] = useState(false)
    const [procesando, setProcesando] = useState(false)
    const [puntosGanados, setPuntosGanados] = useState(0)
    const [puntosActuales, setPuntosActuales] = useState(0)
    const [tiempoInicio, setTiempoInicio] = useState<number | null>(null)
    
    // Nuevos estados para la mecánica de tiempo
    const [fase, setFase] = useState<'lectura' | 'respuesta' | 'resultado'>('lectura')
    const [puntosVisuales, setPuntosVisuales] = useState(100)
    const [tiempoLectura, setTiempoLectura] = useState(5) // 5 segundos de lectura

    const { addNotification } = useUIStore()
    const timerRef = useRef<any>(null)
    const pointsIntervalRef = useRef<any>(null)

    const [preguntaActual, setPreguntaActual] = useState(pregunta)

    useEffect(() => {
        if (isOpen) {
            setPreguntaActual(pregunta)
            // Resetear estados
            setRespuestaSeleccionada(null)
            setMostrarResultado(false)
            setEsCorrecta(false)
            setProcesando(false)
            setPuntosGanados(0)
            setPuntosActuales(0)
            
            // Iniciar fase de lectura
            setFase('lectura')
            setTiempoLectura(5)
            setPuntosVisuales(100)
            setTiempoInicio(null)
        }
        
        return () => {
            if (timerRef.current) clearInterval(timerRef.current)
            if (pointsIntervalRef.current) clearInterval(pointsIntervalRef.current)
        }
    }, [isOpen, pregunta])

    // Efecto para el contador de lectura
    useEffect(() => {
        if (isOpen && fase === 'lectura') {
            const interval = setInterval(() => {
                setTiempoLectura((prev) => {
                    if (prev <= 1) {
                        clearInterval(interval)
                        setFase('respuesta')
                        setTiempoInicio(Date.now())
                        return 0
                    }
                    return prev - 1
                })
            }, 1000)
            return () => clearInterval(interval)
        }
    }, [isOpen, fase])

    // Efecto para el temporizador de puntos (Fase Respuesta)
    useEffect(() => {
        if (isOpen && fase === 'respuesta') {
            const startTime = Date.now()
            const duration = 15000 // 15 segundos

            // Asegurar que empezamos en 100
            setPuntosVisuales(100)

            const interval = setInterval(() => {
                const elapsed = Date.now() - startTime
                const remaining = Math.max(0, duration - elapsed)
                
                // Calcular puntos visuales: Curva cuadrática suave
                // Al inicio baja lento, luego acelera
                const ratio = elapsed / duration
                // Fórmula: 100 - (ratio^1.5 * 100) para un balance entre lineal y cuadrático
                const points = Math.max(0, Math.floor(100 - Math.pow(ratio, 1.5) * 100))
                
                setPuntosVisuales(points)

                if (remaining <= 0) {
                    clearInterval(interval)
                }
            }, 50) // Actualizar cada 50ms para mayor fluidez

            pointsIntervalRef.current = interval

            return () => {
                if (interval) clearInterval(interval)
            }
        }
    }, [isOpen, fase])

    // Limpiar intervalos al cerrar o cambiar fase
    useEffect(() => {
        if (fase === 'resultado' || !isOpen) {
            if (pointsIntervalRef.current) {
                clearInterval(pointsIntervalRef.current)
                pointsIntervalRef.current = null
            }
        }
    }, [fase, isOpen])

    if (!isOpen || !preguntaActual) {
        return null
    }

    const handleSeleccionarRespuesta = (answerId: number) => {
        if (mostrarResultado || procesando || fase !== 'respuesta') return
        setRespuestaSeleccionada(answerId)
    }

    const cargarNuevaPregunta = async () => {
        try {
            setProcesando(true)
            // Pequeño delay para que se vea el resultado
            await new Promise(resolve => setTimeout(resolve, 2000))
            
            const nuevaPregunta = await preguntasService.obtenerPreguntaAleatoria()
            
            // Resetear estados para la nueva pregunta
            setPreguntaActual(nuevaPregunta)
            setRespuestaSeleccionada(null)
            setMostrarResultado(false)
            setEsCorrecta(false)
            setProcesando(false)
            setPuntosGanados(0)
            
            // Reiniciar fases
            setFase('lectura')
            setTiempoLectura(5)
            setPuntosVisuales(100)
            setTiempoInicio(null)
            
        } catch (error) {
            console.error('Error al cargar nueva pregunta:', error)
            addNotification({
                type: 'error',
                message: 'No se pudo cargar una nueva pregunta.'
            })
            // Si falla, cerramos el modal para no dejar al usuario atrapado
            onResponder(0, false) 
        }
    }

    const handleConfirmar = async () => {
        if (respuestaSeleccionada === null || procesando) return

        setProcesando(true)
        if (pointsIntervalRef.current) clearInterval(pointsIntervalRef.current)

        try {
            // Calcular tiempo de respuesta en segundos
            const tiempoRespuesta = tiempoInicio ? (Date.now() - tiempoInicio) / 1000 : 15
            
            // Usar el nuevo endpoint integrado
            const result = await gameplayService.answerAndAdvance({
                question_id: preguntaActual.id,
                answer_id: respuestaSeleccionada,
                response_time: Math.min(tiempoRespuesta, 15) // Máximo 15 segundos
            })

            // console.log('✅ Resultado del backend:', result)

            setEsCorrecta(result.is_correct)
            setPuntosGanados(result.points_earned)
            setPuntosActuales(result.total_points)
            setMostrarResultado(true)
            setFase('resultado')

            if (result.is_correct) {
                // Si es correcta, esperar y cerrar (avanzar)
                setTimeout(() => {
                    onResponder(respuestaSeleccionada, result.is_correct, result.session)
                }, 2500)
            } else {
                // Si es incorrecta, cargar nueva pregunta en lugar de cerrar
                // El usuario verá el resultado rojo por 2 segundos y luego cambiará
                cargarNuevaPregunta()
            }

        } catch (error: any) {
           // console.error('❌ Error al validar respuesta:', error)
            addNotification({
                type: 'error',
                message: 'Error al procesar la respuesta. Intenta de nuevo.'
            })
            setProcesando(false)
        }
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
                    <motion.div
                        layout
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="bg-[#1a1a1a] rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden border border-gray-700 relative"
                    >
                        {/* Barra de progreso superior (Solo en fase respuesta) */}
                        {fase === 'respuesta' && (
                            <div className="absolute top-0 left-0 w-full h-2 bg-gray-800 z-20">
                                <motion.div 
                                    key={`progress-${preguntaActual.id}`}
                                    className="h-full"
                                    initial={{ width: "100%", backgroundColor: "#22c55e" }}
                                    animate={{ 
                                        width: "0%",
                                        backgroundColor: puntosVisuales > 60 ? "#22c55e" : puntosVisuales > 30 ? "#eab308" : "#ef4444"
                                    }}
                                    transition={{ 
                                        width: { duration: 15, ease: "linear" },
                                        backgroundColor: { duration: 0.5 } 
                                    }}
                                />
                            </div>
                        )}

                        <div className="p-6 sm:p-8">
                            {/* Header con Puntos y Timer */}
                            <div className="flex justify-between items-center mb-6">
                                <div className="flex items-center gap-2">
                                    <span className="bg-purple-600/20 text-purple-300 px-3 py-1 rounded-full text-sm font-bold border border-purple-500/30">
                                        TRIVIA
                                    </span>
                                    {fase === 'lectura' && (
                                        <span className="text-gray-400 text-sm animate-pulse">
                                            Leyendo...
                                        </span>
                                    )}
                                </div>
                                
                                {/* Contador de Puntos Animado */}
                                <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-colors duration-300 ${
                                    fase === 'respuesta' 
                                        ? 'bg-gray-800 border-yellow-500/50 text-yellow-400' 
                                        : 'bg-gray-800/50 border-gray-700 text-gray-400'
                                }`}>
                                    <Trophy className="w-5 h-5" />
                                    <span className="text-xl font-black font-mono min-w-[3ch] text-right">
                                        {fase === 'resultado' ? puntosGanados : puntosVisuales}
                                    </span>
                                    <span className="text-xs font-bold opacity-70">PTS</span>
                                </div>
                            </div>

                            {/* Contenido Principal con Layout Animation */}
                            <div className="flex flex-col items-center">
                                {/* Pregunta */}
                                <motion.div 
                                    layout
                                    className={`w-full text-center transition-all duration-500 ${
                                        fase === 'lectura' ? 'py-12 sm:py-20' : 'py-4 mb-6'
                                    }`}
                                >
                                    <motion.h2 
                                        layout
                                        className={`font-bold text-white leading-tight ${
                                            fase === 'lectura' 
                                                ? 'text-2xl sm:text-4xl md:text-5xl' 
                                                : 'text-xl sm:text-2xl'
                                        }`}
                                    >
                                        {preguntaActual.text}
                                    </motion.h2>
                                    
                                    {fase === 'lectura' && (
                                        <motion.div 
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="mt-8 flex flex-col items-center gap-2"
                                        >
                                            <div className="relative w-20 h-20 flex items-center justify-center">
                                                {/* Círculo de fondo */}
                                                <svg className="absolute inset-0 w-full h-full -rotate-90">
                                                    <circle
                                                        cx="40"
                                                        cy="40"
                                                        r="36"
                                                        stroke="currentColor"
                                                        strokeWidth="6"
                                                        fill="transparent"
                                                        className="text-gray-700"
                                                    />
                                                    {/* Círculo animado */}
                                                    <motion.circle
                                                        cx="40"
                                                        cy="40"
                                                        r="36"
                                                        stroke="currentColor"
                                                        strokeWidth="6"
                                                        fill="transparent"
                                                        className="text-purple-500"
                                                        strokeDasharray="226" // 2 * PI * 36
                                                        strokeDashoffset="0"
                                                        initial={{ strokeDashoffset: 0 }}
                                                        animate={{ strokeDashoffset: 226 }}
                                                        transition={{ duration: 5, ease: "linear" }}
                                                    />
                                                </svg>
                                                <span className="text-3xl font-bold text-white relative z-10">{tiempoLectura}</span>
                                            </div>
                                            <p className="text-gray-400 text-sm mt-2">Las opciones aparecerán pronto</p>
                                        </motion.div>
                                    )}
                                </motion.div>

                                {/* Opciones (Solo aparecen en fase respuesta/resultado) */}
                                <AnimatePresence>
                                    {(fase === 'respuesta' || fase === 'resultado') && (
                                        <motion.div 
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="w-full space-y-3"
                                        >
                                            <div className="grid grid-cols-1 gap-3">
                                                {preguntaActual.answers.map((answer, index) => {
                                                    const isSelected = respuestaSeleccionada === answer.id
                                                    const showResult = mostrarResultado && isSelected
                                                    
                                                    let buttonClass = "w-full p-4 rounded-xl border-2 transition-all duration-200 text-left font-medium relative overflow-hidden group "
                                                    
                                                    if (showResult) {
                                                        if (answer.is_correct) {
                                                            buttonClass += "bg-green-900/30 border-green-500 text-green-300"
                                                        } else {
                                                            buttonClass += "bg-red-900/30 border-red-500 text-red-300"
                                                        }
                                                    } else if (isSelected) {
                                                        buttonClass += "bg-purple-900/30 border-purple-500 text-purple-200"
                                                    } else {
                                                        buttonClass += "bg-gray-800/50 border-gray-700 text-gray-300 hover:border-gray-500 hover:bg-gray-800"
                                                    }

                                                    return (
                                                        <motion.button
                                                            key={answer.id}
                                                            initial={{ opacity: 0, x: -20 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            transition={{ delay: index * 0.1 }}
                                                            onClick={() => handleSeleccionarRespuesta(answer.id)}
                                                            disabled={mostrarResultado}
                                                            className={buttonClass}
                                                        >
                                                            <div className="flex items-center justify-between relative z-10">
                                                                <span className="text-base sm:text-lg">{answer.text}</span>
                                                                {isSelected && !mostrarResultado && (
                                                                    <div className="w-4 h-4 rounded-full bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]" />
                                                                )}
                                                                {showResult && (
                                                                    <span className="text-xl">
                                                                        {answer.is_correct ? '✅' : '❌'}
                                                                    </span>
                                                                )}
                                                                {/* Mostrar check en la respuesta correcta si falló */}
                                                                {mostrarResultado && !esCorrecta && answer.is_correct && (
                                                                    <span className="text-xl animate-bounce">
                                                                        ✅
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </motion.button>
                                                    )
                                                })}
                                            </div>

                                            {/* Botón de confirmar */}
                                            {!mostrarResultado && (
                                                <motion.button
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    onClick={handleConfirmar}
                                                    disabled={respuestaSeleccionada === null || procesando}
                                                    className={`w-full py-4 rounded-xl font-bold text-lg transition-all mt-6 shadow-lg ${
                                                        respuestaSeleccionada !== null && !procesando
                                                            ? 'bg-linear-to-r from-purple-600 to-pink-600 text-white hover:shadow-purple-500/25 hover:scale-[1.02] active:scale-[0.98]'
                                                            : 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700'
                                                    }`}
                                                >
                                                    {procesando 
                                                        ? '⏳ Procesando...' 
                                                        : respuestaSeleccionada !== null 
                                                            ? 'CONFIRMAR RESPUESTA' 
                                                            : 'Selecciona una opción'
                                                    }
                                                </motion.button>
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Resultado Final */}
                                {mostrarResultado && (
                                    <motion.div
                                        initial={{ scale: 0.8, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        className={`mt-6 w-full text-center p-4 rounded-2xl border ${
                                            esCorrecta 
                                                ? 'bg-green-900/20 border-green-500/30' 
                                                : 'bg-red-900/20 border-red-500/30'
                                        }`}
                                    >
                                        <p className={`text-2xl font-bold mb-1 ${
                                            esCorrecta ? 'text-green-400' : 'text-red-400'
                                        }`}>
                                            {esCorrecta ? '¡Respuesta Correcta!' : '¡Respuesta Incorrecta!'}
                                        </p>
                                        <p className="text-gray-400">
                                            {esCorrecta 
                                                ? `Has ganado ${puntosGanados} puntos` 
                                                : 'Cargando nueva pregunta...'}
                                        </p>
                                    </motion.div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}
