import apiClient, { handleApiError, extractApiData } from './api'

// Tipos basados en los modelos del backend
export interface PlayerScore {
  id: number
  player: number
  total_points: number
  games_completed: number
  last_updated: string
}

export interface PlayerScoreWithRank extends PlayerScore {
  rank: number
  player_email?: string
  player_username?: string
  avatar_url?: string
}

export interface ScoreEvent {
  id: number
  player: number
  event_type: string // CORRECT_ANSWER, WRONG_ANSWER, GAME_COMPLETED, etc.
  points_awarded: number
  timestamp: string
  related_question?: number
  related_location?: number
  location_id?: number // ID secuencial de la ubicación
}

export interface AddPointsRequest {
  points: number
  event_type?: string
  related_question?: number
  related_location?: number
}

export interface PlayerStatistics {
  total_events: number
  total_points_gained: number
  total_points_lost: number
  correct_answers: number
  wrong_answers: number
  games_completed: number
  average_points_per_game: number
}

// Servicio de ranking y estadísticas
export const rankingService = {
  /**
   * Obtener leaderboard (ranking global)
   */
  obtenerLeaderboard: async (limit?: number): Promise<PlayerScoreWithRank[]> => {
    try {
      const params = limit ? { limit } : {}
      const response = await apiClient.get(
        '/puntuaciones/leaderboard/',
        { params }
      )
      return extractApiData(response)
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Obtener todas las puntuaciones
   */
  obtenerPuntuaciones: async (): Promise<PlayerScore[]> => {
    try {
      const response = await apiClient.get('/puntuaciones/')
      return extractApiData(response)
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Obtener puntuación de un jugador específico
   */
  obtenerPuntuacionJugador: async (playerId: number): Promise<PlayerScore> => {
    try {
      const response = await apiClient.get(
        `/puntuaciones/jugador/${playerId}/`
      )
      return extractApiData(response)
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Obtener ranking de un jugador (posición en el leaderboard)
   */
  obtenerRankingJugador: async (playerId: number): Promise<{ rank: number }> => {
    try {
      const response = await apiClient.get(
        `/puntuaciones/jugador/${playerId}/ranking/`
      )
      return extractApiData(response)
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Obtener información completa del jugador con ranking
   */
  obtenerInfoCompletaJugador: async (playerId: number): Promise<PlayerScoreWithRank> => {
    try {
      const response = await apiClient.get(
        `/puntuaciones/jugador/${playerId}/completo/`
      )
      return extractApiData(response)
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Agregar puntos a un jugador
   */
  agregarPuntos: async (playerId: number, data: AddPointsRequest): Promise<PlayerScore> => {
    try {
      const response = await apiClient.post(
        `/puntuaciones/jugador/${playerId}/agregar-puntos/`,
        data
      )
      return extractApiData(response)
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Restar puntos a un jugador
   */
  restarPuntos: async (playerId: number, data: AddPointsRequest): Promise<PlayerScore> => {
    try {
      const response = await apiClient.post(
        `/puntuaciones/jugador/${playerId}/restar-puntos/`,
        data
      )
      return extractApiData(response)
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Marcar juego como completado
   */
  juegoCompletado: async (playerId: number, data: { bonus_points?: number }): Promise<PlayerScore> => {
    try {
      const response = await apiClient.post(
        `/puntuaciones/jugador/${playerId}/juego-completado/`,
        data
      )
      return extractApiData(response)
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Reiniciar puntuación de un jugador
   */
  reiniciarPuntuacion: async (playerId: number): Promise<PlayerScore> => {
    try {
      const response = await apiClient.post(
        `/puntuaciones/jugador/${playerId}/reiniciar/`
      )
      return extractApiData(response)
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  // --- Score Events (Eventos de Puntuación) ---

  /**
   * Obtener todos los eventos de puntuación
   */
  obtenerEventos: async (): Promise<ScoreEvent[]> => {
    try {
      const response = await apiClient.get('/eventos-puntuacion/')
      return extractApiData(response)
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Obtener eventos de un jugador específico
   */
  obtenerEventosJugador: async (playerId: number): Promise<ScoreEvent[]> => {
    try {
      const response = await apiClient.get(
        `/eventos-puntuacion/jugador/${playerId}/`
      )
      return extractApiData(response)
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Obtener eventos por tipo
   */
  obtenerEventosPorTipo: async (eventType: string): Promise<ScoreEvent[]> => {
    try {
      const response = await apiClient.get(
        `/eventos-puntuacion/tipo/${eventType}/`
      )
      return extractApiData(response)
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Obtener eventos recientes
   */
  obtenerEventosRecientes: async (limit?: number): Promise<ScoreEvent[]> => {
    try {
      const params = limit ? { limit } : {}
      const response = await apiClient.get(
        '/eventos-puntuacion/recientes/',
        { params }
      )
      return extractApiData(response)
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Obtener estadísticas de un jugador
   */
  obtenerEstadisticasJugador: async (playerId: number): Promise<PlayerStatistics> => {
    try {
      const response = await apiClient.get(
        `/eventos-puntuacion/jugador/${playerId}/estadisticas/`
      )
      return extractApiData(response)
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Crear un evento de puntuación
   */
  crearEvento: async (data: Omit<ScoreEvent, 'id' | 'timestamp'>): Promise<ScoreEvent> => {
    try {
      const response = await apiClient.post(
        '/eventos-puntuacion/crear-evento/',
        data
      )
      return extractApiData(response)
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  }
}

