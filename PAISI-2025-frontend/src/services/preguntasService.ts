import apiClient, { handleApiError, extractApiData } from './api'

// Tipos basados en los modelos del backend
export interface Answer {
  id: number
  text: string
  is_correct: boolean
  question: number
}

export interface Question {
  id: number
  text: string
  points: number
  theme: string // NEGRITOS, PALLAS, TUPAC, etc.
  is_active: boolean
  answers: Answer[]
}

export interface TriviaFact {
  id: number
  title: string
  content: string
  theme: string
  is_active: boolean
  created_at: string
}

export interface PreguntaQuery {
  theme?: string
  is_active?: boolean
}

export interface ValidateAnswerRequest {
  answer_id: number
}

export interface ValidateAnswerResponse {
  is_correct: boolean
  correct_answer_id: number
  points_awarded: number
}

// Servicio de preguntas/trivia
export const preguntasService = {
  /**
   * Obtener todas las preguntas
   */
  obtenerPreguntas: async (query?: PreguntaQuery): Promise<Question[]> => {
    try {
      const response = await apiClient.get('/preguntas/', { params: query })
      return extractApiData<Question[]>(response)
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Obtener preguntas con sus respuestas
   */
  obtenerPreguntasConRespuestas: async (): Promise<Question[]> => {
    try {
      const response = await apiClient.get('/preguntas/con-respuestas/')
      return extractApiData<Question[]>(response)
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Obtener una pregunta específica
   */
  obtenerPregunta: async (id: number): Promise<Question> => {
    try {
      const response = await apiClient.get(`/preguntas/${id}/`)
      return extractApiData<Question>(response)
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Obtener pregunta aleatoria
   */
  obtenerPreguntaAleatoria: async (theme?: string): Promise<Question> => {
    try {
      const params = theme ? { theme } : {}
      const response = await apiClient.get('/preguntas/random/', { params })
      return extractApiData<Question>(response)
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Obtener preguntas por tema
   */
  obtenerPreguntasPorTema: async (theme: string): Promise<Question[]> => {
    try {
      const response = await apiClient.get(`/preguntas/tema/${theme}/`)
      return extractApiData<Question[]>(response)
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Validar respuesta
   */
  validarRespuesta: async (
    questionId: number,
    data: ValidateAnswerRequest
  ): Promise<ValidateAnswerResponse> => {
    try {
      const response = await apiClient.post(`/preguntas/${questionId}/validar-respuesta/`, data)
      return extractApiData<ValidateAnswerResponse>(response)
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Obtener todas las respuestas de una pregunta
   */
  obtenerRespuestasDePregunta: async (questionId: number): Promise<Answer[]> => {
    try {
      const response = await apiClient.get(`/respuestas/pregunta/${questionId}/`)
      return extractApiData<Answer[]>(response)
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Obtener respuesta correcta de una pregunta
   */
  obtenerRespuestaCorrecta: async (questionId: number): Promise<Answer> => {
    try {
      const response = await apiClient.get(`/respuestas/correcta/${questionId}/`)
      return extractApiData<Answer>(response)
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  // --- Datos Curiosos (Trivia Facts) ---

  /**
   * Obtener todos los datos curiosos
   */
  obtenerDatosCuriosos: async (theme?: string): Promise<TriviaFact[]> => {
    try {
      const params = theme ? { theme } : {}
      const response = await apiClient.get('/datos-curiosos/', { params })
      return extractApiData<TriviaFact[]>(response)
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Obtener un dato curioso específico
   */
  obtenerDatoCurioso: async (id: number): Promise<TriviaFact> => {
    try {
      const response = await apiClient.get(`/datos-curiosos/${id}/`)
      return extractApiData<TriviaFact>(response)
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Obtener dato curioso aleatorio
   */
  obtenerDatoCuriosoAleatorio: async (theme?: string): Promise<TriviaFact> => {
    try {
      const params = theme ? { theme } : {}
      const response = await apiClient.get('/datos-curiosos/random/', { params })
      return extractApiData<TriviaFact>(response)
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Obtener datos curiosos por tema
   */
  obtenerDatosCuriososPorTema: async (theme: string): Promise<TriviaFact[]> => {
    try {
      const response = await apiClient.get(`/datos-curiosos/tema/${theme}/`)
      return extractApiData<TriviaFact[]>(response)
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  }
}
