import api from '@/common/api';
import type { User, Page, AdminResetPasswordPayload } from '@/common/types';

/**
 * UserService — wraps all /users endpoints.
 *
 * Backend routes (context-path: /api/v1):
 *   GET /users/me                    → own profile (authenticated)
 *   PUT /users/me                    → update profile
 *   PUT /users/me/password           → change password
 *   GET /users?page=&size=&sort=     → list all users (ADMIN, paginated)
 *   PUT /users/{id}/activate         → activate user (ADMIN)
 *   PUT /users/{id}/deactivate       → deactivate user (ADMIN)
 *   PUT /users/{id}/reset-password   → reset user password (ADMIN)
 */
export const UserService = {
  // ── Own Profile ──────────────────────────────────────────
  getMe: () =>
    api.get<User>('/users/me').then(res => res.data),

  // ── Admin User Management ────────────────────────────────
  listUsers: (page = 0, size = 20) =>
    api.get<Page<User>>(`/users?page=${page}&size=${size}&sort=username,asc`).then(res => res.data),

  activateUser: (id: number) =>
    api.put<User>(`/users/${id}/activate`).then(res => res.data),

  deactivateUser: (id: number) =>
    api.put<User>(`/users/${id}/deactivate`).then(res => res.data),

  resetPassword: (id: number, payload: AdminResetPasswordPayload) =>
    api.put(`/users/${id}/reset-password`, payload).then(res => res.data),
};
