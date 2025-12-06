import { useEffect, useState } from 'react'
import { useJuegoStore, type Personaje } from '../store/useJuegoStore'
import { useAuthStore } from '../store/useAuthStore'
import { useUIStore } from '../store/useUIStore'
import { gameplayService } from '../services/gameplayService'
import { MainLayout } from '../components/layout'
import { PersonajeSelectionModal } from '../features/personajes/PersonajeSelectionModal'
import { PreguntaModal } from '../features/preguntas/PreguntaModal'
import { GameMessageModal } from '../features/tablero/GameMessageModal'
import GameBoard from '../features/tablero/GameBoard'
import { TriviaFactCard } from '../features/curiosidades/components/TriviaFactCard'

export default function JuegoPrincipal() {
    const {
        personajeSeleccionado,
        juegoIniciado,
        iniciarJuego,
        seleccionarPersonaje,
        datoCuriosoActual,
        mostrarDatoCurioso,
        cargarTipAleatorio
    } = useJuegoStore()
    const { user } = useAuthStore()
    const { modalActivo, modalData, closeModal, addNotification } = useUIStore()

    // console.log('🎮 JuegoPrincipal render - modalActivo:', modalActivo, 'modalData:', modalData)

    // Estado para controlar el modal basado en la sesión del backend, no en el store local
    const [showPersonajeModal, setShowPersonajeModal] = useState(false)
    const [checkingSession, setCheckingSession] = useState(true)

    // Verificar si existe una sesión activa en el backend al cargar el componente
    useEffect(() => {
        const checkBackendSession = async () => {
            if (!user?.id) {
                setCheckingSession(false)
                return
            }

            try {
                const playerId = Number(user.id)
                // console.log('🔍 Verificando sesión del backend para playerId:', playerId)
                
                const session = await gameplayService.obtenerMiSesion(playerId)
                
                if (session) {
                    // console.log('✅ Sesión encontrada en el backend, NO mostrar modal')
                    setShowPersonajeModal(false)
                } else {
                    // console.log('ℹ️ No hay sesión en el backend, MOSTRAR modal')
                    setShowPersonajeModal(true)
                }
            } catch (error) {
                console.error('Error al verificar sesión:', error)
                // Si hay error, mejor mostrar el modal para que el usuario pueda crear sesión
                setShowPersonajeModal(true)
            } finally {
                setCheckingSession(false)
            }
        }

        checkBackendSession()
    }, [user?.id]) // Solo ejecutar cuando cambie el user.id

    // ✅ CAMBIO: Efecto separado para iniciar el juego
    useEffect(() => {
        if (personajeSeleccionado && !juegoIniciado) {
            iniciarJuego()
            // Cargar un tip aleatorio cuando inicia el juego
            cargarTipAleatorio()
        }
    }, [personajeSeleccionado, juegoIniciado, iniciarJuego, cargarTipAleatorio])

    const handlePersonajeSelected = (personaje: Personaje) => {
        seleccionarPersonaje(personaje)
        setShowPersonajeModal(false)
        if (!juegoIniciado) {
            iniciarJuego()
        }
        
        // Forzar recarga completa del tablero para cargar la nueva sesión
        window.location.reload()
    }

    const handleResponderPregunta = (_respuestaId: number, esCorrecta: boolean, updatedSession?: any) => {
        // console.log('📥 Respuesta procesada:', { respuestaId, esCorrecta, updatedSession })
        
        if (esCorrecta && updatedSession) {
            // ✅ La sesión ya fue actualizada por el backend automáticamente
            // console.log('✅ Jugador avanzó automáticamente a:', updatedSession.current_location?.name || updatedSession.current_position)
            
            // Actualizar el GameBoard con la nueva sesión
            if (typeof window !== 'undefined' && (window as any).actualizarSesion) {
                (window as any).actualizarSesion(updatedSession)
            }
            
            addNotification({
                type: 'success',
                message: `¡Correcto! Avanzaste a: ${updatedSession.current_location?.name || 'siguiente casilla'}`
            })
        } else if (!esCorrecta) {
            // Actualizar sesión aunque sea incorrecta (los puntos cambiaron)
            if (updatedSession && typeof window !== 'undefined' && (window as any).actualizarSesion) {
                (window as any).actualizarSesion(updatedSession)
            }
            
            addNotification({
                type: 'error',
                message: '❌ Respuesta incorrecta. -20 puntos. Permaneces en la casilla actual.'
            })
        }
        
        // Cerrar el modal
        closeModal()
    }

    return (
        <MainLayout>
            {/* Mostrar un loader mientras se verifica la sesión */}
            {checkingSession ? (
                <div className="w-full h-[calc(100dvh-5rem)] flex items-center justify-center">
                    <div className="text-center">
                        <div className="text-6xl mb-4 animate-bounce">🎮</div>
                        <p className="text-white text-xl">Cargando...</p>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col lg:flex-row lg:gap-6 w-full max-w-[1600px] mx-auto lg:p-4 lg:h-[calc(100dvh-7rem)]">
                    {/* Área del Tablero - Ocupa la mayor parte del espacio */}
                    {/* En móvil: Altura fija del viewport para ocupar toda la pantalla. En PC: Flex-1 para ocupar espacio restante */}
                    <div className="w-full h-[calc(100dvh-5rem)] lg:h-full lg:flex-1 lg:rounded-2xl overflow-hidden relative shrink-0">
                        <GameBoard isReady={!showPersonajeModal} />
                    </div>

                    {/* Panel Lateral / Inferior para Datos Curiosos */}
                    {/* En móvil: Flujo normal debajo del tablero (requiere scroll de página). En PC: Sidebar */}
                    <div className="w-full lg:w-96 shrink-0 flex flex-col z-10 lg:h-full">
                        {mostrarDatoCurioso && datoCuriosoActual && (
                            <div className="p-4 lg:p-0 lg:h-full">
                                <div className="lg:h-full">
                                    <TriviaFactCard
                                        title={datoCuriosoActual.titulo}
                                        content={datoCuriosoActual.contenido}
                                        theme={datoCuriosoActual.tema}
                                        imageUrl={datoCuriosoActual.imagen}
                                        className="lg:h-full"
                                        duration={15}
                                        onTimeout={cargarTipAleatorio}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                    
                    {/* Modal de selección de personaje - solo si no hay sesión */}
                    <PersonajeSelectionModal
                        isOpen={showPersonajeModal}
                        onPersonajeSelected={handlePersonajeSelected}
                    />
                    
                    {/* Modal de pregunta - controlado por UIStore */}
                    <PreguntaModal
                        isOpen={modalActivo === 'pregunta'}
                        pregunta={modalData?.pregunta || null}
                        onResponder={handleResponderPregunta}
                    />

                    {/* Modal de mensajes generales (Bonus, Penalty, Game Over) */}
                    <GameMessageModal />
                </div>
            )}
        </MainLayout>
    )
}
