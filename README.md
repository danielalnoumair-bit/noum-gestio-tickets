# Tickets IT - Instituto

Gestión de incidencias de mantenimiento IT: alta desde móvil (sin login, vía QR de cada aula) y gestión desde PC (con login) con exportación a Excel.

## Instalación

```
npm install
```

## Crear el usuario de IT (login del backend)

```
npm run create-admin -- tecnico "tu-contraseña"
```

Puedes volver a ejecutarlo con el mismo usuario para cambiar la contraseña.

## Arrancar el servidor

```
npm start
```

- Alta de tickets (móvil, sin login): http://localhost:3000/nuevo/
- Backend de gestión (con login): http://localhost:3000/admin/

## Uso

1. Entra en `/admin/aulas.html`, da de alta cada aula/ubicación del instituto y descarga/imprime su código QR.
2. Pega cada QR en la puerta del aula correspondiente. Al escanearlo se abre directamente el formulario de alta con esa aula ya rellenada.
3. El personal de IT gestiona los tickets desde `/admin/` (bandeja con filtros, cambio de estado, notas internas) y puede exportar a Excel con los filtros aplicados.

## Datos

La base de datos (SQLite) y las fotos subidas se guardan en la carpeta `data/`, que no se sube al repositorio (ver `.gitignore`).

## Variables de entorno opcionales

- `PORT`: puerto del servidor (por defecto 3000).
- `SESSION_SECRET`: secreto de las sesiones del backend. Cámbialo si se despliega en un servidor real.
- `PUBLIC_URL`: URL base que se usa al generar los códigos QR de las aulas (ej. `http://172.20.10.2:3000` o el dominio real cuando esté desplegado). Si no se define, se usa la URL con la que se acceda al panel de administración en ese momento — por eso conviene fijar `PUBLIC_URL` para que los QR no dependan de si entraste como `localhost` o por IP.
- `ADMIN_USERNAME` / `ADMIN_PASSWORD`: si se definen, el servidor crea (o actualiza la contraseña de) ese usuario de IT automáticamente cada vez que arranca. Pensado para hostings donde no hay acceso a una terminal para ejecutar `npm run create-admin`.

## Despliegue en Railway (piloto, gratuito)

Railway aloja el contenedor con disco propio, pero en el plan gratuito ese disco es efímero: cada nuevo despliegue borra la base de datos SQLite y las fotos subidas. Vale para un piloto/demo, pero los tickets no persisten entre despliegues. Pasos:

1. Sube este proyecto a un repositorio de GitHub (si no tienes cuenta, créala gratis en https://github.com/signup).
2. Entra en https://railway.app, regístrate con tu cuenta de GitHub y crea un proyecto nuevo → "Deploy from GitHub repo" → selecciona este repositorio.
3. En la pestaña "Variables" del servicio, añade:
   - `ADMIN_USERNAME` y `ADMIN_PASSWORD` (tus credenciales de IT).
   - `SESSION_SECRET` (cualquier cadena aleatoria larga).
   - `PUBLIC_URL` (la URL pública que te asigna Railway, ej. `https://tu-proyecto.up.railway.app`; se ve en la pestaña "Settings" → "Networking" tras el primer despliegue).
4. Railway detecta que es una app Node.js y ejecuta `npm start` automáticamente.
5. Accede a `https://tu-proyecto.up.railway.app/nuevo/` desde cualquier móvil, y a `/admin/` con el usuario/contraseña definidos en el paso 3.
