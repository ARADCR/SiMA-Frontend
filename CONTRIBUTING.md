# Guía de Contribución

¡Gracias por contribuir a SiMA Frontend! Por favor sigue estas directrices.

## Flujo de Trabajo (GitHub Flow)
- La rama `main` es estable y se encuentra protegida.
- Todo trabajo nuevo nace en ramas cortas creadas a partir de `main`.
- Los cambios llegan a `main` únicamente mediante Pull Requests (PR).

## Nomenclatura de Ramas
- `feature/HU-XX-descripcion` (Para nuevas características)
- `fix/descripcion` (Para corrección de errores)
- `hotfix/descripcion` (Para correcciones urgentes en producción)
- `docs/*` (Documentación)
- `test/*` (Pruebas)
- `ci/*` (Configuración de integración continua)

## Mensajes de Commit (Conventional Commits)
Utilizamos Conventional Commits con los siguientes tipos: `feat`, `fix`, `docs`, `refactor`, `test`, `ci`, `chore`.
Ejemplo: `feat(HU-07): alerta por omisión`

## Proceso de Pull Request
1. Utilizar la plantilla de Pull Request al crearlo.
2. El CI debe estar en verde (aprobado).
3. Requiere mínimo 1 aprobación de otro integrante del equipo.
4. El merge se realizará utilizando "Squash and merge" (merge con squash).
5. Borrar la rama una vez integrada.

## Definición de "Terminado"
Un issue o HU se considera "Terminado" cuando cumple con los criterios de aceptación, el código está en `main`, tiene cobertura de pruebas adecuada, pasó las revisiones de código, CI en verde y no introduce deudas técnicas ni problemas de seguridad.

## Cómo correr en local
- Prerrequisito: Node.js 20.
- `npm ci` (Instalación de dependencias).
- `npm test -- --watch=false --browsers=ChromeHeadless` (Ejecutar pruebas unitarias).
- `npm run build -- --configuration production` (Compilar para producción).

## Política de Seguridad
- No subir contraseñas, tokens ni secretos al repositorio.
- Las URLs y claves de producción se configuran por ambiente.

## Versionado
Utilizamos versionado Semántico (SemVer) con tags `vX.Y.Z` y registramos todos los cambios notables en el archivo `CHANGELOG.md`.
