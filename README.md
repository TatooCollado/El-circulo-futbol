# El Circulo Futbol

Sistema web para reserva y gestion de canchas de futbol.

Proyecto desarrollado para el Trabajo Practico Integrador de Programacion III.

## Integrantes

- Tato
- Flor

## Descripcion

El Circulo Futbol es una aplicacion web SPA que permite a clientes reservar canchas de futbol por fecha y momento del dia. El sistema tambien permite que el dueno del complejo administre canchas, reservas, clientes y reportes operativos.

Momentos de reserva:

- Manana
- Tarde
- Noche

La reserva no discrimina por hora exacta para mantener el alcance del TPI simple y defendible.

## Stack

Frontend:

- React
- Vite
- Tailwind CSS
- React Router
- Context API para autenticacion
- Axios
- Lucide React

Backend:

- Node.js
- Express
- Sequelize
- PostgreSQL
- JWT
- bcrypt
- express-validator

Base de datos:

- PostgreSQL en Neon

Herramientas de trabajo:

- VS Code
- DBeaver
- Bruno
- GitHub

## Arquitectura

El sistema usa una arquitectura cliente-servidor separada por capas:

- Frontend SPA: interfaz, rutas, formularios y experiencia de usuario.
- Backend API REST: reglas de negocio, seguridad, validaciones y acceso a datos.
- Base de datos PostgreSQL: persistencia relacional.

No es una aplicacion MVC tradicional renderizada desde el servidor. El frontend y el backend son proyectos separados que se comunican por HTTP usando JSON.

## Estructura del proyecto

```txt
El-circulo-futbol/
  backend/
    src/
      config/
      controllers/
      middlewares/
      models/
      routes/
      scripts/
      services/
      utils/
      validations/
    .env.example
    package.json

  frontend/
    src/
      context/
      layouts/
      pages/
      routes/
      services/
      utils/
    .env.example
    package.json
    vercel.json

  bruno/
    auth/
    canchas/
    pagos/
    reportes/
    reservas/
    usuarios/

  README.md
```

## Entidades principales

- Usuario
- Cancha
- Reserva
- Pago

El TPI pide al menos 3 entidades con ABM. En este proyecto se cubre con:

- Usuarios: alta, listado, edicion y baja logica para super admin. El admin puede listar y crear clientes.
- Canchas: alta, listado, edicion y baja logica para admin y super admin.
- Reservas: alta, listado, edicion, confirmacion y cancelacion para admin y super admin. El cliente puede crear, listar y cancelar sus propias reservas.

## Roles

### Cliente

Puede:

- Ver canchas disponibles.
- Consultar disponibilidad de turnos por fecha.
- Crear reservas propias.
- Ver proximas reservas e historial.
- Cancelar reservas propias activas.
- Simular pago aprobado o rechazado.

No puede:

- Acceder al panel admin.
- Ver reservas de otros clientes.
- Gestionar canchas, usuarios o reportes.

### Admin

Representa al dueno del complejo.

Puede:

- Gestionar canchas.
- Ver reservas del complejo.
- Crear reservas manuales para clientes.
- Editar reservas activas.
- Confirmar o cancelar reservas.
- Crear clientes.
- Ver clientes activos.
- Ver reportes.

No puede:

- Cambiar roles de usuarios.
- Crear otros admins.
- Acceder al ABM completo de usuarios del super admin.

### Super Admin

Representa al equipo de desarrollo o administracion general.

Puede:

- Acceder al panel admin.
- Gestionar canchas y reservas.
- Gestionar usuarios y roles.
- Ver reportes.
- Dar de baja usuarios.

Restricciones:

- No puede cambiar su propio rol ni desactivarse desde la pantalla de usuarios.

## Estados

### Estados de reserva

```txt
pendiente_pago
confirmada
cancelada
vencida
rechazada
```

Reservas activas:

```txt
pendiente_pago
confirmada
```

Estados que liberan el turno:

```txt
cancelada
vencida
rechazada
```

Regla principal:

```txt
No puede existir mas de una reserva activa para la misma cancha + fecha + momento.
```

### Estados de pago

```txt
pendiente
aprobado
rechazado
cancelado
```

## Funcionalidades implementadas

### Autenticacion

- Registro de cliente.
- Login.
- JWT.
- Passwords hasheadas con bcrypt.
- Persistencia de sesion en frontend.
- Manejo de sesion vencida.
- Rutas protegidas por rol.

### Canchas

- Listado publico de canchas disponibles.
- Detalle de cancha.
- ABM para admin y super admin.
- Baja logica de canchas.
- Proteccion para no dar de baja una cancha con reservas activas.

