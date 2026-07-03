export type RolUsuario = 'Administrador' | 'Familiar' | 'Cuidador' | 'Adulto Mayor';

export interface Rol {
  idRol: number;
  nombreRol: string;
}

export interface Usuario {
  idUsuario: number;
  nombre: string;
  apellido: string;
  correo: string;
  idRol: number;
  nombreRol: RolUsuario;
  wechatOpenid?: string;
  activo: boolean;
  creadoEn?: string;
  ultimoAcceso?: string;
}

export interface UsuarioCreate {
  nombre: string;
  apellido: string;
  correo: string;
  password: string;
  idRol: number;
  wechatOpenid?: string;
}

export interface UsuarioUpdate {
  nombre?: string;
  apellido?: string;
  correo?: string;
  password?: string;
  idRol?: number;
  wechatOpenid?: string;
}

export interface CredencialesLogin {
  correo: string;
  password: string;
}

export interface TokenPayload {
  sub: string;
  userId: number;
  rol: RolUsuario;
  nombre: string;
  exp: number;
  iat: number;
}