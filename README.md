# LatamPay 💸

> Billetera digital multi-moneda para administrar finanzas desde cualquier parte de LATAM, con compra, venta e intercambio de divisas latinoamericanas.

**LatamPay** permite a los usuarios gestionar saldos en múltiples monedas (Argentina, Colombia y Venezuela), comprar y vender divisas aplicando tasas de cambio reales, e intercambiar entre monedas dentro de la misma cuenta. Incluye confirmación por email tras cada operación y un chatbot asistente con IA.

> ⚠️ **Todas las transacciones son simuladas. No se usa dinero real. Los balances son ficticios.**

---

## 📑 Tabla de contenidos

- [Características](#-características)
- [Stack tecnológico](#-stack-tecnológico)
- [Requisitos](#-requisitos)
- [Instalación y setup local](#-instalación-y-setup-local)
- [Variables de entorno](#-variables-de-entorno)
- [Arquitectura](#-arquitectura)
- [Modelo de datos](#-modelo-de-datos)
- [Decisiones de diseño](#-decisiones-de-diseño)
- [Deploy](#-deploy)
- [Testing](#-testing)
- [Equipo](#-equipo)

---

## ✨ Características

- **Gestión multi-moneda**: saldos independientes en ARS (Argentina), COP (Colombia) y VES (Venezuela).
- **Compra / venta de monedas**: aplicando tasas de cambio reales obtenidas de una API externa.
- **Intercambio entre monedas**: conversión de una divisa a otra dentro de la misma cuenta.
- **Autenticación**: registro, login, logout y rutas protegidas con JWT.
- **Emails de confirmación**: cada transacción exitosa dispara un email vía AWS SES.
- **Chatbot asistente**: consultas sobre la plataforma usando Gemini (`gemini-2.5-flash`).

---

## 🛠 Stack tecnológico

| Capa | Tecnología |
| :--- | :--- |
| **Backend** | Express.js + TypeScript |
| **Base de datos** | PostgreSQL (Railway) |
| **Frontend** | React + TypeScript (`.tsx`) + Vite |
| **Serverless** | Vercel Functions + AWS SES SDK (emails) |
| **IA** | Google Gemini API (`gemini-2.5-flash`) |
| **Tasas de cambio** | ExchangeRate-API |
| **Testing** | Vitest |
| **Deploy** | Railway (backend + DB) · Vercel (frontend + functions) |

---

## 📋 Requisitos

Para levantar el proyecto localmente necesitás:

- **Node.js** `>= 18.x` <!-- [COMPLETAR: confirmar versión exacta usada por el equipo] -->
- **npm** `>= 9.x` (o el gestor que use el equipo: pnpm / yarn) <!-- [COMPLETAR] -->
- **PostgreSQL** `>= 14` corriendo localmente, o una instancia de Railway
- Una **cuenta de Railway** (backend + base de datos)
- Una **cuenta de Vercel** (frontend + funciones serverless)
- Credenciales de **AWS** con permisos de **SES** (verificar el remitente/dominio en SES)
- Una **API key de ExchangeRate-API** ([exchangerate-api.com](https://www.exchangerate-api.com/))
- Una **API key de Google Gemini** ([Google AI Studio](https://aistudio.google.com/))

---

## 🚀 Instalación y setup local

### 1. Clonar el repositorio

```bash
git clone <!-- [COMPLETAR: URL del repo en GitHub] -->
cd latampay
```

### 2. Backend

```bash
cd backend
npm install

# Copiar el archivo de ejemplo de variables de entorno y completarlo
cp .env.example .env

# Ejecutar migraciones / seed de la base de datos
npm run migrate   # [COMPLETAR: confirmar nombre del script]
npm run seed      # [COMPLETAR: opcional — carga de monedas iniciales]

# Levantar el servidor en modo desarrollo
npm run dev
```

El backend quedará disponible en `http://localhost:3000` <!-- [COMPLETAR: confirmar puerto] -->.

### 3. Frontend

```bash
cd ../frontend
npm install

# Copiar el archivo de ejemplo de variables de entorno y completarlo
cp .env.example .env

# Levantar el frontend en modo desarrollo
npm run dev
```

El frontend quedará disponible en `http://localhost:5173` (puerto por defecto de Vite).

### 4. Funciones serverless (emails)

Las funciones de envío de email viven en el directorio `/api` y se ejecutan en Vercel.
Para probarlas localmente:

```bash
npm install -g vercel
vercel dev
```

<!-- [COMPLETAR: confirmar la ubicación de las Vercel Functions — /api en el frontend o repo aparte] -->

---

## 🔐 Variables de entorno

### Backend (`backend/.env`)

```env
# Servidor
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173      # usado para CORS

# Base de datos PostgreSQL (Railway)
DATABASE_URL=postgresql://user:password@host:port/dbname

# Autenticación
JWT_SECRET=<!-- [COMPLETAR: string secreto largo y aleatorio] -->
JWT_EXPIRES_IN=1d

# Tasas de cambio
EXCHANGERATE_API_KEY=<!-- [COMPLETAR] -->

# Chatbot (Gemini)
GEMINI_API_KEY=<!-- [COMPLETAR] -->
```

### Frontend (`frontend/.env`)

```env
# URL pública del backend (en local apunta a localhost)
VITE_API_URL=http://localhost:3000
```

> En Vite, **solo las variables con prefijo `VITE_`** quedan expuestas al cliente. Nunca pongas claves secretas en el frontend.

### Funciones serverless / AWS SES (Vercel)

```env
AWS_ACCESS_KEY_ID=<!-- [COMPLETAR] -->
AWS_SECRET_ACCESS_KEY=<!-- [COMPLETAR] -->
AWS_REGION=us-east-1                      # [COMPLETAR: confirmar región de SES]
SES_FROM_EMAIL=latampaypf@gmail.com       # [COMPLETAR: email verificado en SES]
```

> ⚠️ Nunca commitees archivos `.env`. Asegurate de que estén en `.gitignore` y mantené un `.env.example` con las claves vacías como referencia.

---

## 🏗 Arquitectura

LatamPay está organizado como un **monorepo** con backend y frontend separados:

```
latampay/
├── backend/                 # API REST — Express + TypeScript
│   ├── src/
│   │   ├── routes/          # Definición de endpoints
│   │   ├── controllers/     # Reciben request / devuelven response
│   │   ├── services/        # Lógica de negocio (transacciones, tasas, etc.)
│   │   ├── repositories/    # Acceso a datos (PostgreSQL)
│   │   ├── middlewares/     # Auth (JWT), validaciones, manejo de errores
│   │   ├── config/          # Conexión a DB, variables, clientes externos
│   │   └── index.ts         # Punto de entrada
│   ├── tests/               # Tests con Vitest
│   └── .env.example
│
├── frontend/                # React + TypeScript + Vite
│   ├── src/
│   │   ├── pages/           # Login, Registro, Dashboard, etc.
│   │   ├── components/      # Componentes reutilizables
│   │   ├── services/        # Llamadas al backend (axios/fetch)
│   │   ├── context/         # Estado global (auth, etc.)
│   │   └── main.tsx
│   ├── api/                 # Vercel Functions (emails con AWS SES)
│   └── .env.example
│
└── README.md
```

### Capas del backend (principios SOLID)

El backend sigue una arquitectura por capas para mantener responsabilidades separadas, facilitar el testing y permitir escalabilidad:

1. **Routes** → definen las rutas HTTP y las conectan a un controller.
2. **Controllers** → orquestan el request/response, delegan la lógica a los services.
3. **Services** → contienen la lógica de negocio (cálculo de balances, conversión de monedas, validaciones). Es la capa que más se testea.
4. **Repositories** → único punto de acceso a la base de datos. Aíslan PostgreSQL del resto de la app.

Esta separación respeta el **Single Responsibility Principle** (cada capa tiene una única razón para cambiar) y el **Dependency Inversion Principle** (los services dependen de abstracciones de repositorio, no de detalles de la base), lo que hace el código más testeable y escalable.

### Integración de tasas de cambio (con caching)

Las tasas se obtienen de **ExchangeRate-API**. Como las tasas fiat se actualizan a diario (no en tiempo real), se cachean del lado del backend para no gastar el cupo gratuito de requests y mejorar la latencia.

- **Estrategia de cache**: <!-- [COMPLETAR: TTL elegido, ej. 24h / en memoria o en tabla de DB] -->
- **Fallback ante error**: si la API no responde, se usa la última tasa conocida cacheada. <!-- [COMPLETAR: confirmar implementación] -->

### Emails (AWS SES)

El envío de emails se hace mediante una **Vercel Function** que usa el **AWS SES SDK**. Cada transacción exitosa dispara un email de confirmación con: tipo de operación, montos, monedas y timestamp.

### Chatbot (Gemini)

El chatbot consulta la API de Gemini (`gemini-2.5-flash`) **a través de un endpoint del backend** que protege la API key. Recibe un *system prompt* con el contexto de la plataforma y es **solo informativo** (no ejecuta operaciones que muevan fondos). Incluye mitigaciones básicas contra *prompt injection*.

---

## 🗄 Modelo de datos

El modelo relacional en PostgreSQL se compone de cinco tablas:

```
USERS ||--|| WALLETS        (1:1) cada usuario tiene una wallet
WALLETS ||--o{ BALANCES     (1:N) una wallet agrupa un balance por moneda
WALLETS ||--o{ TRANSACTIONS (1:N) una wallet registra sus transacciones
CURRENCIES ||--o{ BALANCES  cada balance está denominado en una moneda
CURRENCIES ||--o{ TRANSACTIONS
```

| Tabla | Campos principales |
| :--- | :--- |
| **users** | `id` (PK), `email` (UNIQUE), `password_hash`, `name`, `created_at` |
| **wallets** | `id` (PK), `user_id` (FK → users), `created_at` |
| **currencies** | `code` (PK, ej. ARS/COP/VES), `name`, `type`, `decimals` |
| **balances** | `id` (PK), `wallet_id` (FK), `currency_code` (FK), `amount` |
| **transactions** | `id` (PK), `wallet_id` (FK), `type`, `from_currency`, `to_currency`, `from_amount`, `to_amount`, `exchange_rate`, `created_at` |

**Constraints e índices relevantes:**

- `users.email` → `UNIQUE`
- `balances` → `UNIQUE (wallet_id, currency_code)` (un único saldo por moneda por wallet)
- Todas las FK con `NOT NULL` donde corresponda
- Índices sugeridos: `balances(wallet_id)`, `transactions(wallet_id, created_at)` para consultas de historial

<!-- [COMPLETAR: confirmar tipo de password_hash (bcrypt), y si VES usa el código correcto del bolívar] -->

---

## 🧠 Decisiones de diseño

### Modelo de wallets / balances

Optamos por un modelo donde cada usuario tiene una **única wallet (relación 1:1)**, y esa wallet agrupa **múltiples balances, uno por cada moneda (relación 1:N)**. Cada balance es una fila independiente en la tabla `balances`, identificada por la combinación única de wallet y moneda.

Elegimos representar cada moneda como una **fila** (en lugar de columnas fijas) por dos razones:

1. **Normalización**: evitamos una tabla con columnas dispersas y mantenemos un único lugar donde vive el saldo de cada moneda.
2. **Escalabilidad**: agregar una moneda nueva no requiere modificar el esquema (`ALTER TABLE`), solo insertar una fila. El modelo soporta N monedas sin cambios estructurales.

Descartamos el modelo de múltiples wallets por usuario porque ninguna funcionalidad del proyecto lo requiere: el intercambio entre monedas ocurre dentro de la misma wallet, moviendo valor entre filas de balances.

### Sistema de transacciones

Usamos un modelo **single-entry**: una única tabla `transactions` donde cada fila describe un movimiento completo (wallet, monedas y montos de cada lado, tasa aplicada y timestamp). Los balances se actualizan directamente dentro de la **misma transacción de base de datos**.

Evaluamos *double-entry bookkeeping* (estándar de la industria por su auditabilidad), pero lo descartamos para este proyecto porque su implementación con multi-moneda agrega complejidad significativa que excede el alcance de tres semanas, sin beneficio proporcional para un sistema simulado.

Garantizamos consistencia con dos decisiones:

- **Append-only**: las transacciones nunca se modifican ni borran; una corrección genera una transacción compensatoria.
- **Atomicidad**: la actualización de balances y el registro de la transacción suceden juntos dentro de una transacción de DB (o no suceden).

### API de tasas de cambio

Usamos **ExchangeRate-API** porque soporta las monedas latinoamericanas de la plataforma (ARS, COP, VES), a diferencia de APIs basadas en el Banco Central Europeo (como Frankfurter) que solo cubren algunas monedas de la región. Su plan gratuito (1500 requests/mes, actualización diaria) es suficiente, ya que las tasas fiat no requieren actualización en tiempo real.

---

## ☁️ Deploy

### Backend + Base de datos → Railway

1. Crear un proyecto en [Railway](https://railway.app/) y agregar un servicio **PostgreSQL**.
2. Conectar el repositorio de GitHub y seleccionar el directorio `backend/`.
3. Configurar las **variables de entorno** (ver sección anterior). Railway provee `DATABASE_URL` automáticamente al vincular la base.
4. Ejecutar migraciones en el primer deploy. <!-- [COMPLETAR: comando o configuración del release] -->
5. URL pública del backend: <!-- [COMPLETAR: URL de Railway] -->

### Frontend + Funciones serverless → Vercel

1. Importar el repositorio en [Vercel](https://vercel.com/) y seleccionar el directorio `frontend/`.
2. Framework preset: **Vite**.
3. Configurar las variables de entorno (`VITE_API_URL` apuntando al backend de Railway, y las credenciales de AWS SES para las funciones).
4. Las funciones en `/api` se despliegan automáticamente como Vercel Functions.
5. URL pública del frontend: <!-- [COMPLETAR: URL de Vercel] -->

> Asegurate de que el `FRONTEND_URL` del backend (CORS) coincida con la URL de Vercel en producción.

---

## 🧪 Testing

Los tests están escritos con **Vitest** y cubren la lógica crítica del negocio: cálculos de balance, validaciones de transacciones y conversiones de moneda.

```bash
cd backend
npm run test          # corre la suite completa
npm run test:watch    # modo watch    [COMPLETAR: confirmar scripts]
```

---

## 👥 Equipo

**LatamPay** — equipo consultor.
📧 latampaypf@gmail.com

| Nombre | Rol |
| :--- | :--- |
| Galvez Landers, Maximo | Frontend |
| Rozalez, Facundo German | Backend |
| Fereira Borroso, Luis Alfredo | Frontend |

> **Misión:** La constancia y el compromiso son la base sobre la que construimos LatamPay. No esperamos que las necesidades surjan; innovamos para resolverlas antes de que se conviertan en problemas.

---

<!-- [COMPLETAR: licencia, capturas de pantalla, link al video de la demo, etc. — opcional] -->