### Reservas

- Cliente crea reservas por cancha, fecha y momento.
- Cliente ve "Mis reservas" separadas en proximas reservas e historial.
- Cliente puede cancelar reservas activas.
- Cliente ve disponibilidad antes de reservar.
- Admin y super admin ven agenda con calendario.
- Admin y super admin filtran reservas por cliente, cancha, fecha y estado.
- Admin y super admin crean reservas manuales.
- Admin y super admin editan reservas activas.
- Admin y super admin confirman o cancelan reservas.
- Las reservas canceladas se ocultan por defecto en el panel admin y pueden mostrarse por dia o total.

### Usuarios

- Super admin tiene ABM completo de usuarios.
- Super admin puede cambiar roles.
- Admin puede listar clientes activos.
- Admin puede crear clientes sin modificar privilegios.

### Pagos demo

El sistema tiene una simulacion de pago para defender el flujo sin depender de una pasarela real:

- Crear preferencia demo.
- Simular pago aprobado.
- Simular pago rechazado.
- Cambiar automaticamente el estado de la reserva segun el resultado.

Comportamiento:

- Pago aprobado: la reserva pasa a `confirmada`.
- Pago rechazado: la reserva pasa a `rechazada`.
- Reserva vencida o cancelada: el pago pendiente pasa a `cancelado`.

### Reportes

Disponibles para admin y super admin.

Incluyen:

- Filtro por rango de fechas.
- Reservas del periodo.
- Reservas activas.
- Ocupacion estimada.
- Turnos posibles.
- Ingresos aprobados.
- Usuarios activos.
- Canchas disponibles.
- Reservas por estado.
- Pagos por estado.
- Reservas por momento.
- Ocupacion por cancha.
- Proximas reservas activas.

## Instalacion local

Requisitos:

- Node.js
- npm
- PostgreSQL online en Neon o una instancia local compatible

Clonar el repositorio:

```bash
git clone https://github.com/TatooCollado/El-circulo-futbol.git
cd El-circulo-futbol
```

### Backend

Crear `backend/.env` a partir de `backend/.env.example`.

```env
PORT=3001
NODE_ENV=development
DB_LOGGING=false

DATABASE_URL=postgresql://USER:PASSWORD@HOST/DB_NAME?sslmode=verify-full

JWT_SECRET=change_this_secret
JWT_EXPIRES_IN=7d

FRONTEND_URL=http://localhost:5173
```

Instalar dependencias e inicializar base:

```bash
cd backend
npm install
npm run db:init
npm run dev
```

Scripts del backend:

```bash
npm run dev      # Inicia Express con nodemon
npm start        # Inicia Express sin nodemon
npm run db:sync  # Sincroniza modelos Sequelize
npm run db:seed  # Carga usuarios y canchas demo
npm run db:init  # Ejecuta sync + seed
```

URL local:

```txt
http://localhost:3001/api
```

Health check:

```txt
GET http://localhost:3001/api/health
```

### Frontend

Crear `frontend/.env` a partir de `frontend/.env.example`.

```env
VITE_API_URL=http://localhost:3001/api
```

Instalar dependencias e iniciar:

```bash
cd frontend
npm install
npm run dev
```

Scripts del frontend:

```bash
npm run dev      # Inicia Vite
npm run build    # Genera build de produccion
npm run preview  # Previsualiza build
```

URL local:

```txt
http://localhost:5173
```

## Usuarios demo

Todos se crean con `npm run db:seed` o `npm run db:init`.

```txt
superadmin@demo.com / Demo1234
admin@demo.com / Demo1234
cliente@demo.com / Demo1234
```

## Bruno

La carpeta `bruno/` contiene la coleccion de requests para probar la API.

Pasos:

1. Abrir Bruno.
2. Elegir `Open Collection`.
3. Seleccionar la carpeta `bruno/`.
4. Seleccionar el environment `Local`.
5. Ejecutar un login en `auth/`.
6. Bruno guarda el token para usarlo en requests protegidas.

Orden sugerido de prueba:

```txt
auth
canchas
reservas
pagos
usuarios
reportes
```

## DBeaver y Neon

La base esta online en Neon. DBeaver se usa como cliente visual para inspeccionar tablas.

Datos generales de conexion:

```txt
Driver: PostgreSQL
Host: host de Neon
Port: 5432
Database: neondb
User: neondb_owner
SSL: require
```

Importante:

- No subir credenciales reales al repositorio.
- No pegar la URL real de Neon en archivos versionados.
- Usar `.env` local para secretos.
- El archivo `.env` esta ignorado por Git.

