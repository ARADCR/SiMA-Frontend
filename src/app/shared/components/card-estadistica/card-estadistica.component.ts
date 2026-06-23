import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

type TendenciaTipo = 'up' | 'down' | 'neutral';

@Component({
  selector: 'app-card-estadistica',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card-stat" [class]="'variant-' + variant">
      <div class="card-header">
        <div class="icon-wrapper" [class]="'icon-' + variant">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path [attr.d]="iconPath"/>
          </svg>
        </div>
        @if (tendencia !== 'neutral') {
          <div class="tendencia" [class]="'tend-' + tendencia">
            <svg viewBox="0 0 24 24" fill="currentColor" width="12" height="12">
              @if (tendencia === 'up') {
                <path d="M7 14l5-5 5 5z"/>
              } @else {
                <path d="M7 10l5 5 5-5z"/>
              }
            </svg>
            {{ tendenciaValor }}
          </div>
        }
      </div>

      <div class="card-body">
        <p class="card-valor">{{ valor }}</p>
        <p class="card-label">{{ label }}</p>
        @if (descripcion) {
          <p class="card-desc">{{ descripcion }}</p>
        }
      </div>
    </div>
  `,
  styles: [`
    .card-stat {
      background: #1e293b;
      border: 1px solid #475569;
      border-radius: 0.75rem;
      padding: 1.25rem;
      transition: all 0.25s ease;
      cursor: default;
    }
    .card-stat:hover { border-color: #4f46e5; box-shadow: 0 0 20px rgba(79,70,229,0.2); transform: translateY(-2px); }
    .card-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem; }
    .icon-wrapper { width: 44px; height: 44px; border-radius: 0.5rem; display: flex; align-items: center; justify-content: center; }
    .icon-wrapper svg { width: 22px; height: 22px; }
    .icon-primary  { background: rgba(79,70,229,0.15); color: #818cf8; }
    .icon-success  { background: rgba(16,185,129,0.15); color: #10b981; }
    .icon-warning  { background: rgba(245,158,11,0.15); color: #f59e0b; }
    .icon-danger   { background: rgba(239,68,68,0.15); color: #ef4444; }
    .icon-info     { background: rgba(59,130,246,0.15); color: #3b82f6; }
    .tendencia { display: flex; align-items: center; gap: 2px; padding: 2px 8px; border-radius: 9999px; font-size: 0.75rem; font-weight: 700; }
    .tend-up   { background: rgba(16,185,129,0.15); color: #10b981; }
    .tend-down { background: rgba(239,68,68,0.15);  color: #ef4444; }
    .card-valor { font-size: 2rem; font-weight: 800; color: #f1f5f9; line-height: 1; margin-bottom: 0.25rem; }
    .card-label { font-size: 0.875rem; font-weight: 600; color: #94a3b8; margin-bottom: 0.25rem; }
    .card-desc  { font-size: 0.75rem; color: #64748b; }
  `]
})
export class CardEstadisticaComponent {
  @Input() label       = '';
  @Input() valor: string | number = 0;
  @Input() iconPath    = 'M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z';
  @Input() variant: 'primary' | 'success' | 'warning' | 'danger' | 'info' = 'primary';
  @Input() tendencia: TendenciaTipo = 'neutral';
  @Input() tendenciaValor = '';
  @Input() descripcion = '';
}
