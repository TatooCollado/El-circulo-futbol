# Deploy

Guia corta para publicar el proyecto manteniendo Neon como base PostgreSQL.

## 1. Base de datos

- Usar la base de Neon existente.
- Copiar la connection string desde Neon solo para variables de entorno.
- No pegar la URL real en archivos versionados.

Antes del primer deploy, desde local o desde una consola del backend:

```bash
cd backend
npm run db:init
```

`db:init` sincroniza tablas y carga usuarios/canchas demo de forma idempotente.

## 2. Backend en Render

Opcion A: crear servicio manual.

- Root directory: `backend`
- Build command: `npm install`
- Start command: `npm start`
- Health check path: `/api/health`

Opcion B: usar el blueprint `render.yaml` desde el root del repo.

Variables necesarias:

```txt
NODE_ENV=production
DB_LOGGING=false
DATABASE_URL=postgresql://...
JWT_SECRET=valor_largo_y_privado
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://tu-front.vercel.app
```

En `NODE_ENV=production`, el backend no inicia si falta `JWT_SECRET`. Esto evita que el deploy quede online con el secreto de desarrollo.

Luego probar:

```txt
https://tu-backend.onrender.com/api/health
```

## 3. Frontend en Vercel

- Root directory: `frontend`
- Build command: `npm run build`
- Output directory: `dist`

Variables necesarias:

```txt
VITE_API_URL=https://tu-backend.onrender.com/api
```

El archivo `frontend/vercel.json` ya tiene la rewrite necesaria para que React Router funcione al refrescar rutas internas.

El flujo de pagos actual es demo/simulado, asi que no necesita credenciales reales de Mercado Pago para deployar.

## 4. Ajuste final de CORS

Cuando Vercel entregue la URL final del frontend, copiarla en Render:

```txt
FRONTEND_URL=https://tu-front.vercel.app
```

Despues reiniciar el servicio backend y probar login desde el frontend publicado.

## 5. Checklist rapido

- `/api/health` responde en Render.
- Frontend abre en Vercel.
- Login cliente/admin/super admin funciona.
- `/canchas` carga datos reales desde Neon.
- Admin puede entrar a `/admin`.
- Reportes cargan en `/admin/reportes`.
- Refrescar una ruta interna en Vercel no da 404.
