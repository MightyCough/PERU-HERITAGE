"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { Star, Lock, Play, Trophy } from "lucide-react"
import { useAuthStore } from "../../store/useAuthStore"
import { useUIStore } from "../../store/useUIStore"
import { gameplayService, type BoardLocation, type GameSession } from "../../services/gameplayService"
import { rankingService } from "../../services/rankingService"
import { preguntasService } from "../../services/preguntasService"
import { useJuegoStore } from "../../store/useJuegoStore"

// Interfaz para el estado visual del nivel (combina datos del backend y visuales)
interface LevelVisual {
    id: number // ID de la BoardLocation (coincide con la del backend)
    x: number
    y: number
    status: 'locked' | 'unlocked' | 'completed' | 'current'
    stars: 0 | 1 | 2 | 3 // Se simulan, pero vendrían de otro servicio (progreso/ranking)
    name: string // Nombre de la ubicación (para debug)
}

interface GameBoardProps {
    isReady?: boolean
}

export default function GameBoard({ isReady = true }: GameBoardProps) {
    // ----------------------------------------------------------------------
    // 1. Manejo del Estado
    // ----------------------------------------------------------------------
    const { user } = useAuthStore()
    const playerId = user?.id ? Number(user.id) : 0
    const { openModal, setLoading, addNotification } = useUIStore()

    const [locations, setLocations] = useState<BoardLocation[]>([]) // Ubicaciones del tablero (estructura)
    const [levelsVisual, setLevelsVisual] = useState<LevelVisual[]>([]) // Datos visuales (coordenadas)
    const [gameSession, setGameSession] = useState<GameSession | null>(null) // Estado actual del juego
    const [playerScore, setPlayerScore] = useState(0) // Puntuación del jugador
    const [locationScores, setLocationScores] = useState<Record<number, number>>({}) // Puntuaciones por ubicación

    const scrollContainerRef = useRef<HTMLDivElement>(null)
    const [containerWidth, setContainerWidth] = useState(0)
    const cargarTipAleatorio = useJuegoStore(state => state.cargarTipAleatorio)
    const prevPositionRef = useRef<number | null>(null)

    // Función para avanzar a la siguiente casilla (llamada después de responder correctamente)
    const avanzarACasillaSiguiente = async (): Promise<BoardLocation | undefined> => {
        if (!gameSession) {
            console.error('❌ No hay gameSession disponible')
            return undefined
        }

        if (!gameSession.id) {
            console.error('❌ gameSession no tiene ID:', gameSession)
            addNotification({
                type: 'error',
                message: 'Error: Sesión sin ID. Recarga la página.'
            })
            return undefined
        }

        try {
            setLoading(true, 'Avanzando a la siguiente casilla...')

            // console.log('🚀 Avanzando desde gameSession:', gameSession)

            // Encontrar la siguiente ubicación
            const currentPos = getCurrentPosition(gameSession)
            // Usar location_id para encontrar el índice
            const currentIndex = locations.findIndex(l => l.location_id === currentPos)

            if (currentIndex === -1) {
                console.error('❌ No se encontró la ubicación actual en el tablero:', currentPos)
                addNotification({ type: 'error', message: 'Error de sincronización: Ubicación no encontrada.' })
                return undefined
            }

            const nextLocation = locations[currentIndex + 1]

            if (!nextLocation) {
                // Ya está en la última casilla
                addNotification({ type: 'success', message: '¡Has completado el juego!' })
                return undefined
            }

            // Determinar si la siguiente ubicación es el final
            const isGameEnd = nextLocation.type === 'END'; // ✅ Usando el tipo 'END'

            // Actualizar la sesión con la nueva posición
            // NOTA: El backend espera 'current_location' (PK), no 'current_position'
            const updatedSession = await gameplayService.actualizarSesionParcial(gameSession.id, {
                current_location: nextLocation.id,
                is_completed: isGameEnd
            })

            // ... (código que actualiza setGameSession con la respuesta del backend)
            if (!updatedSession.id) {
                console.warn('⚠️ La actualización no devolvió ID, recargando sesión completa...')
                const fullSession = await gameplayService.obtenerSesion(gameSession.id)
                setGameSession(fullSession)
            } else {
                setGameSession(updatedSession)
            }

            // console.log('✅ Avanzado a casilla:', nextLocation.name, 'Tipo:', nextLocation.type)

            addNotification({
                type: 'success',
                message: `¡Avanzaste a: ${nextLocation.name}! (Tipo: ${nextLocation.type})`
            })

            return nextLocation // Devolver la nueva ubicación

        } catch (error: any) {
            console.error('Error al avanzar:', error)
            addNotification({
                type: 'error',
                message: 'Error al avanzar a la siguiente casilla'
            })
            return undefined
        } finally {
            setLoading(false)
        }
    }

    // Debug: verificar cuando gameSession cambia
    useEffect(() => {
        // console.log('🎮 gameSession actualizado:', gameSession)
        if (gameSession) {
            // console.log('🔍 gameSession.id:', gameSession.id)
            // console.log('🔍 typeof gameSession.id:', typeof gameSession.id)
        }
    }, [gameSession])

    // Cambiar tip cuando se avanza a otra casilla (solo al incrementar la posición)
    useEffect(() => {
        if (!gameSession) return

        const currentPos = typeof gameSession.current_position === 'number' ? gameSession.current_position : null

        // Si es la primera vez, inicializamos sin disparar tip
        if (prevPositionRef.current === null) {
            prevPositionRef.current = currentPos
            return
        }

        if (currentPos !== null && prevPositionRef.current !== null && currentPos > prevPositionRef.current) {
            // Avanzó de casilla → cargar tip aleatorio
            try {
                cargarTipAleatorio()
            } catch (err) {
                console.warn('No se pudo cargar tip aleatorio:', err)
            }
        }

        prevPositionRef.current = currentPos
    }, [gameSession?.current_position, cargarTipAleatorio])

    useEffect(() => {
        const updateWidth = () => {
            if (scrollContainerRef.current) {
                setContainerWidth(scrollContainerRef.current.clientWidth)
            }
        }
        updateWidth()
        const resizeObserver = new ResizeObserver(updateWidth)
        if (scrollContainerRef.current) {
            resizeObserver.observe(scrollContainerRef.current)
        }
        window.addEventListener('resize', updateWidth)
        return () => {
            window.removeEventListener('resize', updateWidth)
            resizeObserver.disconnect()
        }
    }, [])

    // ----------------------------------------------------------------------
    // 2. Carga Inicial de Datos del Juego
    // ----------------------------------------------------------------------
    // En lugar de llamar a iniciarPartida directamente, primero verifica si existe una sesión
    const hasLoadedRef = useRef(false)
    const [sessionCheckComplete, setSessionCheckComplete] = useState(false)

    // Función auxiliar para cargar los puntajes de las ubicaciones (estrellas)
    const fetchLocationScores = async () => {
        if (!playerId) return
        try {
            const events = await rankingService.obtenerEventosJugador(playerId)
            // console.log('📊 Eventos de puntuación obtenidos:', events)
            
            const scores: Record<number, number> = {}
            
            events.forEach(event => {
                if (event.points_awarded > 0) {
                    // Estrategia 1: Usar related_location (PK) directamente
                    if (event.related_location) {
                        const locId = event.related_location
                        if (!scores[locId] || event.points_awarded > scores[locId]) {
                            scores[locId] = event.points_awarded
                        }
                    }
                    
                    // Estrategia 2: Usar location_id (secuencial) para buscar el PK
                    // Esto es un respaldo por si related_location no viene o es incorrecto
                    if (event.location_id) {
                        const loc = locations.find(l => l.location_id === event.location_id)
                        if (loc) {
                            if (!scores[loc.id] || event.points_awarded > scores[loc.id]) {
                                scores[loc.id] = event.points_awarded
                            }
                        }
                    }
                }
            })
            
            // console.log('⭐ Puntuaciones por ubicación procesadas:', scores)
            setLocationScores(scores)
        } catch (error) {
            console.warn('⚠️ No se pudo obtener puntuación por ubicación:', error)
        }
    }

    // Función para recargar la sesión (reutilizable)
    const reloadSession = async () => {
        try {
            // console.log('🔍 Buscando sesión para playerId:', playerId)
            const session = await gameplayService.obtenerMiSesion(playerId)

            if (session) {
                // console.log('✅ Sesión activa encontrada:', session)
                // console.log('🔍 session.id:', session.id)
                // console.log('🔍 session completa:', JSON.stringify(session, null, 2))
                setGameSession(session)

                // Cargar puntuación del jugador
                try {
                    const scoreInfo = await rankingService.obtenerPuntuacionJugador(playerId)
                    setPlayerScore(scoreInfo.total_points)

                    // Cargar eventos de puntuación para las estrellas
                    await fetchLocationScores()
                } catch (error) {
                    console.warn('⚠️ No se pudo obtener puntuación del jugador:', error)
                    setPlayerScore(0)
                    setLocationScores({})
                }

                addNotification({
                    type: 'success',
                    message: `Partida cargada en posición ${session.current_position}`
                })
                return true
            } else {
                // console.log('ℹ️ No se encontró sesión activa para playerId:', playerId)
                setGameSession(null)
                setPlayerScore(0)
                return false
            }
        } catch (error) {
            console.error('❌ Error al verificar sesión:', error)
            setGameSession(null)
            setPlayerScore(0)
            return false
        }
    }

    // Efecto para recargar sesión cuando el componente se vuelve visible
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible' && sessionCheckComplete) {
                // console.log('🔄 Componente visible, recargando sesión...')
                reloadSession()
            }
        }

        document.addEventListener('visibilitychange', handleVisibilityChange)
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
    }, [sessionCheckComplete, playerId])

    useEffect(() => {
        // Evitar múltiples ejecuciones
        if (hasLoadedRef.current || sessionCheckComplete) return

        const loadGameData = async () => {
            hasLoadedRef.current = true
            setLoading(true, 'Cargando tablero y sesión...')

            try {
                // 1. OBTENER UBICACIONES
                const fetchedLocations = await gameplayService.obtenerUbicaciones()

                if (!Array.isArray(fetchedLocations) || fetchedLocations.length === 0) {
                    throw new Error("El tablero no tiene ubicaciones definidas o no se pudieron cargar.")
                }

                // console.log(`✅ Ubicaciones cargadas: ${fetchedLocations.length} casillas`)
                setLocations(fetchedLocations)

                // 2. VERIFICAR SI EXISTE UNA SESIÓN
                await reloadSession()

                // Debug: Verificar que la sesión cargó correctamente
                if (gameSession) {
                    // console.log('🎯 Sesión cargada - current_position:', gameSession.current_position)
                    // console.log('📋 IDs de ubicaciones disponibles:', locations.map(l => l.id))
                    // console.log('🔍 ¿La ubicación actual existe?:', locations.some(l => l.id === gameSession.current_position))
                }

                setSessionCheckComplete(true)

            } catch (error: any) {
                console.error("❌ Error al cargar datos del juego:", error)

                let errorMessage = 'Error de conexión con el servidor.'

                if (error.message) {
                    if (error.message.includes('tablero no tiene ubicaciones')) {
                        errorMessage = 'El tablero no está configurado. Contacta al administrador.'
                    } else if (error.message.includes('Network Error')) {
                        errorMessage = 'No se puede conectar con el servidor. Verifica tu conexión.'
                    } else {
                        errorMessage = error.message
                    }
                }

                addNotification({ type: 'error', message: `Error: ${errorMessage}` })
                setLocations([])
                setSessionCheckComplete(true)

            } finally {
                setLoading(false)
            }
        }

        if (playerId) {
            loadGameData()
        }
    }, [playerId, sessionCheckComplete])

    // ----------------------------------------------------------------------
    // 3. Generación del Camino Visual (Actualizado para usar BoardLocation)
    // ----------------------------------------------------------------------

    // Constantes de diseño
    const SPACING_Y = 120
    const PADDING_BOTTOM = 200
    const PADDING_TOP = 200

    // Calcular altura total dinámica
    const totalBoardHeight = Math.max(2800, (locations.length * SPACING_Y) + PADDING_BOTTOM + PADDING_TOP)

    const generatePath = () => {
        if (containerWidth === 0 || locations.length === 0) return []
        const startY = totalBoardHeight - PADDING_BOTTOM
        const spacingY = SPACING_Y
        const centerX = containerWidth / 2
        const maxAmplitude = 250
        const safeAmplitude = (containerWidth / 2) - 60
        const amplitude = Math.min(maxAmplitude, safeAmplitude > 0 ? safeAmplitude : 100)

        return locations.map((loc, index) => {
            const x = centerX + Math.sin(index * 0.8) * amplitude
            const y = startY - (index * spacingY)

            let status: LevelVisual['status'] = 'locked'
            // Usar la función helper para obtener el ID correcto (location_id)
            const currentLocationId = getCurrentPosition(gameSession)

            // Encontrar el índice de la ubicación actual usando location_id
            const currentIndex = locations.findIndex(l => l.location_id === currentLocationId)
            // Determinar el estado del nivel
            if (currentIndex === -1) {
                status = 'unlocked'; // Si la sesión es inválida, se queda en el estado más seguro
            } else if (index === currentIndex) {
                // *** CORRECCIÓN CLAVE: El índice es exactamente la posición actual. ***
                status = 'current';
                // console.log(`✅ Casilla ${index} es CURRENT`);
            } else if (index < currentIndex) {
                status = 'completed'; // Casillas ya completadas
                // console.log(`✅ Casilla ${index} es COMPLETED`);
            } else {
                status = 'unlocked'; // Casillas futuras (bloqueadas)
                // console.log(`🔒 Casilla ${index} es UNLOCKED (futura)`);
            }

            // Cálculo de estrellas basado en el puntaje real
            // Usamos loc.id (PK) porque event.related_location es el PK
            const points = locationScores[loc.id] || 0
            // if (points > 0) console.log(`⭐ Puntos para casilla ${loc.name} (ID: ${loc.id}): ${points}`)
            let stars: 0 | 1 | 2 | 3 = 0
            
            if (points >= 80) stars = 3
            else if (points >= 50) stars = 2
            else if (points > 0) stars = 1

            return {
                id: loc.location_id, // Usamos el location_id (1-30) para la visualización
                x,
                y,
                status: status,
                stars: stars,
                name: loc.name,
            } as LevelVisual
        })
    }

    // Recalcular los niveles visuales cuando cambian las ubicaciones o la sesión
    useEffect(() => {
        setLevelsVisual(generatePath())
    }, [locations, containerWidth, gameSession, locationScores])

    // Helper function: obtener current position (location_id) independientemente del formato del backend
    const getCurrentPosition = (session: GameSession | null): number | undefined => {
        if (!session) return undefined

        const currentLoc = (session as any).current_location

        // 1. Priorizar el objeto anidado (viene del DetailSerializer)
        if (currentLoc && typeof currentLoc === 'object' && typeof currentLoc.location_id === 'number') {
            return currentLoc.location_id
        }

        // 2. Fallback al campo numérico (viene del SimpleSerializer/Initial load)
        if (session.current_position && typeof session.current_position === 'number') {
            return session.current_position
        }

        return undefined
    }

    // Función para scroll suave personalizado (más lento)
    const smoothScrollTo = (element: HTMLElement, target: number, duration: number) => {
        const start = element.scrollTop
        const change = target - start
        const startTime = performance.now()

        const animateScroll = (currentTime: number) => {
            const elapsed = currentTime - startTime
            const progress = Math.min(elapsed / duration, 1)

            // Función de easing (easeInOutQuad)
            const easeInOutQuad = (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t

            element.scrollTop = start + change * easeInOutQuad(progress)

            if (progress < 1) {
                requestAnimationFrame(animateScroll)
            }
        }

        requestAnimationFrame(animateScroll)
    }

    // Efecto para hacer scroll automático al nivel actual (Actualizado)
    useEffect(() => {
        if (isReady && scrollContainerRef.current && levelsVisual.length > 0 && gameSession) {
            const currentPos = getCurrentPosition(gameSession)
            const currentLevelData = levelsVisual.find(l => l.id === currentPos)
            if (currentLevelData) {
                const containerHeight = scrollContainerRef.current.clientHeight
                const scrollTop = currentLevelData.y - containerHeight / 2 + (containerHeight / 4) // Centrar más hacia abajo

                // Delay para permitir que la animación de entrada se renderice antes de scrollear
                setTimeout(() => {
                    if (scrollContainerRef.current) {
                        smoothScrollTo(scrollContainerRef.current, scrollTop, 2000) // 2 segundos de duración
                    }
                }, 800)
            }
        }
    }, [levelsVisual, gameSession?.current_position, isReady])

    // ----------------------------------------------------------------------
    // 4. Lógica de Click en Casilla (abre pregunta directamente)
    // ----------------------------------------------------------------------
    const cargarYMostrarPregunta = async () => {
        try {
            setLoading(true, 'Cargando pregunta...')

            // console.log('🔍 Cargando pregunta...')

            // Obtener pregunta aleatoria
            const pregunta = await preguntasService.obtenerPreguntaAleatoria()

            // console.log('✅ Pregunta obtenida:', pregunta)
            // console.log('📋 Datos de la pregunta:', {
            //     id: pregunta.id,
            //     text: pregunta.text,
            //     points: pregunta.points,
            //     answersCount: pregunta.answers?.length
            // })

            // Abrir modal con la pregunta
            // console.log('🚪 Abriendo modal con tipo: pregunta')
            openModal('pregunta', {
                pregunta: pregunta
            })

            // console.log('✅ Modal abierto (openModal llamado)')
        } catch (error: any) {
            console.error('❌ Error al cargar pregunta:', error)
            addNotification({
                type: 'error',
                message: 'Error al cargar la pregunta. Intenta de nuevo.'
            })
        } finally {
            setLoading(false)
        }
    }

    const handleLevelClick = (levelId: number) => {
        if (!gameSession) return

        if (gameSession.is_completed) {
            addNotification({ type: 'success', message: '¡Juego completado! Ya no puedes realizar más acciones.' })
            return
        }

        // Buscar por location_id (que es lo que usamos en levelsVisual)
        const clickedLocation = locations.find(loc => loc.location_id === levelId)

        if (!clickedLocation) return

        const currentPos = getCurrentPosition(gameSession)

        // Solo permitir click en la casilla actual
        if (levelId === currentPos) {
            // console.log('🎯 Casilla actual clickeada:', clickedLocation.name)
            // console.log('📍 Tipo de casilla:', clickedLocation.type)

            // Abrir modal según el tipo de casilla
            const type = clickedLocation.type?.toUpperCase() || 'UNKNOWN'
            // console.log('📍 Procesando click en casilla tipo:', type)

            switch (type) {
                case 'START':
                case 'TRIVIA':
                case 'CHALLENGE':
                case 'QUESTION':
                    // Cargar pregunta aleatoria y abrir modal
                    cargarYMostrarPregunta()
                    break
                case 'BONUS':
                    openModal('resultado', {
                        message: '¡Casilla de Bono! Has ganado un punto extra.',
                        type: 'bonus'
                    })
                    // Auto-avanzar después del bonus
                    // setTimeout(() => avanzarACasillaSiguiente(), 2000)
                    break
                case 'PENALTY': // ✅ NUEVO: Casilla de Penalización
                    openModal('resultado', {
                        message: '¡Casilla de Penalización! Pierdes tu siguiente turno o puntos.',
                        type: 'penalty'
                    })
                    // Asumimos que la penalización solo es una notificación y el jugador debe hacer clic para avanzar después.
                    break;
                case 'END':
                    openModal('game-over', {
                        message: '¡Juego Completado! ¡Felicidades!'
                    })
                    break
                /* case 'START':
                    // ✅ FLUJO DE INICIO: Forzar avance a la primera casilla jugable para iniciar el juego.
                    addNotification({ 
                        type: 'info', 
                        message: '¡Bienvenido al juego! Avanzando a la primera casilla jugable...' 
                    });
                    
                    // Ejecutar avance de forma asíncrona e inmediatamente
                    (async () => {
                        setLoading(true, 'Avanzando...')
                        // 1. Avanzar a la primera casilla de juego
                        const nextLoc = await avanzarACasillaSiguiente()

                        if (nextLoc && (nextLoc.type === 'TRIVIA' || nextLoc.type === 'QUESTION')) {
                            // 2. Si la nueva casilla es interactiva, disparar el modal para empezar a jugar
                            setTimeout(() => cargarYMostrarPregunta(), 500) 
                        }
                        setLoading(false)
                    })()
                    break */
                default:
                    addNotification({
                        type: 'info',
                        message: `Casilla: ${clickedLocation.name} (${type})`
                    })
            }
        } else {
            // Click en casilla completada o futura
            const currentPos = getCurrentPosition(gameSession)
            // Usar location_id para encontrar índices
            const currentIndex = locations.findIndex(l => l.location_id === currentPos)
            const clickedIndex = locations.findIndex(l => l.location_id === levelId)

            if (clickedIndex < currentIndex) {
                addNotification({
                    type: 'info',
                    message: `Casilla completada: ${clickedLocation.name}`
                })
            } else {
                addNotification({
                    type: 'warning',
                    message: `Debes completar la casilla actual primero (Click: ${levelId}, Actual: ${currentPos})`
                })
            }
        }
    }


    // Exponer la función avanzar para que el modal de preguntas pueda llamarla
    // (esto se puede hacer mediante el UIStore o un callback)
    useEffect(() => {
        // Función para actualizar la sesión directamente (llamada desde JuegoPrincipal después de responder)
        (window as any).actualizarSesion = async (nuevaSesion: GameSession) => {
            console.log('🔄 Actualizando sesión desde el backend:', nuevaSesion)
            setGameSession(nuevaSesion)

            // Actualizar también la puntuación
            try {
                const scoreInfo = await rankingService.obtenerPuntuacionJugador(playerId)
                setPlayerScore(scoreInfo.total_points)
                // Actualizar las estrellas de las casillas
                await fetchLocationScores()
            } catch (error) {
                console.warn('⚠️ No se pudo actualizar puntuación:', error)
            }

            addNotification({
                type: 'success',
                message: `Avanzaste a: ${(nuevaSesion as any).current_location?.name || 'siguiente casilla'}`
            })
        }

        // Función legacy por si se necesita (pero ya no debería usarse)
        (window as any).avanzarACasillaSiguiente = avanzarACasillaSiguiente

        return () => {
            delete (window as any).actualizarSesion
            // delete (window as any).avanzarACasillaSiguiente // No borrar para que el modal pueda usarlo
        }
    }, [gameSession, locations, playerId])

    // Determinar el nivel actual (usado para el avatar y el scroll)
    const currentLevelData = levelsVisual.find(l => l.id === getCurrentPosition(gameSession))

    // Si no hay ubicaciones cargadas, mostrar mensaje de error
    if (locations.length === 0 && !gameSession) {
        // Comentado para evitar mostrar el mensaje de error si el usuario prefiere no verlo
        /*
        return (
            <div className="w-full h-[calc(100vh-5rem)] sm:h-[calc(100vh-6rem)] flex flex-col items-center justify-center p-4">
                <div className="text-center bg-white/10 backdrop-blur-sm rounded-xl p-8 max-w-2xl">
                    <div className="text-6xl mb-4">🎲</div>
                    <h2 className="text-2xl font-bold text-white mb-4">Tablero sin configurar</h2>
                    <p className="text-white/90 mb-4">
                        El tablero de juego no tiene ubicaciones creadas en la base de datos.
                    </p>
                    <div className="bg-white/5 rounded-lg p-6 mb-6 text-left">
                        <h3 className="text-lg font-semibold text-white mb-3">📋 Instrucciones para el administrador:</h3>
                        <ol className="text-white/80 space-y-2 text-sm list-decimal list-inside">
                            <li>Accede al panel de administración del backend Django</li>
                            <li>Ve a la sección "Gameplay" → "Board Locations"</li>
                            <li>Crea las casillas del tablero (mínimo 10-15 ubicaciones)</li>
                            <li>Asegúrate de incluir:
                                <ul className="ml-6 mt-1 space-y-1 list-disc list-inside">
                                    <li>Una casilla tipo "START" (inicio)</li>
                                    <li>Varias casillas tipo "TRIVIA" o "CHALLENGE"</li>
                                    <li>Una casilla tipo "FINISH" (final)</li>
                                </ul>
                            </li>
                            <li>Guarda los cambios y recarga esta página</li>
                        </ol>
                    </div>
                    <div className="flex gap-4 justify-center flex-wrap">
                        <button 
                            onClick={() => window.location.reload()}
                            className="bg-rose-600 hover:bg-rose-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                        >
                            🔄 Reintentar
                        </button>
                        <button 
                            onClick={() => window.location.href = '/seleccion-personaje'}
                            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                        >
                            👤 Seleccionar Personaje
                        </button>
                        <a 
                            href={`${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8000'}/admin/`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors inline-block"
                        >
                            🔧 Ir al Admin
                        </a>
                    </div>
                </div>
            </div>
        )
        */
    }

    // Si hay ubicaciones pero no hay sesión, mostrar pantalla de bienvenida
    if (locations.length > 0 && !gameSession && sessionCheckComplete) {
        return (
            <div className="w-full h-[calc(100dvh-5rem)] sm:h-[calc(100dvh-6rem)] flex flex-col items-center justify-center p-4">
                <div className="text-center bg-white/10 backdrop-blur-sm rounded-xl p-8 max-w-xl">
                    <div className="text-7xl mb-6">🎮</div>
                    <h2 className="text-3xl font-bold text-white mb-4">¡Bienvenido al Juego!</h2>
                    <p className="text-white/90 mb-6 text-lg">
                        Para comenzar tu aventura, primero debes seleccionar un avatar que te represente en el tablero.
                    </p>
                    <div className="bg-white/5 rounded-lg p-6 mb-6">
                        <p className="text-white/80 text-sm mb-4">
                            El tablero tiene <span className="font-bold text-yellow-400">{locations.length} casillas</span> esperándote.
                            ¡Prepárate para responder preguntas, superar desafíos y ganar puntos!
                        </p>
                    </div>
                    <button
                        onClick={() => window.location.href = '/seleccion-personaje'}
                        className="bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 rounded-lg font-bold text-lg transition-all transform hover:scale-105 shadow-xl"
                    >
                        👤 Seleccionar Avatar
                    </button>
                </div>
            </div>
        )
    }

    return (
        <motion.div
            className="w-full h-full flex flex-col items-center overflow-hidden"
            initial={{ opacity: 0, y: 50 }}
            animate={isReady ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
        >



            {/* Contenedor del Mapa Scrollable */}
            <div className="w-full max-w-5xl relative rounded-3xl shadow-2xl border-8 border-rose-600/30 overflow-hidden bg-linear-to-b from-red-600/10 to-rose-600/10 flex-1">
                <div className="absolute inset-0 opacity-20 pointer-events-none"
                    style={{
                        backgroundImage: 'radial-gradient(#22c55e 2px, transparent 2px)',
                        backgroundSize: '30px 30px'
                    }}
                />
                
                {/* Panel de Información del Juego */}
                <div className="w-full p-3 bg-linear-to-r from-purple-600/20 to-rose-600/20 backdrop-blur-sm rounded-xl shadow-lg flex justify-between items-center border border-white/10">
                    <div className="flex items-center gap-3">
                        <motion.div
                            className="bg-white/10 rounded-lg px-4 py-2"
                            key={playerScore} // Re-animar cuando cambia el puntaje
                            initial={{ scale: 1 }}
                            animate={{
                                scale: [1, 1.15, 1],
                                boxShadow: [
                                    '0 0 0px rgba(251, 191, 36, 0)',
                                    '0 0 20px rgba(251, 191, 36, 0.5)',
                                    '0 0 0px rgba(251, 191, 36, 0)'
                                ]
                            }}
                            transition={{ duration: 0.5 }}
                        >
                            <span className="text-white text-xs font-medium opacity-70">PUNTOS</span>
                            <motion.div
                                className="text-2xl font-black bg-linear-to-r from-yellow-400 to-amber-500 bg-clip-text text-transparent"
                                key={`score-${playerScore}`}
                                initial={{ y: -10, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ duration: 0.3 }}
                            >
                                {playerScore.toLocaleString()}
                            </motion.div>
                        </motion.div>
                        <div className="hidden sm:block h-8 w-px bg-white/20"></div>
                        <span className="text-white text-sm font-medium hidden sm:inline">
                            📍 {currentLevelData?.name || 'Cargando...'}
                        </span>
                    </div>

                    <div className="text-white text-xs bg-white/10 px-3 py-2 rounded-lg hidden md:block">
                        🎯 Click en la casilla para jugar
                    </div>

                    <div className="text-white text-sm font-medium">
                        <span className="opacity-70">Progreso: </span>
                        <span className="font-bold">{locations.findIndex(l => l.location_id === getCurrentPosition(gameSession)) + 1} / {locations.length}</span>
                    </div>
                </div>

                <div
                    ref={scrollContainerRef}
                    className="w-full h-full overflow-y-auto overflow-x-hidden scrollbar-hide relative"
                >
                    <div className="relative w-full" style={{ height: `${totalBoardHeight}px` }}>

                        {/* SVG Path (Camino) */}
                        <svg className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
                            {Array.isArray(levelsVisual) && levelsVisual.length > 0 && (
                                <>
                                    {/* Sombra del camino */}
                                    <path
                                        d={`M ${levelsVisual.map(l => `${l.x},${l.y}`).join(' L ')}`}
                                        fill="none"
                                        stroke="rgba(0,0,0,0.1)"
                                        strokeWidth="32"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        transform="translate(4, 4)"
                                    />
                                    {/* Camino principal */}
                                    <path
                                        d={`M ${levelsVisual.map(l => `${l.x},${l.y}`).join(' L ')}`}
                                        fill="none"
                                        stroke="white"
                                        strokeWidth="24"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeDasharray="30 10"
                                    />
                                </>
                            )}
                        </svg>

                        {/* Nodos de Nivel */}
                        {levelsVisual.map((level, index) => {
                            const isLastLevel = index === levelsVisual.length - 1

                            // Determinar estilos basados en estado y estrellas
                            let buttonClass = ''
                            if (level.status === 'unlocked') {
                                buttonClass = 'bg-gray-300 border-gray-500 text-gray-600 cursor-not-allowed opacity-50'
                            } else if (level.status === 'current') {
                                buttonClass = 'bg-linear-to-b from-pink-400 to-rose-500 border-white ring-4 ring-pink-200 animate-pulse text-white cursor-pointer'
                            } else if (level.status === 'completed') {
                                if (level.stars === 3) {
                                    buttonClass = 'bg-linear-to-b from-yellow-400 to-amber-500 border-amber-600 text-white cursor-pointer hover:shadow-2xl shadow-amber-500/50'
                                } else if (level.stars === 2) {
                                    buttonClass = 'bg-linear-to-b from-slate-400 to-slate-500 border-slate-600 text-white cursor-pointer hover:shadow-2xl shadow-slate-500/50'
                                } else if (level.stars === 1) {
                                    buttonClass = 'bg-linear-to-b from-orange-400 to-orange-600 border-orange-700 text-white cursor-pointer hover:shadow-2xl shadow-orange-500/50'
                                } else {
                                    buttonClass = 'bg-linear-to-b from-green-400 to-emerald-500 border-green-600 text-white cursor-pointer hover:shadow-2xl'
                                }
                            }

                            return (
                                <motion.div
                                    key={level.id}
                                    className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10"
                                    style={{ left: level.x, top: level.y }}
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.05, type: "spring" }} // Eliminado el delay * level.id para cargar más rápido
                                >
                                    <div className="relative group">
                                        {/* Estrellas (si completado) */}
                                        {level.status === 'completed' && (
                                            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 flex gap-1 w-full justify-center">
                                                {[...Array(3)].map((_, i) => (
                                                    <motion.div
                                                        key={i}
                                                        initial={{ scale: 0 }}
                                                        animate={{ scale: 1 }}
                                                        transition={{ delay: 0.2 + (i * 0.1) }}
                                                    >
                                                        <Star
                                                            size={20}
                                                            className={`${i < level.stars ? "fill-yellow-400 text-yellow-500" : "fill-gray-300 text-gray-400"}`}
                                                        />
                                                    </motion.div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Botón del Nivel */}
                                        <motion.button
                                            onClick={() => handleLevelClick(level.id)}
                                            whileHover={level.status === 'current' ? { scale: 1.1 } : level.status === 'completed' ? { scale: 1.05 } : {}}
                                            whileTap={level.status === 'current' ? { scale: 0.9 } : {}}
                                            className={`
                                            w-16 h-16 md:w-24 md:h-24 rounded-full flex items-center justify-center shadow-xl border-4 transition-all duration-300
                                            ${buttonClass}
                                        `}
                                        >
                                            {level.status === 'unlocked' ? (
                                                <Lock className="w-6 h-6 md:w-8 md:h-8" />
                                            ) : level.status === 'completed' ? (
                                                isLastLevel ? (
                                                    <Trophy className="w-8 h-8 md:w-10 md:h-10 text-yellow-200" />
                                                ) : (
                                                    <motion.div
                                                        initial={{ scale: 0 }}
                                                        animate={{ scale: 1 }}
                                                        className="text-3xl"
                                                    >
                                                        ✓
                                                    </motion.div>
                                                )
                                            ) : (
                                                isLastLevel ? (
                                                    <Trophy className="w-8 h-8 md:w-10 md:h-10" />
                                                ) : (
                                                    <Play className="w-8 h-8 md:w-10 md:h-10" fill="currentColor" />
                                                )
                                            )}
                                        </motion.button>

                                        {/* Etiqueta de Nivel Actual */}
                                        {level.status === 'current' && !isLastLevel && (
                                            <motion.div
                                                onClick={() => handleLevelClick(level.id)}
                                                initial={{ y: 10, opacity: 0 }}
                                                animate={{ y: 0, opacity: 1 }}
                                                className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 bg-white px-4 py-2 rounded-full shadow-md whitespace-nowrap cursor-pointer hover:scale-105 transition-transform"
                                            >
                                                <span className="text-sm font-bold text-pink-500">🎯 CLICK AQUÍ</span>
                                            </motion.div>
                                        )}
                                    </div>
                                </motion.div>
                            )
                        })}

                        {/* Personaje Avatar (en el nivel actual) */}
                        {currentLevelData && (
                            <motion.div
                                className="absolute z-20 pointer-events-none"
                                initial={false}
                                animate={{
                                    left: currentLevelData.x + (containerWidth < 768 ? 25 : 40),
                                    top: currentLevelData.y - (containerWidth < 768 ? 25 : 30),
                                }}
                                transition={{ type: "spring", stiffness: 50 }}
                            >
                                <div className="w-14 h-14 md:w-20 md:h-20 bg-white rounded-full border-4 border-blue-500 shadow-2xl overflow-hidden">
                                    <img
                                        src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
                                        alt="Avatar"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    )
}


