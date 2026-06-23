import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';
import { Usuario, UsuarioCreate, UsuarioUpdate } from '../models/usuario.model';
import { RespuestaApi, RespuestaPaginada, ParametrosPaginacion } from '../models/respuesta-api.model';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private readonly endpoint = '/usuarios';

  constructor(private api: ApiService) {}

  getAll(params?: ParametrosPaginacion): Observable<RespuestaPaginada<Usuario>> {
    return this.api.getPaginado<Usuario>(this.endpoint, params as Record<string, unknown>);
  }

  getById(id: number): Observable<Usuario> {
    return this.api.get<Usuario>(`${this.endpoint}/${id}`).pipe(
      map(r => r.data)
    );
  }

  create(usuario: UsuarioCreate): Observable<Usuario> {
    return this.api.post<Usuario>(this.endpoint, usuario).pipe(
      map(r => r.data)
    );
  }

  update(id: number, datos: UsuarioUpdate): Observable<Usuario> {
    return this.api.put<Usuario>(`${this.endpoint}/${id}`, datos).pipe(
      map(r => r.data)
    );
  }

  activar(id: number): Observable<Usuario> {
    return this.api.patch<Usuario>(`${this.endpoint}/${id}/activar`, {}).pipe(
      map(r => r.data)
    );
  }

  desactivar(id: number): Observable<Usuario> {
    return this.api.patch<Usuario>(`${this.endpoint}/${id}/desactivar`, {}).pipe(
      map(r => r.data)
    );
  }

  delete(id: number): Observable<void> {
    return this.api.delete<void>(`${this.endpoint}/${id}`).pipe(
      map(() => void 0)
    );
  }
}
