import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal-confirmar',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (visible) {
      <div class="modal-backdrop" (click)="onCancelar()">
        <div class="modal-box" (click)="$event.stopPropagation()">
          <div class="modal-icon" [class]="tipo">
            @if (tipo === 'danger') {
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
              </svg>
            } @else {
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M11 18h2v-2h-2v2zm1-16C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-2.21 0-4 1.79-4 4h2c0-1.1.9-2 2-2s2 .9 2 2c0 2-3 1.75-3 5h2c0-2.25 3-2.5 3-5 0-2.21-1.79-4-4-4z"/>
              </svg>
            }
          </div>
          <h3 class="modal-titulo">{{ titulo }}</h3>
          <p class="modal-mensaje">{{ mensaje }}</p>
          <div class="modal-acciones">
            <button class="btn-cancelar" (click)="onCancelar()" id="modal-cancelar-btn">{{ textoCancelar }}</button>
            <button class="btn-confirmar" [class]="tipo" (click)="onConfirmar()" id="modal-confirmar-btn">{{ textoConfirmar }}</button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.7);
      backdrop-filter: blur(4px);
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
      animation: fadeIn 0.2s ease;
    }
    .modal-box {
      background: #1e293b;
      border: 1px solid #475569;
      border-radius: 1rem;
      padding: 2rem;
      max-width: 420px;
      width: 90%;
      text-align: center;
      animation: slideInUp 0.25s ease;
    }
    .modal-icon {
      width: 56px; height: 56px;
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      margin: 0 auto 1rem;
    }
    .modal-icon svg { width: 28px; height: 28px; }
    .modal-icon.danger  { background: rgba(239,68,68,0.15); color: #ef4444; }
    .modal-icon.warning { background: rgba(245,158,11,0.15); color: #f59e0b; }
    .modal-icon.info    { background: rgba(79,70,229,0.15); color: #818cf8; }
    .modal-titulo  { font-size: 1.25rem; font-weight: 700; color: #f1f5f9; margin-bottom: 0.5rem; }
    .modal-mensaje { font-size: 0.875rem; color: #94a3b8; margin-bottom: 1.5rem; line-height: 1.6; }
    .modal-acciones { display: flex; gap: 0.75rem; justify-content: center; }
    .btn-cancelar  { padding: 0.625rem 1.5rem; border-radius: 0.5rem; background: #334155; color: #f1f5f9; font-weight: 600; font-size: 0.875rem; cursor: pointer; border: 1px solid #475569; transition: all 0.15s; }
    .btn-cancelar:hover { background: #475569; }
    .btn-confirmar { padding: 0.625rem 1.5rem; border-radius: 0.5rem; font-weight: 600; font-size: 0.875rem; cursor: pointer; border: none; transition: all 0.15s; }
    .btn-confirmar.danger  { background: #ef4444; color: white; }
    .btn-confirmar.danger:hover { background: #dc2626; }
    .btn-confirmar.warning { background: #f59e0b; color: white; }
    .btn-confirmar.warning:hover { background: #d97706; }
    .btn-confirmar.info    { background: #4f46e5; color: white; }
    .btn-confirmar.info:hover { background: #3730a3; }
  `]
})
export class ModalConfirmarComponent {
  @Input() visible = false;
  @Input() titulo  = '¿Estás seguro?';
  @Input() mensaje = 'Esta acción no se puede deshacer.';
  @Input() tipo: 'danger' | 'warning' | 'info' = 'danger';
  @Input() textoConfirmar = 'Confirmar';
  @Input() textoCancelar  = 'Cancelar';

  @Output() confirmar = new EventEmitter<void>();
  @Output() cancelar  = new EventEmitter<void>();

  onConfirmar(): void { this.confirmar.emit(); }
  onCancelar():  void { this.cancelar.emit(); }
}
