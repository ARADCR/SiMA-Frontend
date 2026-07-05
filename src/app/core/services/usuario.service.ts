import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';
import { Usuario, UsuarioCreate, UsuarioUpdate } from '../models/usuario.model';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private readonly endpoint = '/usuarios';

  constructor(private api: ApiService) {}

  /** GET /usuarios — lista todos los usuarios activos */
  listar(): Observable<Usuario[]> {
    return this.api.get<Usuario[]>(this.endpoint).pipe(
      map(r => r.data)
    );
  }

  /** GET /usuarios/{id} */
  getById(id: number): Observable<Usuario> {
    return this.api.get<Usuario>(`${this.endpoint}/${id}`).pipe(
      map(r => r.data)
    );
  }

  /** POST /usuarios */
  create(dto: UsuarioCreate): Observable<Usuario> {
    return this.api.post<Usuario>(this.endpoint, dto).pipe(
      map(r => r.data)
    );
  }

  /** PUT /usuarios/{id} */
  update(id: number, dto: UsuarioUpdate): Observable<Usuario> {
    return this.api.put<Usuario>(`${this.endpoint}/${id}`, dto).pipe(
      map(r => r.data)
    );
  }

  /** DELETE /usuarios/{id} — soft delete (activo = false) */
  desactivar(id: number): Observable<void> {
    return this.api.delete<void>(`${this.endpoint}/${id}`).pipe(
      map(() => void 0)
    );
  }
}