## Endpoints principales

### Auth

```txt
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
```

### Canchas

```txt
GET    /api/canchas
GET    /api/canchas/:id
GET    /api/canchas/:id/disponibilidad?fecha=YYYY-MM-DD
POST   /api/canchas
PUT    /api/canchas/:id
DELETE /api/canchas/:id
```

### Reservas

```txt
GET  /api/reservas
GET  /api/reservas/mis-reservas
GET  /api/reservas/clientes
POST /api/reservas
POST /api/reservas/admin
PUT  /api/reservas/:id
PUT  /api/reservas/:id/confirmar
PUT  /api/reservas/:id/cancelar
```

### Usuarios

```txt
GET    /api/users
GET    /api/users/clientes
POST   /api/users
POST   /api/users/clientes
GET    /api/users/:id
PUT    /api/users/:id
DELETE /api/users/:id
```

### Pagos

```txt
POST /api/pagos/crear-preferencia
GET  /api/pagos/:id
POST /api/pagos/:id/simular
POST /api/pagos/webhook
```

### Reportes

```txt
GET /api/reportes/general
GET /api/reportes/general?fechaDesde=YYYY-MM-DD&fechaHasta=YYYY-MM-DD
```

## Rutas principales del frontend

```txt
/                         Home
/login                    Login
/register                 Registro
/canchas                  Listado de canchas
/reservar/:canchaId       Reserva cliente
/mis-reservas             Reservas del cliente
/admin                    Panel admin
/admin/usuarios           Clientes para admin
/admin/reportes           Reportes para admin y super admin
/super-admin/usuarios     ABM usuarios super admin
/super-admin/reportes     Compatibilidad con ruta anterior de reportes
/403                      Acceso denegado
```

## Deploy sugerido

Hay una guia paso a paso en:

```txt
docs/deploy.md
```

Base de datos:

- Neon PostgreSQL.

Backend:

- Render.
- Root directory: `backend`.
- Build command: `npm install`.
- Start command: `npm start`.
- Health check path: `/api/health`.
- El archivo `render.yaml` deja preparada una configuracion base para crear el servicio desde el repositorio.
- Variables necesarias:

```txt
DATABASE_URL
JWT_SECRET
JWT_EXPIRES_IN
FRONTEND_URL
NODE_ENV=production
```

Frontend:

- Vercel.
- Root directory: `frontend`.
- Build command: `npm run build`.
- Output directory: `dist`.
- Variables necesarias:

```txt
VITE_API_URL=https://URL-DEL-BACKEND/api
```

Despues de deployar el frontend, actualizar `FRONTEND_URL` en el backend para que CORS permita el dominio de Vercel.

## Checklist de consigna

- React SPA.
- Enrutado con react-router-dom.
- Backend Node.js + Express.
- Base PostgreSQL.
- Sequelize ORM.
- ABM de usuarios.
- ABM de canchas.
- Gestion/ABM de reservas.
- Autenticacion con JWT.
- Passwords hasheadas.
- Roles: cliente, admin, super_admin.
- Rutas protegidas por rol.
- Context API usado en AuthContext.
- Validaciones en frontend y backend.
- Mensajes de error al usuario.
- Diseno con Tailwind.
- Pagos demo con estados.
- Reportes para admin y super admin.
- Coleccion Bruno para probar endpoints.

## Flujo recomendado para defensa

1. Ingresar como cliente.
2. Ver listado de canchas.
3. Entrar a reservar una cancha.
4. Elegir fecha y ver disponibilidad por momento.
5. Crear una reserva pendiente de pago.
6. Ir a "Mis reservas".
7. Simular pago aprobado.
8. Mostrar que la reserva queda confirmada.
9. Ingresar como admin.
10. Ver calendario de reservas.
11. Editar una reserva y mostrar validacion de disponibilidad.
12. Crear una reserva manual para un cliente.
13. Ver clientes desde `/admin/usuarios`.
14. Ver reportes filtrados por periodo.
15. Ingresar como super admin.
16. Gestionar usuarios y roles.

## Notas de seguridad

- No se versionan archivos `.env`.
- Las contrasenas se guardan hasheadas con bcrypt.
- Las rutas sensibles requieren JWT.
- Las rutas administrativas validan rol.
- En produccion, el backend exige `JWT_SECRET` configurado como variable de entorno.
- El cliente no puede consultar reservas ajenas.
- El admin no puede cambiar privilegios de usuarios.
- El super admin no puede desactivarse ni cambiarse su propio rol desde el panel.
