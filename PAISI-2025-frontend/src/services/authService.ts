import apiClient, { handleApiError, extractApiData } from './api'

// Tipos para Auth
export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  password_confirm?: string
}

export interface AuthResponse {
  user: {
    id: number
    email: string
    first_name?: string
    last_name?: string
    avatar_url?: string
  }
  access_token: string
  refresh_token: string
}

// Tipos adicionales para OTP
export interface OTPRequest {
  email: string
}

export interface OTPValidation {
  email: string
  otp_code: string
}

export interface GoogleAuthRequest {
  token: string
}

export interface PasswordResetRequest {
  email: string
}

export interface PasswordResetConfirm {
  email: string
  otp_code: string
  new_password: string
}

// Servicio de autenticación
export const authService = {
  /**
   * Iniciar sesión
   */
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    try {
      const response = await apiClient.post(
        '/user/login/',
        {
          email: credentials.email,
          password: credentials.password
        }
      )
      return extractApiData(response)
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Registrar nuevo usuario
   */
  register: async (userData: RegisterRequest): Promise<AuthResponse> => {
    try {
      const response = await apiClient.post(
        '/user/register/',
        {
          email: userData.email,
          password: userData.password,
          password_confirm: userData.password_confirm || userData.password
        }
      )
      return extractApiData(response)
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Autenticación con Google
   */
  googleAuth: async (data: GoogleAuthRequest): Promise<AuthResponse> => {
    try {
      const response = await apiClient.post(
        '/user/google/',
        data
      )
      return extractApiData(response)
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Solicitar código OTP
   */
  requestOTP: async (data: OTPRequest): Promise<{ message: string }> => {
    try {
      const response = await apiClient.post(
        '/user/otp/request/',
        data
      )
      return extractApiData(response)
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Validar código OTP
   */
  validateOTP: async (data: OTPValidation): Promise<AuthResponse> => {
    try {
      const response = await apiClient.post(
        '/user/otp/validate/',
        data
      )
      return extractApiData(response)
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Solicitar restablecimiento de contraseña
   */
  requestPasswordReset: async (data: PasswordResetRequest): Promise<{ message: string }> => {
    try {
      const response = await apiClient.post(
        '/user/password/request-reset/',
        data
      )
      return extractApiData(response)
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Confirmar restablecimiento de contraseña
   */
  confirmPasswordReset: async (data: PasswordResetConfirm): Promise<{ message: string }> => {
    try {
      const response = await apiClient.post(
        '/user/password/confirm-reset/',
        data
      )
      return extractApiData(response)
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Cerrar sesión (lógica del cliente)
   */
  logout: async (): Promise<void> => {
    // El backend maneja sesión con cookies, simplemente limpiamos el estado local
    localStorage.removeItem('auth-storage')
  }
}

