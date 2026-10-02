# Changelog

Todos los cambios notables de este proyecto se documentan en este archivo.

El formato sigue [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/) y el proyecto usa [Versionado Semántico](https://semver.org/lang/es/).

## [Unreleased]

## [1.0.0] - 2026-10-02

### Added
- Primera versión etiquetada del frontend de SIMA (Angular 17 y Angular Material), con módulos de autenticación, administración, cuidador y familiar.
- Workflow de integración continua con GitHub Actions (`ci.yml`).
- Workflow de liberación (`release.yml`) que publica el Release con el paquete estático.
- Plantillas de Pull Request e Issues, guía de contribución (`CONTRIBUTING.md`) y documentación DevOps en `docs/`.
- Pruebas unitarias de `AppComponent` y de `authGuard`.
- Archivo `.npmrc` con `legacy-peer-deps=true` para resolver el conflicto de dependencias entre Angular 17 y Angular Material 22.

### Changed
- Reemplazada la prueba por defecto de `AppComponent`, que no compilaba.
