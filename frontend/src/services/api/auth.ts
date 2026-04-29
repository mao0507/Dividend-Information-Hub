import api from '../request'

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload extends LoginPayload {
  name?: string
}

export interface AuthResponse {
  user: { id: string; email: string; name?: string }
}

export const authApi = {
  register: (payload: RegisterPayload) =>
    api.post<AuthResponse>('/auth/register', payload),

  login: (payload: LoginPayload) =>
    api.post<AuthResponse>('/auth/login', payload),

  logout: () => api.delete('/auth/logout'),

  refresh: () => api.post<AuthResponse>('/auth/refresh'),

  me: () => api.get<AuthResponse['user']>('/auth/me'),
}
