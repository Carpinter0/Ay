# 💕 Ay Amor

> Plataforma de suscripción mensual de sorpresas para enamorados.

---

## Stack

| Capa | Tecnología |
|---|---|
| Backend | Node.js 18+ · Express · TypeScript |
| ORM | Prisma 5 |
| Base de datos | PostgreSQL 16 |
| Autenticación | JWT + bcryptjs |
| Pagos | Stripe |
| Frontend | React · Vite · TypeScript · Tailwind CSS |

---

## Estructura del proyecto

```
Ay/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma     # Modelos de datos
│   │   └── seed.ts           # Datos iniciales (planes + sorpresas)
│   └── src/
│       └── modules/
│           ├── auth/          # Registro, login, JWT
│           ├── planes/        # Listado de planes
│           ├── sorpresas/     # Contenido por plan
│           ├── suscripciones/ # Ciclo de vida Stripe
│           └── webhook/       # Eventos Stripe
├── frontend/
│   └── src/
│       └── pages/
│           ├── Landing.tsx
│           ├── Login.tsx
│           ├── Registro.tsx
│           ├── Planes.tsx
│           ├── Dashboard.tsx
│           └── MiSuscripcion.tsx
└── docker-compose.yml         # PostgreSQL local
```

---

## Inicio rápido

### 1. Prerrequisitos

- [Node.js ≥ 18](https://nodejs.org)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (para levantar PostgreSQL)
- Cuenta en [Stripe](https://dashboard.stripe.com/register) (modo test)
- [Stripe CLI](https://stripe.com/docs/stripe-cli) (para webhooks en local)

### 2. Clonar el repositorio

```bash
git clone https://github.com/Carpinter0/Ay.git
cd Ay
```

### 3. Levantar PostgreSQL con Docker

```bash
docker compose up -d
```

Esto crea la base de datos `ay_amor` con usuario `ayamor` y contraseña `ayamor_secret` en el puerto `5432`.
Puedes inspeccionar la BD visualmente en [http://localhost:8080](http://localhost:8080) con Adminer.

### 4. Configurar variables de entorno del backend

```bash
cd backend
cp .env.example .env
```

Edita `.env` con tus valores:

```env
DATABASE_URL="postgresql://ayamor:ayamor_secret@localhost:5432/ay_amor"
JWT_SECRET="cambia-esto-por-una-clave-larga-y-segura"
JWT_EXPIRES_IN="7d"
STRIPE_SECRET_KEY="sk_test_TU_CLAVE_AQUI"
STRIPE_WEBHOOK_SECRET="whsec_TU_WEBHOOK_SECRET"
PORT=3000
NODE_ENV="development"
FRONTEND_URL="http://localhost:5173"
ALLOWED_ORIGINS="http://localhost:5173,http://localhost:3000"

# Opcional: Price IDs de Stripe para cada plan
STRIPE_PRICE_ROMANTICO="price_..."
STRIPE_PRICE_APASIONADO="price_..."
STRIPE_PRICE_ETERNO="price_..."
```

### 5. Instalar dependencias y preparar la base de datos

```bash
# Dentro de backend/
npm install

# Genera el cliente Prisma
npm run prisma:generate

# Crea las tablas (migraciones)
npm run prisma:migrate

# Pobla la base de datos con planes y sorpresas iniciales
npx tsx prisma/seed.ts
```

### 6. Levantar el backend

```bash
npm run dev
# Servidor en http://localhost:3000
```

### 7. Configurar y levantar el frontend

```bash
cd ../frontend
cp .env.example .env
npm install
npm run dev
# App en http://localhost:5173
```

### 8. Configurar webhooks de Stripe (local)

En una terminal separada:

```bash
stripe login
stripe listen --forward-to http://localhost:3000/webhook
```

Copia el `whsec_...` que aparece y pégalo en `backend/.env` como `STRIPE_WEBHOOK_SECRET`.

---

## Endpoints del backend

### Auth

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/auth/registro` | Crear cuenta |
| POST | `/auth/login` | Iniciar sesión → JWT |

### Planes

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/planes` | Listar los 4 planes disponibles |

### Sorpresas

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/sorpresas` | Listar sorpresas según plan del usuario |

### Suscripciones

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/suscripciones/checkout` | Crear sesión de pago Stripe |
| GET | `/suscripciones/mi-suscripcion` | Estado actual de la suscripción |
| POST | `/suscripciones/cancelar` | Cancelar suscripción |

### Webhook

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/webhook` | Eventos de Stripe (invoice.paid, cancelaciones, etc.) |

---

## Planes disponibles

| Plan | Precio COP | Sorpresas/mes | Descripción |
|---|---|---|---|
| GRATUITO | $0 | 1 | Acceso básico para explorar la plataforma |
| ROMÁNTICO | $39.900 | 3 | Para los que creen en el amor |
| APASIONADO | $79.900 | 6 | Más sorpresas y experiencias exclusivas |
| ETERNO | $129.900 | Ilimitadas | La experiencia completa |

---

## Desarrollo

```bash
# Backend — hot reload
cd backend && npm run dev

# Frontend — hot reload
cd frontend && npm run dev

# Explorar base de datos visualmente
cd backend && npm run prisma:studio

# Ejecutar tests
cd backend && npm test
```

---

## Contribuir

1. Crea una rama: `git checkout -b feat/nombre-feature`
2. Haz tus cambios y commitea: `git commit -m 'feat: descripción'`
3. Push: `git push origin feat/nombre-feature`
4. Abre un Pull Request

---

*Hecho con 💕 para todos los enamorados.*
