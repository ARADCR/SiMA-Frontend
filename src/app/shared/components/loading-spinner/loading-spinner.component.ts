import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="spinner-overlay" [class.inline]="inline" [class.fullscreen]="!inline">
      <div class="spinner-container">
        <div class="spinner" [style.width.px]="size" [style.height.px]="size"></div>
        @if (mensaje) {
          <p class="spinner-mensaje">{{ mensaje }}</p>
        }
      </div>
    </div>
  `,
  styles: [`
    .spinner-overlay {
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .spinner-overlay.fullscreen {
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, 0.8);
      backdrop-filter: blur(4px);
      z-index: 9999;
    }
    .spinner-overlay.inline {
      padding: 2rem;
    }
    .spinner-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
    }
    .spinner {
      border: 3px solid rgba(79, 70, 229, 0.2);
      border-top-color: #4f46e5;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    .spinner-mensaje {
      color: #94a3b8;
      font-size: 0.875rem;
    }
  `]
})
export class LoadingSpinnerComponent {
  @Input() size = 40;
  @Input() inline = false;
  @Input() mensaje = '';
}
