# Plan y Casos de Prueba (Frontend)

## Objetivo y alcance
Asegurar la calidad de la interfaz desarrollada en Angular 17: componentes, rutas, protección de acceso e integración con el backend. Los casos CP-18, CP-19 y CP-20 son los mismos del documento general del proyecto.

## Estrategia de pruebas por niveles
- **Unitarias (automatizadas)**: Karma y Jasmine, ejecutadas en cada Pull Request por el workflow de CI. Usan servicios simulados y no hacen peticiones reales al backend.
- **Manuales de interfaz**: pruebas funcionales en pantalla siguiendo las rutas principales de cada rol.
- **De humo posteriores al despliegue**: verificar que la aplicación cargue y que el inicio de sesión funcione.
- **Navegador de referencia**: Chrome. Otros navegadores no se prueban de forma sistemática en esta etapa.

## Entornos, criterios de entrada y de salida
- **Entornos**: local y producción (la plataforma de producción está temporalmente inactiva).
- **Entrada**: el código compila y las dependencias se instalan con `npm ci`.
- **Salida**: CI en verde, validación visual de las rutas principales y sin errores en la consola del navegador.

## Tabla de casos de prueba

| ID | Historia/Requisito | Descripción | Tipo | Precondiciones | Pasos | Resultado esperado | Estado |
|---|---|---|---|---|---|---|---|
| CP-U01 | Base de la aplicación | AppComponent se crea correctamente | Unitaria | Ninguna | Ejecutar `npm test` | La prueba pasa | Aprobado (01/10/2026) |
| CP-U02 | Layout | El layout autenticado se oculta cuando no hay sesión | Unitaria | Sin sesión | Ejecutar `npm test` | showLayout es falso | Aprobado (01/10/2026) |
| CP-U03 | Layout | El layout se muestra con sesión activa en una ruta protegida | Unitaria | Sesión simulada | Ejecutar `npm test` | showLayout es verdadero | Aprobado (01/10/2026) |
| CP-U04 | Layout | El layout se oculta en rutas públicas aunque haya sesión | Unitaria | Sesión simulada | Ejecutar `npm test` | showLayout es falso | Aprobado (01/10/2026) |
| CP-U05 | Navegación | El menú lateral alterna entre abierto y colapsado | Unitaria | Ninguna | Ejecutar `npm test` | El estado cambia en cada llamada | Aprobado (01/10/2026) |
| CP-19 | Protección de rutas | authGuard redirige a /auth/login sin sesión y permite el acceso con sesión | Unitaria (2 pruebas) | Sesión simulada | Ejecutar `npm test` | Sin sesión: redirige. Con sesión: permite | Aprobado (01/10/2026) |
| CP-18 | Autenticación | Inicio de sesión exitoso | Manual / integración con backend | Usuario válido y backend en ejecución | Ingresar credenciales y enviar | Redirige al dashboard del rol | Por ejecutar |
| CP-20 | Familiar | El dashboard muestra las tomas del día | Manual / integración con backend | Familiar con adulto asignado | Navegar a `/familiar` | Se muestran las tomas con su estado | Por ejecutar |
| CP-M01 | Autenticación | Cargar la pantalla de login | Manual - UI | Ninguna | Navegar a `/auth/login` | Muestra el formulario sin errores | Por ejecutar |
| CP-M03 | Admin | Cargar el dashboard de Administrador | Manual - UI | Sesión como Administrador | Navegar a `/admin` | Muestra el panel de control | Por ejecutar |
| CP-M04 | Admin | Listado de usuarios | Manual - UI | Sesión como Administrador | Abrir la sección de usuarios | Muestra la tabla con datos | Por ejecutar |
| CP-M05 | Cuidador | Cargar el dashboard del Cuidador | Manual - UI | Sesión como Cuidador | Navegar a `/cuidador` | Muestra el panel del cuidador | Por ejecutar |
| CP-M06 | Cuidador | Actualizar perfil | Manual - UI | Sesión como Cuidador | Editar el perfil y guardar | Muestra mensaje de éxito | Por ejecutar |
| CP-M08 | Familiar | Ver reportes de IA | Manual - UI | Sesión como Familiar | Abrir un reporte de IA | Muestra los datos del reporte | Por ejecutar |

## Incidencia resuelta: conflicto de dependencias
En `main`, `package.json` declara `@angular/cdk` y `@angular/material` en `^22.0.2` junto con Angular 17.3. Esas versiones de Material declaran Angular 22 o 23 como dependencia par, por lo que `npm ci` fallaba con `ERESOLVE` en un clon limpio. La aplicación compila y funciona con esta combinación.

**Solución aplicada:** el archivo `.npmrc` con `legacy-peer-deps=true` hace que `npm ci` ignore ese conflicto, sin cambiar ninguna versión. Se verificó que la instalación, el build de producción y las pruebas pasan.

**Mejora pendiente:** alinear Angular y Material en la misma versión mayor. Se hará en un cambio aparte, con revisión visual, porque puede modificar la interfaz.

## Registro de ejecución

| Fecha | Ejecutor | Casos | Resultado | Evidencia |
|---|---|---|---|---|
| 01/10/2026 | Otero | CP-U01 a CP-U05 y CP-19 | Aprobado | Salida de `npm test`: Executed 7 of 7 SUCCESS (Chrome Headless, Windows) |
