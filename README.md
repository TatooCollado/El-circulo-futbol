# El Circulo Futbol

Sistema web para reserva y gestion de canchas de futbol.

## Integrantes

- Tato
- Flor

## Arquitectura

El sistema utiliza una arquitectura cliente-servidor:

- Frontend SPA desarrollado con React, Vite, Tailwind y react-router-dom.
- Backend API REST desarrollado con Node.js y Express.
- Base de datos PostgreSQL en Neon.
- Acceso a datos mediante Sequelize.
- Autenticacion con JWT y bcrypt.
- Pagos mediante Mercado Pago en ambiente de prueba.

## Estructura

```txt
el-circulo-futbol/
  backend/
  frontend/
  bruno/
  README.md
```

## Entidades principales

- Usuario
- Cancha
- Reserva
- Pago

## Roles

- cliente
- admin
- super_admin

## Flujo de reserva

1. El cliente selecciona cancha, fecha y momento.
2. El backend valida disponibilidad.
3. Se crea una reserva en estado pendiente_pago.
4. Se crea un pago pendiente.
5. El cliente realiza el pago de prueba.
6. Si el pago se aprueba, la reserva pasa a confirmada.
7. Si el pago se rechaza, la reserva pasa a rechazada.
8. Si vence la tolerancia, la reserva pasa a vencida.

## Scripts previstos

Backend:

```bash
cd backend
npm install
npm run dev
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

