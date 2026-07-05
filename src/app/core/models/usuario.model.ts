export type NombreRol = 'Administrador' | 'Familiar' | 'Cuidador';

/** Mapa de roles disponibles: nombre → idRol tal como los inserta el DataSeeder */
export const ROLES_DISPONIBLES: { idRol: number; nombreRol: NombreRol }[] = [
  { idRol: 1, nombreRol: 'Administrador' },
  { idRol: 2, nombreRol: 'Familiar' },
  { idRol: 3, nombreRol: 'Cuidador' },
];

/** Coincide con UsuarioResponse del backend */
export interface Usuario {
  idUsuario: number;
  nombre: string;
  apellido: string;
  correo: string;
  idRol: number;
  nombreRol: NombreRol;
  wechatOpenid?: string | null;
  activo: boolean;
  creadoEn?: string;
  ultimoAcceso?: string | null;
}

/** Coincide con UsuarioCreateRequest del backend */
export interface UsuarioCreate {
  nombre: string;
  apellido: string;
  correo: string;
  password: string;
  idRol: number;
  wechatOpenid?: string | null;
}

/** Coincide con UsuarioUpdateRequest del backend */
export interface UsuarioUpdate {
  nombre: string;
  apellido: string;
  correo: string;
  password?: string | null;
  idRol?: number | null;
  wechatOpenid?: string | null;
}

export interface CredencialesLogin {
  email: string;
  password: string;
}

export interface TokenPayload {
  sub: string;
  userId: number;
  rol: NombreRol;
  nombre: string;
  exp: number;
  iat: number;
}
