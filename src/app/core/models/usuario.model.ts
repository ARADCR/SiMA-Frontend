export type RolUsuario = 'Administrador' | 'Familiar' | 'Cuidador';

export interface Usuario {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  rol: RolUsuario;
  activo: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface UsuarioCreate {
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  telefono?: string;
  rol: RolUsuario;
}

export interface UsuarioUpdate {
  nombre?: string;
  apellido?: string;
  telefono?: string;
  activo?: boolean;
}

export interface CredencialesLogin {
  email: string;
  password: string;
}

export interface TokenPayload {
  sub: string;          // email
  userId: number;
  rol: RolUsuario;
  nombre: string;
  exp: number;
  iat: number;
}
