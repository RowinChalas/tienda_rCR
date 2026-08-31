/**
 * Modelos de Dominio — Autenticación y Usuarios
 */

export type UserRole = 'admin' | 'supplier';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  supplierId?: string; // Si es rol 'supplier', el ID del taller asociado
  avatarUrl?: string;
  createdAt: string;
}
