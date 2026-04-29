# El Circulo Futbol

Sistema web para reserva y gestion de canchas de futbol.

## Integrantes

- Tato
- Flor

## Descripcion

El Circulo Futbol es una aplicacion web SPA para administrar un complejo de canchas y permitir que clientes realicen reservas por fecha y momento del dia.

Momentos disponibles:

- manana
- tarde
- noche

## Arquitectura

El sistema utiliza arquitectura cliente-servidor:

- Frontend SPA desarrollado con React, Vite, Tailwind y react-router-dom.
- Backend API REST desarrollado con Node.js y Express.
- Base de datos PostgreSQL online en Neon.
- Acceso a datos mediante Sequelize.
- Autenticacion propia con JWT y bcrypt.
- Pagos demo para simular aprobacion o rechazo.

## Estructura

```txt
el-circulo-futbol/
  backend/
  frontend/
  bruno/
  README.md
```

## Entidades

- Usuario
- Cancha
- Reserva
- Pago

## Roles

```txt
cliente
- Ver canchas disponibles.
- Crear reservas propias.
- Ver historial propio.
- Cancelar reservas propias.
- Simular pago aprobado o rechazado.

admin
- Gestionar canchas.
- Ver reservas del complejo.
- Confirmar o cancelar reservas.
- Crear reservas manuales para clientes.

super_admin
- Gestionar usuarios y roles.
- Ver reportes generales.
```

## Variables de entorno

Crear `backend/.env` a partir de `backend/.env.example`:

```env
PORT=3001
NODE_ENV=development
DB_LOGGING=false

DATABASE_URL=postgresql://USER:PASSWORD@HOST/DB_NAME?sslmode=verify-full

JWT_SECRET=change_this_secret
JWT_EXPIRES_IN=7d

FRONTEND_URL=http://localhost:5173

MERCADOPAGO_ACCESS_TOKEN=
MERCADOPAGO_PUBLIC_KEY=
```

Crear `frontend/.env` a partir de `frontend/.env.example`:

```env
VITE_API_URL=http://localhost:3001/api
VITE_MERCADOPAGO_PUBLIC_KEY=
```

## Instalacion

Backend:

```bash
cd backend
npm install
npm run db:init
npm run dev
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

URLs locales:

```txt
Backend: http://localhost:3001/api
Frontend: http://localhost:5173
```

## Usuarios demo

```txt
superadmin@demo.com / Demo1234
admin@demo.com / Demo1234
cliente@demo.com / Demo1234
```

## Flujo de reserva

1. El cliente selecciona una cancha disponible.
2. Elige fecha y momento.
3. El backend valida disponibilidad.
4. Se crea una reserva en estado `pendiente_pago`.
5. Se crea un pago en estado `pendiente`.
6. El cliente simula pago aprobado o rechazado.
7. Si el pago se aprueba, la reserva pasa a `confirmada`.
8. Si el pago se rechaza, la reserva pasa a `rechazada`.
9. Si vence la tolerancia, la reserva pasa a `vencida`.

Regla principal:

```txt
No puede existir mas de una reserva activa para la misma cancha + fecha + momento.
```

Estados de reserva activos:

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

## Pagos demo

El sistema incluye endpoints de pago simulado para defender el flujo sin depender de Mercado Pago en vivo:

- Crear preferencia simulada.
- Simular pago aprobado.
- Simular pago rechazado.

Cuando el pago se aprueba, la reserva pasa a `confirmada`.
Cuando el pago se rechaza, la reserva pasa a `rechazada`.

## Reportes

El rol `super_admin` puede acceder a reportes generales con:

- Usuarios activos.
- Canchas disponibles.
- Reservas por estado.
- Pagos por estado.
- Ingresos aprobados.
- Canchas mas reservadas.
- Proximas reservas activas.

## Bruno

La carpeta `bruno/` contiene la coleccion de requests para probar la API.

Pasos recomendados:

1. Abrir Bruno.
2. Seleccionar `Open Collection`.
3. Elegir la carpeta `bruno/`.
4. Seleccionar el environment `Local`.
5. Ejecutar primero un login de `auth/` para guardar el token.
6. Ejecutar requests protegidas de canchas, reservas, usuarios, pagos o reportes.

## DBeaver

La base esta online en Neon. DBeaver se conecta como cliente visual.

Datos de conexion:

```txt
Driver: PostgreSQL
Host: host de Neon
Port: 5432
Database: neondb
User: neondb_owner
SSL: require
```

## Checklist de defensa

- React SPA con rutas mediante react-router-dom.
- Backend Node + Express.
- Base PostgreSQL con tablas relacionales.
- Sequelize como ORM.
- ABM de usuarios.
- ABM de canchas.
- ABM/gestion de reservas.
- Autenticacion con JWT.
- Passwords hasheadas con bcrypt.
- Roles: cliente, admin, super_admin.
- Rutas protegidas por rol.
- Context usado en AuthContext.
- Validaciones en formularios y backend.
- Pagos demo con estados.
- Reportes para super_admin.
- Coleccion Bruno para probar endpoints.

## Flujo sugerido para mostrar

1. Login como cliente.
2. Ver canchas.
3. Crear una reserva.
4. Ver la reserva en Mis reservas.
5. Simular pago aprobado.
6. Login como admin.
7. Ver reserva confirmada en el panel admin.
8. Crear o editar una cancha.
9. Login como super_admin.
10. Gestionar usuarios.
11. Ver reportes.

