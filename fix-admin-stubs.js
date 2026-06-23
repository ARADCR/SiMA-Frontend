/**
 * Corrige el patrón SCSS anidado en los archivos admin stub:
 * .page-header { margin-bottom: 2rem; h1 { ... } p { ... } }
 * → estilos planos separados
 */
const fs   = require('fs');
const path = require('path');

const adminStubs = [
  'src/app/modules/admin/pages/gestion-usuarios/gestion-usuarios.component.ts',
  'src/app/modules/admin/pages/gestion-dispositivos/gestion-dispositivos.component.ts',
  'src/app/modules/admin/pages/configuracion-sistema/configuracion-sistema.component.ts',
];

const OLD = `.page-header { margin-bottom: 2rem; h1 { font-size: 1.875rem; font-weight: 800; color: #f1f5f9; margin-bottom: 0.5rem; } p { color: #94a3b8; } }`;
const NEW = `.page-header { margin-bottom: 2rem; }\n    .page-header h1 { font-size: 1.875rem; font-weight: 800; color: #f1f5f9; margin-bottom: 0.5rem; }\n    .page-header p { color: #94a3b8; }`;

for (const f of adminStubs) {
  let content = fs.readFileSync(f, 'utf8');
  if (content.includes(OLD)) {
    content = content.replace(OLD, NEW);
    fs.writeFileSync(f, content, 'utf8');
    console.log('✓ Fixed admin stub:', path.basename(f));
  } else {
    console.log('⚠ Pattern not found:', path.basename(f));
    // Try to show actual style content
    const m = content.match(/styles:\s*\[`([^`]*)`\]/s);
    if (m) console.log('  Style:', m[1].substring(0, 200));
  }
}

console.log('\nDone.');
