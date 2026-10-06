# SimaFrontend

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 17.3.11.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help
## Estado del CI

![CI Frontend](https://github.com/ARADCR/SiMA-Frontend/actions/workflows/ci.yml/badge.svg)

## Ejecución en local

Requisitos: Node.js 20.

```
npm ci
npm start
npm test -- --watch=false --browsers=ChromeHeadless
npm run build -- --configuration production
```

El archivo `.npmrc` (`legacy-peer-deps=true`) permite instalar con `npm ci`: Angular Material 22
declara Angular 22 o 23 como dependencia par, y el proyecto usa Angular 17.

## Documentación DevOps

- [Plan y casos de prueba](docs/PLAN_Y_CASOS_DE_PRUEBA.md)
- [Flujo de versiones](docs/FLUJO_DE_VERSIONES.md)
- [Estrategia de liberación y despliegue](docs/ESTRATEGIA_LIBERACION_DESPLIEGUE.md)
- [Pipeline CI/CD](docs/CICD.md)
- [Guía de contribución](CONTRIBUTING.md)
- [Registro de cambios](CHANGELOG.md)

## Backend

El backend del sistema vive en otro repositorio: https://github.com/ARADCR/SiMA-Backend

## Despliegue

La plataforma de producción está temporalmente inactiva y se reactivará.
