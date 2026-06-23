export interface RespuestaApi<T = unknown> {
  success: boolean;
  mensaje?: string;
  data: T;
  timestamp?: string;
}

export interface RespuestaPaginada<T = unknown> {
  success: boolean;
  data: T[];
  total: number;
  pagina: number;
  porPagina: number;
  totalPaginas: number;
}

export interface ErrorApi {
  success: false;
  mensaje: string;
  errores?: string[];
  codigo?: string;
  timestamp?: string;
}

export interface ParametrosPaginacion {
  pagina?: number;
  porPagina?: number;
  ordenPor?: string;
  orden?: 'asc' | 'desc';
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
  expiresIn: number;
  usuario: {
    id: number;
    nombre: string;
    apellido: string;
    email: string;
    rol: string;
  };
}
