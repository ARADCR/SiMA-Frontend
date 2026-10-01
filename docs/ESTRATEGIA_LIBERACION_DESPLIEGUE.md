# Estrategia de Liberación y Despliegue

## Ambientes
- **Local**: Entorno de desarrollo para pruebas iniciales de los programadores.
- *(Opcional)* **Staging**: Para validación final antes de liberar.
- **Producción**: Entorno real para usuarios finales.

## Proceso de Liberación Paso a Paso
1. Acordar la próxima versión (SemVer).
2. Actualizar archivo CHANGELOG.
3. Crear el tag `vX.Y.Z` y subirlo al remoto.
4. El workflow `release.yml` captura el tag, genera el paquete de compilación estático y crea el release automáticamente en GitHub.

## Estrategia de Despliegue de Archivos Estáticos
**Entrega Continua**: El artefacto (un `.zip` con la carpeta `dist/` compilada de Angular) se genera de forma automatizada y se deja listo. El despliegue a producción es manual, requiere aprobación del equipo y consiste en el reemplazo de la carpeta compilada en el servidor (servidor web como Nginx, Apache o similar).

## Plan de Rollback
En caso de fallo crítico en el nuevo despliegue, el rollback consiste en volver a publicar los archivos del paquete (`.zip`) de la versión anterior inmediatamente (usando los Releases guardados en GitHub).

## Configuración por Ambiente
La configuración específica de cada entorno se maneja mediante los archivos de environments de Angular:
- `environment.ts`
- `environment.prod.ts`

**Recomendación:** No versionar claves, contraseñas ni URLs privadas sensibles en estos archivos directamente; inyectarlas durante el proceso de compilación si es posible.

## Compatibilidad Frontend ↔ Backend
El frontend y el backend deben liberarse de forma coordinada.

| Versión Frontend | Versión Backend Compatible | Observaciones |
|---|---|---|
| | | |

## Checklist previo a liberar
- [ ] Pruebas en verde.
- [ ] CHANGELOG actualizado.
- [ ] Variables de entorno correctas.

## Pruebas de humo posteriores
- Verificar que la aplicación cargue sin errores blancos ("White Screen of Death").
- Validar login.

## Hosting
> [CONFIRMAR POR EL EQUIPO]
