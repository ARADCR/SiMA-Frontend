/**
 * Script para limpiar los styles inline de los componentes Angular:
 * - El IDE puede marcar errores por SCSS anidado en styles:[] aunque ng build pase.
 * - Los stubs usan estilos simples que están bien, el script solo asegura que estén correctos.
 * Este script es solo informativo para ver el contenido actual de los stubs.
 */
const fs   = require('fs');
const path = require('path');

// Los stubs generados por el script anterior tienen este patrón de styles:
const STUB_STYLE = `.page-container { padding: 2rem; max-width: 1400px; margin: 0 auto; } .page-header { margin-bottom: 2rem; } .page-header h1 { font-size: 1.875rem; font-weight: 800; color: #f1f5f9; margin-bottom: 0.5rem; } .page-header p { color: #94a3b8; } .sima-card { background: #1e293b; border: 1px solid #475569; border-radius: 0.75rem; padding: 1.5rem; }`;

// Verificar que los stubs están bien (no tienen SCSS anidado problemático)
const stubFiles = [
  'src/app/modules/familiar/pages/lista-adultos/lista-adultos.component.ts',
  'src/app/modules/familiar/pages/detalle-adulto/detalle-adulto.component.ts',
  'src/app/modules/familiar/pages/medicamentos/medicamentos.component.ts',
  'src/app/modules/familiar/pages/historial/historial.component.ts',
  'src/app/modules/familiar/pages/alertas/alertas.component.ts',
  'src/app/modules/cuidador/pages/dashboard-cuidador/dashboard-cuidador.component.ts',
  'src/app/modules/cuidador/pages/registrar-tomas/registrar-tomas.component.ts',
  'src/app/modules/cuidador/pages/observaciones/observaciones.component.ts',
  'src/app/modules/cuidador/pages/cumplimiento/cumplimiento.component.ts',
  'src/app/modules/adulto-mayor/pages/dashboard-adulto/dashboard-adulto.component.ts',
  'src/app/modules/adulto-mayor/pages/recordatorios/recordatorios.component.ts',
  'src/app/modules/adulto-mayor/pages/chatbot/chatbot.component.ts',
  'src/app/modules/adulto-mayor/pages/boton-emergencia/boton-emergencia.component.ts',
];

for (const f of stubFiles) {
  const content = fs.readFileSync(f, 'utf8');
  // Verificar si tiene SCSS problemático
  if (content.includes('&:') || content.includes('@use') || content.includes('h1 {') || content.includes('h3 {')) {
    console.log('Has SCSS nesting:', f);
    // Mostrar la línea de styles
    const lines = content.split('\n');
    const styleLine = lines.findIndex(l => l.includes("styles: ["));
    if (styleLine !== -1) {
      console.log('  Line', styleLine + 1, ':', lines[styleLine].substring(0, 80));
    }
  } else {
    console.log('OK:', f);
  }
}
