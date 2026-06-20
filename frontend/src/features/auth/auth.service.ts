import api from '@/common/api';
import type { 
  AuthResponse, 
  LoginPayload, 
  RegisterPayload, 
  User, 
  ChangePasswordPayload, 
  UpdateProfilePayload 
} from '@/common/types';

export const AuthService = {
  login: (payload: LoginPayload) => api.post<AuthResponse>('/auth/login', payload).then(res => res.data),
  register: (payload: RegisterPayload) => api.post<AuthResponse>('/auth/register', payload).then(res => res.data),
  getMe: () => api.get<User>('/users/me').then(res => res.data),
  updateProfile: (payload: UpdateProfilePayload) => api.put<User>('/users/me', payload).then(res => res.data),
  changePassword: (payload: ChangePasswordPayload) => api.put('/users/me/password', payload).then(res => res.data),
};
