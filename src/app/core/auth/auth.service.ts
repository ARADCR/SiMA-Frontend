import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { jwtDecode } from 'jwt-decode';
import { environment } from '../../../environments/environment';
import { CredencialesLogin, TokenPayload, RolUsuario } from '../models/usuario.model';
import { LoginResponse } from '../models/respuesta-api.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly loginUrl = `${environment.apiUrl}/auth/login`;
  private readonly refreshUrl = `${environment.apiUrl}/auth/refresh`;

  private _usuario$ = new BehaviorSubject<TokenPayload | null>(this.cargarUsuarioDesdeToken());
  readonly usuario$ = this._usuario$.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  // ─── Getters ─────────────────────────────────────────────────────────────────

  get usuarioActual(): TokenPayload | null {
    return this._usuario$.getValue();
  }

  get estaAutenticado(): boolean {
    const token = this.obtenerToken();
    if (!token) return false;
    return !this.tokenExpirado(token);
  }

  get rolActual(): RolUsuario | null {
    return this.usuarioActual?.rol ?? null;
  }

  // ─── Autenticación ────────────────────────────────────────────────────────────

  login(credenciales: CredencialesLogin): Observable<any> {
    const payload = { correo: credenciales.email, password: credenciales.password };
    return this.http.post<any>(this.loginUrl, payload).pipe(
      tap(resp => {
        // La API devuelve RespuestaApi con la data anidada
        const token = resp.data ? resp.data.token : resp.token;
        this.guardarTokens(token, '');
        const payload = jwtDecode<TokenPayload>(token);
        this._usuario$.next(payload);
      }),
      catchError(err => throwError(() => err))
    );
  }

  logout(): void {
    localStorage.removeItem(environment.jwtTokenKey);
    localStorage.removeItem(environment.jwtRefreshKey);
    this._usuario$.next(null);
    this.router.navigate(['/auth/login']);
  }

  refreshToken(): Observable<string> {
    const refreshToken = localStorage.getItem(environment.jwtRefreshKey);
    if (!refreshToken) return throwError(() => new Error('No refresh token'));

    return this.http.post<{ token: string }>(this.refreshUrl, { refreshToken }).pipe(
      map(resp => {
        localStorage.setItem(environment.jwtTokenKey, resp.token);
        const payload = jwtDecode<TokenPayload>(resp.token);
        this._usuario$.next(payload);
        return resp.token;
      })
    );
  }

  // ─── Tokens ───────────────────────────────────────────────────────────────────

  obtenerToken(): string | null {
    return localStorage.getItem(environment.jwtTokenKey);
  }

  private guardarTokens(token: string, refreshToken: string): void {
    localStorage.setItem(environment.jwtTokenKey, token);
    localStorage.setItem(environment.jwtRefreshKey, refreshToken);
  }

  private tokenExpirado(token: string): boolean {
    try {
      const decoded = jwtDecode<TokenPayload>(token);
      return Date.now() >= decoded.exp * 1000;
    } catch {
      return true;
    }
  }

  private cargarUsuarioDesdeToken(): TokenPayload | null {
    const token = localStorage.getItem(environment.jwtTokenKey);
    if (!token) return null;
    try {
      const decoded = jwtDecode<TokenPayload>(token);
      return Date.now() < decoded.exp * 1000 ? decoded : null;
    } catch {
      return null;
    }
  }

  // ─── Utilidades de rol ────────────────────────────────────────────────────────

  tieneRol(rol: RolUsuario | RolUsuario[]): boolean {
    if (!this.rolActual) return false;
    if (Array.isArray(rol)) return rol.includes(this.rolActual);
    return this.rolActual === rol;
  }

  /** Redirige al dashboard correspondiente al rol del usuario */
  redirigirPorRol(): void {
    const rutas: Record<RolUsuario, string> = {
      'Administrador': '/admin/dashboard',
      'Familiar':      '/familiar/dashboard',
      'Cuidador':      '/cuidador/dashboard',
    };
    const ruta = this.rolActual ? rutas[this.rolActual] : '/auth/login';
    this.router.navigate([ruta]);
  }
}
