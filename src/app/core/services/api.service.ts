import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { RespuestaApi, RespuestaPaginada, ParametrosPaginacion } from '../models/respuesta-api.model';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /** Construye HttpParams desde un objeto de filtros */
  private buildParams(params?: Record<string, unknown>): HttpParams {
    let httpParams = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([key, val]) => {
        if (val !== null && val !== undefined && val !== '') {
          httpParams = httpParams.set(key, String(val));
        }
      });
    }
    return httpParams;
  }

  get<T>(endpoint: string, params?: Record<string, unknown>): Observable<RespuestaApi<T>> {
    return this.http
      .get<RespuestaApi<T>>(`${this.baseUrl}${endpoint}`, { params: this.buildParams(params) })
      .pipe(catchError(this.handleError));
  }

  getPaginado<T>(endpoint: string, paginacion?: Record<string, unknown>): Observable<RespuestaPaginada<T>> {
    return this.http
      .get<RespuestaPaginada<T>>(`${this.baseUrl}${endpoint}`, { params: this.buildParams(paginacion) })
      .pipe(catchError(this.handleError));
  }

  post<T>(endpoint: string, body: unknown): Observable<RespuestaApi<T>> {
    return this.http
      .post<RespuestaApi<T>>(`${this.baseUrl}${endpoint}`, body)
      .pipe(catchError(this.handleError));
  }

  put<T>(endpoint: string, body: unknown): Observable<RespuestaApi<T>> {
    return this.http
      .put<RespuestaApi<T>>(`${this.baseUrl}${endpoint}`, body)
      .pipe(catchError(this.handleError));
  }

  patch<T>(endpoint: string, body: unknown): Observable<RespuestaApi<T>> {
    return this.http
      .patch<RespuestaApi<T>>(`${this.baseUrl}${endpoint}`, body)
      .pipe(catchError(this.handleError));
  }

  delete<T>(endpoint: string): Observable<RespuestaApi<T>> {
    return this.http
      .delete<RespuestaApi<T>>(`${this.baseUrl}${endpoint}`)
      .pipe(catchError(this.handleError));
  }

  private handleError(error: unknown): Observable<never> {
    const err = error as { status?: number; error?: { mensaje?: string; data?: Record<string, unknown> }; message?: string };
    let mensaje = 'Error inesperado. Inténtalo de nuevo.';

    if (err.status === 0) {
      mensaje = 'No se pudo conectar con el servidor.';
    } else if (err.status === 401) {
      mensaje = 'Sesión expirada. Inicia sesión nuevamente.';
    } else if (err.status === 403) {
      mensaje = 'No tienes permisos para realizar esta acción.';
    } else if (err.status === 404) {
      mensaje = 'Recurso no encontrado.';
    } else if (err.error?.mensaje) {
      mensaje = err.error.mensaje;
      // Si el backend envía errores de validación en la propiedad "data"
      if (err.error.data && typeof err.error.data === 'object') {
        const validationErrors = Object.values(err.error.data).filter(v => typeof v === 'string');
        if (validationErrors.length > 0) {
          mensaje += `: ${validationErrors.join(', ')}`;
        }
      }
    }

    return throwError(() => ({ mensaje, status: err.status }));
  }
}
