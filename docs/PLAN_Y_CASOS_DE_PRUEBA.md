# Plan y Casos de Prueba (Frontend)

## Objetivo y Alcance
Asegurar la calidad de la interfaz gráfica desarrollada en Angular 17, verificando los componentes, rutas y correcta integración con el backend.

## Estrategia de Pruebas por Niveles
- **Unitarias**: Karma y Jasmine (existentes y detección de brecha de cobertura).
- **Pruebas de Componentes**: Renderizado y comportamiento aislado de componentes UI.
- **Pruebas Manuales de Interfaz**: Pruebas funcionales en pantalla siguiendo las rutas principales reales.
- **Pruebas de Compatibilidad de Navegador**: Chrome, Firefox, Edge, Safari.
- **Pruebas de humo posteriores al despliegue**: Validación rápida tras publicación de los archivos estáticos.

## Entornos, Criterios de Entrada y Salida
- **Entornos**: Local y Producción.
- **Criterios de Entrada**: El código debe compilar correctamente.
- **Criterios de Salida**: CI en verde, validación visual, sin errores en consola JS.

## Tabla de Casos de Prueba

| ID | Historia/Requisito | Descripción | Tipo | Precondiciones | Pasos | Resultado esperado | Estado |
|---|---|---|---|---|---|---|---|
| CP-U01 | Setup inicial | Validar app.component.spec.ts | Unitaria | Ninguna | Ejecutar `ng test` | El test pasa (crea la app, tiene título) | Por ejecutar |
| CP-M01 | Autenticación | Cargar pantalla de Login (/auth/login) | Manual - UI | Ninguna | Navegar a `/auth/login` | Muestra formulario de login sin errores | Por ejecutar |
| CP-M02 | Autenticación | Login exitoso | Manual - UI | Usuario válido en BD | Ingresar datos y enviar | Redirige a dashboard correspondiente | Por ejecutar |
| CP-M03 | Admin | Cargar Dashboard Admin (/admin) | Manual - UI | Logueado como Admin | Navegar a `/admin` | Muestra panel de control | Por ejecutar |
| CP-M04 | Admin | Listado de usuarios | Manual - UI | Logueado como Admin | Navegar a sección de usuarios | Muestra tabla con datos cargados | Por ejecutar |
| CP-M05 | Cuidador | Cargar Dashboard Cuidador (/cuidador) | Manual - UI | Logueado como Cuidador | Navegar a `/cuidador` | Muestra panel del cuidador | Por ejecutar |
| CP-M06 | Cuidador | Actualizar Perfil | Manual - UI | Logueado como Cuidador | Ir a editar perfil y guardar | Muestra mensaje de éxito | Por ejecutar |
| CP-M07 | Familiar | Cargar Dashboard Familiar (/familiar) | Manual - UI | Logueado como Familiar | Navegar a `/familiar` | Muestra listado de adultos asignados | Por ejecutar |
| CP-M08 | Familiar | Ver reportes de IA | Manual - UI | Logueado como Familiar | Clic en ver reporte de IA | Muestra modal o vista con datos de IA | Por ejecutar |

## Defectos conocidos
Defecto conocido (reportado por el equipo): en main, package.json declara @angular/cdk y @angular/material en ^22.0.2 junto con Angular 17.3, versiones no compatibles entre sí; el CI del frontend puede fallar en la instalación o compilación hasta alinear las dependencias a 17.x. La corrección se hará en un PR aparte, con acuerdo del equipo.

## Registro de ejecución

| Fecha | Ejecutor | Caso | Resultado | Evidencia |
|---|---|---|---|---|
| | | | | *(Adjuntar capturas aquí)* |
