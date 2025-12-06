import apiClient, { handleApiError, extractApiData } from './api'

// Tipos basados en los modelos del backend
export interface BoardLocation {
    id: number
    location_id: number // Posición en el tablero (secuencial)
    name: string
    description?: string
    type: string // TRIVIA, CHALLENGE, BONUS, START, FINISH, etc.
    related_question?: number
    related_trivia?: number
}

export interface GameSession {
    id: number
    player: number
    current_position: number // El backend devuelve current_position, no current_location
    last_dice_roll: number
    is_completed: boolean
    started_at: string
    completed_at?: string
}

export interface CreateGameSessionRequest {
    player: number
    current_position: number
}

export interface UpdateGameSessionRequest {
    current_location?: number // ID de la ubicación (PK)
    current_position?: number // Deprecado, usar current_location
    last_dice_roll?: number
    is_completed?: boolean
    completed_at?: string
}

export interface MovePlayerRequest {
    dice_roll: number
}

export interface AnswerAndAdvanceRequest {
    question_id: number
    answer_id: number
    response_time?: number
}

export interface AnswerAndAdvanceResponse {
    is_correct: boolean
    points_earned: number
    total_points: number
    session: GameSession
    message: string
}

export interface Avatar {
    id: number
    name: string
    description?: string
    image_url?: string
}

