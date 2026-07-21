import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { ApiService } from './api.service';

export interface ChatMessageDTO {
  rol: 'usuario' | 'bot';
  texto: string;
}

export interface ChatResponse {
  respuesta: string;
  timestamp: string;
}

export interface CuidadorRankeado {
  idUsuario: number;
  nombre: string;
  scoreRelevancia: number;
  justificacion: string;
}

export interface BusquedaCuidadorIAResponse {
  resumenBusqueda: string;
  cuidadoresRankeados: CuidadorRankeado[];
}

export interface MatchCuidadorResponse {
  scoreCompatibilidad: number;
  justificacion: string;
  areasFortaleza: string[];
  areasAtencion: string[];
}

export interface AnalisisPerfilResponse {
  especialidadesDetectadas: string[];
  experienciaEstimada: string;
  certificacionesDetectadas: string[];
  resumenGenerado: string;
  advertencias: string[];
  tagsRecomendados: string[];
}

export interface PerfilCuidadorResponse {
  descripcionPerfil: string | null;
  especialidades: string[];
  experiencia: string | null;
  certificaciones: string[];
  resumenIa: string | null;
  tags: string[];
  perfilAnalizado: boolean;
}

export interface ResumenReporteIAResponse {
  resumenNarrativo: string;
  puntosClave: string[];
  recomendaciones: string[];
}

export type SeveridadPatron = 'baja' | 'media' | 'alta';
export type TipoPatron = 'temporal' | 'medicamento' | 'metodo' | 'tendencia';

export interface PatronDTO {
  tipo: TipoPatron;
  descripcion: string;
  severidad: SeveridadPatron;
  recomendacion: string;
}

export interface PatronesAdherenciaResponse {
  patronesDetectados: PatronDTO[];
  mensajeInformativo: string | null;
}

export interface AlertaResumenDTO {
  idAlerta: number;
  tipo: string;
  mensaje: string;
  justificacion: string;
}

export interface EscaladaDTO {
  descripcion: string;
  alertasRelacionadas: number[];
  recomendacion: string;
}

export interface ResumenAlertasIAResponse {
  resumenEjecutivo: string;
  alertasCriticas: AlertaResumenDTO[];
  alertasInformativas: number;
  alertasResueltas: number;
  escaladas: EscaladaDTO[];
}

export interface ResumenObservacionesResponse {
  resumen: string;
  observacionesAnalizadas: number;
  periodoAnalizado: string;
  alertasIdentificadas: string[];
}

export type UrgenciaSugerida = 'normal' | 'importante' | 'urgente';

export interface EvaluarUrgenciaRequest {
  idAdulto: number;
  tensionArterial?: string;
  frecuenciaCardiaca?: string;
  temperatura?: string;
  textoObservacion?: string;
}

export interface EvaluacionUrgenciaResponse {
  urgenciaSugerida: UrgenciaSugerida;
  justificacion: string;
  valoresAnormales: string[];
  recomendaciones: string[];
}

@Injectable({
  providedIn: 'root'
})
export class AiService {
  private readonly endpoint = '/ai';

  // Cachés en memoria por idAdulto: sobreviven mientras la SPA no recargue la página,
  // así el análisis no se vuelve a pedir al LLM cada vez que se re-visita el módulo.
  private resumenReporteCache = new Map<number, ResumenReporteIAResponse>();
  private patronesAdherenciaCache = new Map<number, PatronesAdherenciaResponse>();

  constructor(private api: ApiService) {}

  chat(idAdulto: number, mensaje: string, historial?: ChatMessageDTO[]): Observable<ChatResponse> {
    return this.api
      .post<ChatResponse>(`${this.endpoint}/chat`, { idAdulto, mensaje, historial })
      .pipe(map(r => r.data));
  }

  buscarCuidadorIA(query: string, idAdulto: number): Observable<BusquedaCuidadorIAResponse> {
    return this.api
      .post<BusquedaCuidadorIAResponse>(`${this.endpoint}/buscar-cuidador`, { query, idAdulto })
      .pipe(map(r => r.data));
  }

  matchCuidador(idCuidador: number, idAdulto: number): Observable<MatchCuidadorResponse> {
    return this.api
      .get<MatchCuidadorResponse>(`${this.endpoint}/match-cuidador/${idCuidador}`, { idAdulto })
      .pipe(map(r => r.data));
  }

  analizarPerfil(descripcion: string): Observable<AnalisisPerfilResponse> {
    return this.api
      .post<AnalisisPerfilResponse>(`${this.endpoint}/analizar-perfil`, { descripcion })
      .pipe(map(r => r.data));
  }

  obtenerPerfilCuidador(): Observable<PerfilCuidadorResponse> {
    return this.api
      .get<PerfilCuidadorResponse>(`${this.endpoint}/perfil-cuidador`)
      .pipe(map(r => r.data));
  }

  actualizarPerfilCuidador(tags: string[]): Observable<void> {
    return this.api
      .put<void>(`${this.endpoint}/perfil-cuidador`, { tags })
      .pipe(map(() => void 0));
  }

  getResumenReporte(idAdulto: number): Observable<ResumenReporteIAResponse> {
    const cacheado = this.resumenReporteCache.get(idAdulto);
    if (cacheado) return of(cacheado);

    return this.api
      .get<ResumenReporteIAResponse>(`${this.endpoint}/reporte/${idAdulto}/resumen`)
      .pipe(
        map(r => r.data),
        tap(data => this.resumenReporteCache.set(idAdulto, data))
      );
  }

  getPatronesAdherencia(idAdulto: number): Observable<PatronesAdherenciaResponse> {
    const cacheado = this.patronesAdherenciaCache.get(idAdulto);
    if (cacheado) return of(cacheado);

    return this.api
      .get<PatronesAdherenciaResponse>(`${this.endpoint}/reporte/${idAdulto}/patrones`)
      .pipe(
        map(r => r.data),
        tap(data => this.patronesAdherenciaCache.set(idAdulto, data))
      );
  }

  getResumenAlertas(idAdulto: number): Observable<ResumenAlertasIAResponse> {
    // El backend ya cachea por 15 minutos; no se duplica el cacheo en el cliente
    // para no mostrar un resumen desactualizado durante una sesión larga de SPA.
    return this.api
      .get<ResumenAlertasIAResponse>(`${this.endpoint}/alertas/${idAdulto}/resumen`)
      .pipe(map(r => r.data));
  }

  getResumenObservaciones(idAdulto: number): Observable<ResumenObservacionesResponse> {
    return this.api
      .get<ResumenObservacionesResponse>(`${this.endpoint}/observaciones/${idAdulto}/resumen`)
      .pipe(map(r => r.data));
  }

  evaluarUrgencia(request: EvaluarUrgenciaRequest): Observable<EvaluacionUrgenciaResponse> {
    return this.api
      .post<EvaluacionUrgenciaResponse>(`${this.endpoint}/observaciones/evaluar-urgencia`, request)
      .pipe(map(r => r.data));
  }
}
