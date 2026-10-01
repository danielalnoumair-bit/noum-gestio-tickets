# Tickets IT - INS Barri Besòs

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

## Despliegue en producción (IONOS)

La app corre en el servidor IONOS que también sirve `noum.es`, como servicio systemd:

- Código en `/opt/tickets` (checkout de este repositorio).
- Servicio `tickets.service` (`systemctl status|restart tickets.service`), que ejecuta `npm start`.
- nginx hace de proxy inverso de `tickets.noum.es` hacia `http://127.0.0.1:3000` (config en `/etc/nginx/sites-available/tickets`, certificado por Certbot).
- Datos (SQLite y fotos) en `/opt/tickets/data`, persistentes en el disco del servidor.

Para publicar un cambio:

```
ssh root@<ip-del-servidor>
cd /opt/tickets
git pull origin main
systemctl restart tickets.service
```

El reinicio vuelve a ejecutar `seedAdmin.js`, que crea o actualiza los usuarios `admin`/`consulta` (o los definidos por `ADMIN_USERNAME`/`VIEWER_USERNAME`) sin tocar los tickets ya guardados.

> Nota: existió un piloto previo en Render (`render.yaml` queda de referencia), pero ya no está en uso — la producción real es la de IONOS descrita arriba.