// Servicio de gameplay (tablero y sesiones de juego)
export const gameplayService = {
    // --- Board Locations (Ubicaciones del Tablero) ---

    /**
     * Obtener todas las ubicaciones del tablero
     */
    obtenerUbicaciones: async (): Promise<BoardLocation[]> => {
        try {
            const response = await apiClient.get('/gameplay/ubicaciones-tablero/')
            const locations = extractApiData<BoardLocation[]>(response)
            
            // Validar que sea un array válido
            if (!Array.isArray(locations)) {
                console.error('Locations is not an array:', locations)
                throw new Error('El formato de datos del tablero es inválido.')
            }
            
            if (locations.length === 0) {
                console.warn('⚠️ API returned empty array - No hay ubicaciones en la base de datos')
                console.warn('💡 Para crear ubicaciones, accede al panel de administración del backend')
                console.warn('📍 Endpoint: POST /api/gameplay/ubicaciones-tablero/')
                
                // En desarrollo, podríamos usar datos mock, pero mejor lanzar error
                // para que el admin configure el tablero correctamente
                throw new Error(
                    'El tablero no tiene ubicaciones configuradas. ' +
                    'Por favor, accede al panel de administración del backend para crear las casillas del juego.'
                )
            }
            
            // console.log(`✅ ${locations.length} ubicaciones cargadas correctamente`)
            
            // Ordenar las ubicaciones por location_id para asegurar el orden correcto del recorrido
            locations.sort((a, b) => a.location_id - b.location_id)

            return locations
        } catch (error) {
            // Si ya es un Error que lanzamos, lo propagamos
            if (error instanceof Error && error.message.includes('tablero')) {
                throw error
            }
            throw new Error(handleApiError(error)) 
        }
    },

    /**
     * Obtener una ubicación específica del tablero
     */
    obtenerUbicacion: async (id: number): Promise<BoardLocation> => {
        try {
            const response = await apiClient.get(`/gameplay/ubicaciones-tablero/${id}/`)
            return extractApiData<BoardLocation>(response)
        } catch (error) {
            throw new Error(handleApiError(error))
        }
    },

    /**
     * Crear una nueva ubicación en el tablero (Admin)
     */
    crearUbicacion: async (data: Omit<BoardLocation, 'id'>): Promise<BoardLocation> => {
        try {
            const response = await apiClient.post('/gameplay/ubicaciones-tablero/', data)
            return extractApiData<BoardLocation>(response)
        } catch (error) {
            throw new Error(handleApiError(error))
        }
    },

    /**
     * Actualizar una ubicación del tablero (Admin)
     */
    actualizarUbicacion: async (id: number, data: Partial<BoardLocation>): Promise<BoardLocation> => {
        try {
            const response = await apiClient.put(`/gameplay/ubicaciones-tablero/${id}/`, data)
            return extractApiData<BoardLocation>(response)
        } catch (error) {
            throw new Error(handleApiError(error))
        }
    },

    /**
     * Eliminar una ubicación del tablero (Admin)
     */
    eliminarUbicacion: async (id: number): Promise<void> => {
        try {
            await apiClient.delete(`/gameplay/ubicaciones-tablero/${id}/`)
        } catch (error) {
            throw new Error(handleApiError(error))
        }
    },

    // --- Game Sessions (Sesiones de Juego) ---

    /**
     * Obtener todas las sesiones de juego
     */
    obtenerSesiones: async (): Promise<GameSession[]> => {
        try {
            const response = await apiClient.get('/gameplay/sesiones-juego/')
            return extractApiData<GameSession[]>(response)
        } catch (error) {
            throw new Error(handleApiError(error))
        }
    },

    // --- Avatares ---

    /**
     * Obtener todos los avatares disponibles
     */
    obtenerAvatares: async (): Promise<Avatar[]> => {
        try {
            const response = await apiClient.get('/gameplay/avatares/')
            return extractApiData(response)
        } catch (error) {
            throw new Error(handleApiError(error))
        }
    },

    /**
     * Obtener una sesión de juego específica
     */
    obtenerSesion: async (id: number): Promise<GameSession> => {
        try {
            const response = await apiClient.get(`/gameplay/sesiones-juego/${id}/`)
            return extractApiData<GameSession>(response)
        } catch (error) {
            throw new Error(handleApiError(error))
        }
    },

    /**
     * Crear una nueva sesión de juego
     */
    crearSesion: async (data: CreateGameSessionRequest): Promise<GameSession> => {
        try {
            const response = await apiClient.post('/gameplay/sesiones-juego/', data)
            return extractApiData<GameSession>(response)
        } catch (error) {
            throw new Error(handleApiError(error))
        }
    },

    /**
     * Actualizar una sesión de juego
     */
    actualizarSesion: async (id: number, data: UpdateGameSessionRequest): Promise<GameSession> => {
        try {
            const response = await apiClient.put(`/gameplay/sesiones-juego/${id}/`, data)
            return extractApiData<GameSession>(response)
        } catch (error) {
            throw new Error(handleApiError(error))
        }
    },

    /**
     * Actualizar parcialmente una sesión de juego
     */
    actualizarSesionParcial: async (id: number, data: Partial<UpdateGameSessionRequest>): Promise<GameSession> => {
        try {
            const response = await apiClient.patch(`/gameplay/sesiones-juego/${id}/`, data)
            return extractApiData<GameSession>(response)
        } catch (error) {
            throw new Error(handleApiError(error))
        }
    },

    /**
     * Eliminar una sesión de juego
     */
    eliminarSesion: async (id: number): Promise<void> => {
        try {
            await apiClient.delete(`/gameplay/sesiones-juego/${id}/`)
        } catch (error) {
            throw new Error(handleApiError(error))
        }
    },

    /**
     * Mover jugador en el tablero (lógica simplificada)
     */
    moverJugador: async (sessionId: number, diceRoll: number): Promise<GameSession> => {
        try {
            // Primero obtenemos la sesión actual
            const session = await gameplayService.obtenerSesion(sessionId)

            // Obtenemos todas las ubicaciones para calcular la nueva posición
            const locations = await gameplayService.obtenerUbicaciones()

            // Encontramos el índice de la ubicación actual
            // Nota: session.current_position es el location_id (secuencial), no el PK
            // Pero locations.id es el PK. Necesitamos buscar por location_id si es posible, o asumir orden.
            // Mejor buscar por ID si session.current_position fuera el PK, pero el serializer dice que es location_id.
            // Vamos a buscar la ubicación que tenga ese location_id
            
            // Corrección: session.current_position viene del serializer como location_id
            const currentLocationIndex = locations.findIndex(
                loc => loc.location_id === session.current_position
            )

            // Calculamos la nueva posición
            const newLocationIndex = Math.min(
                currentLocationIndex + diceRoll,
                locations.length - 1
            )

            const newLocation = locations[newLocationIndex]

            // Actualizamos la sesión con la nueva posición (usando current_location = PK)
            return await gameplayService.actualizarSesionParcial(sessionId, {
                current_location: newLocation.id,
                last_dice_roll: diceRoll,
                is_completed: newLocationIndex === locations.length - 1
            })
        } catch (error) {
            throw new Error(handleApiError(error))
        }
    },

    /**
     * Iniciar nueva partida (llamar desde la página de selección de personaje)
     */
    iniciarPartida: async (avatarName: string): Promise<GameSession> => {
        try {
            const response = await apiClient.post('/gameplay/sesiones-juego/start/', {
                avatar_name: avatarName
            })
            return extractApiData(response)
        } catch (error) {
            throw new Error(handleApiError(error))
        }
    },

    /**
     * Obtener la sesión activa del usuario actual
     * Busca en todas las sesiones la que pertenece al jugador actual y no está completada
     */
    obtenerMiSesion: async (playerId: number): Promise<GameSession | null> => {
        try {
            // console.log('🔍 obtenerMiSesion - Buscando sesión para playerId:', playerId)
            const response = await apiClient.get('/gameplay/sesiones-juego/')
            const sesiones = extractApiData<GameSession[]>(response)
            
            // console.log('📊 Total de sesiones obtenidas:', sesiones.length)
            // console.log('📊 Sesiones:', sesiones)
            
            // Buscar la sesión activa del jugador
            const sesionActiva = sesiones.find(s => {
                const match = s.player === playerId && !s.is_completed
                // console.log(`🔍 Comparando: s.player=${s.player} con playerId=${playerId}, is_completed=${s.is_completed}, match=${match}`)
                return match
            })
            
            if (sesionActiva) {
                // console.log('✅ Sesión activa encontrada:', sesionActiva)
            } else {
                // console.log('⚠️ No se encontró sesión activa para playerId:', playerId)
            }
            
            return sesionActiva || null
        } catch (error) {
            console.error('❌ Error al obtener sesiones:', handleApiError(error))
            return null
        }
    },

    /**
     * Completar partida
     */
    completarPartida: async (sessionId: number): Promise<GameSession> => {
        try {
            return await gameplayService.actualizarSesionParcial(sessionId, {
                is_completed: true,
                completed_at: new Date().toISOString()
            })
        } catch (error) {
            throw new Error(handleApiError(error))
        }
    },

    /**
     * Eliminar mi sesión activa (para poder iniciar una nueva)
     */
    eliminarMiSesion: async (playerId: number): Promise<void> => {
        try {
            const sesionActiva = await gameplayService.obtenerMiSesion(playerId)
            if (sesionActiva) {
                await gameplayService.eliminarSesion(sesionActiva.id)
            }
        } catch (error) {
            throw new Error(handleApiError(error))
        }
    },

    /**
     * Responder pregunta y avanzar automáticamente si es correcta
     * Este endpoint combina la validación de respuesta y el avance en una sola llamada
     */
    answerAndAdvance: async (data: AnswerAndAdvanceRequest): Promise<AnswerAndAdvanceResponse> => {
        try {
            const response = await apiClient.post('/gameplay/sesiones-juego/answer-and-advance/', data)
            return extractApiData<AnswerAndAdvanceResponse>(response)
        } catch (error) {
            throw new Error(handleApiError(error))
        }
    }
}
