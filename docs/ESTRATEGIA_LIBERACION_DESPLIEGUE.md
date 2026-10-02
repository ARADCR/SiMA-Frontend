# Estrategia de Liberación y Despliegue (Frontend)

## Ambientes
- **Local**: desarrollo y pruebas de cada integrante.
- **Staging** *(planificado)*: validación final antes de liberar. Aún no existe.
- **Producción**: entorno para usuarios finales. La plataforma está temporalmente inactiva y se reactivará.

## Proceso de liberación paso a paso
1. Acordar la próxima versión (SemVer).
2. Actualizar `CHANGELOG.md`.
3. Crear el tag anotado `vX.Y.Z` y subirlo al remoto.
4. El workflow `release.yml` captura el tag, ejecuta las pruebas, compila para producción, genera el paquete estático (`.zip`) y crea el Release en GitHub.

## Estrategia de despliegue
**Entrega continua**: el artefacto (un `.zip` con la carpeta `dist/` compilada de Angular) se genera de forma automatizada y queda disponible en el Release. El paso a producción es una decisión del equipo: se publica el contenido del `.zip` en la plataforma de producción vigente, siguiendo la estrategia definida en el documento general del proyecto.

## Plan de rollback
Si el nuevo despliegue falla, se vuelve a publicar el `.zip` de la versión anterior desde los Releases guardados en GitHub. Si el defecto está en el código, se revierte el Pull Request en `main` y se libera una versión PATCH.

## Configuración por ambiente
La configuración de cada entorno se maneja con los archivos de environments de Angular (`environment.ts` y `environment.prod.ts`). No se versionan contraseñas, tokens ni claves en esos archivos.

## Compatibilidad Frontend y Backend
El frontend y el backend se liberan de forma coordinada: primero el backend y después el frontend.

| Versión Frontend | Versión Backend compatible | Observaciones |
|---|---|---|
| v1.0.0 | v1.0.0 (prevista) | Línea base |

## Checklist previo a liberar
- [ ] Pruebas en verde.
- [ ] `CHANGELOG.md` actualizado.
- [ ] Variables de entorno correctas.
- [ ] Versión del backend compatible disponible.

## Pruebas de humo posteriores
- Verificar que la aplicación cargue sin pantalla en blanco.
- Validar el inicio de sesión.

## Hosting
La plataforma de producción está temporalmente inactiva y se reactivará. El hosting definitivo se documentará aquí cuando se confirme.
