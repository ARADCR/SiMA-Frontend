/**
 * Corrige los styles inline de todos los stubs:
 * Reemplaza SCSS anidado ( h1 { ... } dentro de .page-header { } )
 * con CSS plano compatible con el IDE y el compilador.
 */
const fs   = require('fs');
const path = require('path');

// El patrón problemático que viene del script create-stubs.js
const OLD_STYLE = `.page-container { padding: 2rem; max-width: 1400px; margin: 0 auto; } .page-header { margin-bottom: 2rem; } .page-header h1 { font-size: 1.875rem; font-weight: 800; color: #f1f5f9; margin-bottom: 0.5rem; } .page-header p { color: #94a3b8; } .sima-card { background: #1e293b; border: 1px solid #475569; border-radius: 0.75rem; padding: 1.5rem; }`;

// CSS plano equivalente que no tiene SCSS anidado
const NEW_STYLE = `.page-container { padding: 2rem; max-width: 1400px; margin: 0 auto; }\n    .page-header { margin-bottom: 2rem; }\n    .page-header h1 { font-size: 1.875rem; font-weight: 800; color: #f1f5f9; margin-bottom: 0.5rem; }\n    .page-header p { color: #94a3b8; }\n    .sima-card { background: #1e293b; border: 1px solid #475569; border-radius: 0.75rem; padding: 1.5rem; }`;

const stubs = [
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

let fixed = 0;
for (const f of stubs) {
  let content = fs.readFileSync(f, 'utf8');
  if (content.includes(OLD_STYLE)) {
    content = content.replace(OLD_STYLE, NEW_STYLE);
    fs.writeFileSync(f, content, 'utf8');
    console.log('✓ Fixed:', f);
    fixed++;
  } else {
    // Buscar el patrón más flexible: .page-header { margin-bottom: 2rem; } con h1 inline
    // El problema es que el script usó `.page-header h1` en una sola línea
    const match = content.match(/styles:\s*\[`([^`]*)`\]/s);
    if (match) {
      const styleContent = match[1];
      if (styleContent.includes('.page-header h1') || styleContent.includes('h1 {') || styleContent.includes('h3 {')) {
        console.log('⚠ Different pattern:', path.basename(f));
        // Mostrar para revisión manual
        console.log('  Current style:', styleContent.substring(0, 150));
      } else {
        console.log('✓ Already OK:', path.basename(f));
      }
    }
  }
}
console.log('\nFixed:', fixed, '/', stubs.length);
