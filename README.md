# Collab.ia 🤝✨

**Plataforma de voluntariado inteligente para la frontera Rivera (UY) / Santana do Livramento (BR)**

La IA conecta organizaciones que necesitan ayuda con voluntarios compatibles basándose en **habilidades, disponibilidad y ubicación**.

---

## 🚀 Inicio Rápido

### Prerrequisitos
- Node.js 20+ (o Docker)
- API Key de Google Gemini (gratis en [aistudio.google.com](https://aistudio.google.com/app/apikey))

### 1. Configurar variables de entorno

```bash
cp .env.local.example .env.local
# Editar .env.local y poner tu GEMINI_API_KEY
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Inicializar base de datos

```bash
npm run db:push   # Crea las tablas en SQLite
npm run db:seed   # Carga datos de demo
```

### 4. Correr en desarrollo

```bash
npm run dev
# Abre http://localhost:3000
```

---

## 🐳 Con Docker

```bash
# Copiar y editar variables
cp .env.local.example .env.local
# Editar GEMINI_API_KEY en .env.local

# Levantar todo con un comando
docker compose up --build
# Abre http://localhost:3000
```

---

## 🧠 Cómo funciona el Matching con IA

1. **La Organización** describe su necesidad en texto libre
2. **Gemini 2.0 Flash** extrae: `title`, `required_skills[]`, `required_availability`, `location`
3. **Algoritmo de matching** cruza con voluntarios:
   - 🛠️ Skills: **55%** — intersección entre habilidades del voluntario y requeridas
   - 📍 Localización: **30%** — Rivera y Livramento son tratadas como ciudades gemelas
   - 📅 Disponibilidad: **15%** — comparación por keywords (fines de semana, entre semana, etc.)
4. **Top 5 voluntarios** con mayor score quedan guardados como `matches`

---

## 📁 Estructura del Proyecto

```
src/
├── app/
│   ├── page.tsx                    # Landing + selección de rol
│   ├── org/
│   │   ├── dashboard/page.tsx      # Dashboard de organización
│   │   └── new-need/page.tsx       # Publicar necesidad + ver matches
│   ├── volunteer/
│   │   ├── profile/page.tsx        # Perfil del voluntario
│   │   └── matches/page.tsx        # Ver y responder matches
│   └── api/
│       ├── health/route.ts          # Health check
│       ├── users/route.ts           # Crear/listar usuarios
│       ├── needs/route.ts           # Crear need + AI + matching
│       └── matches/route.ts         # Ver/actualizar matches
├── lib/
│   ├── prisma.ts                   # Prisma singleton
│   ├── gemini.ts                   # Gemini client + system prompt
│   └── matching.ts                 # Algoritmo de matching
└── components/
    └── ui/                         # shadcn/ui components
```

---

## 🗄️ Base de Datos (SQLite + Prisma)

| Tabla | Descripción |
|-------|-------------|
| `User` | Voluntarios y Organizaciones (role: volunteer/org) |
| `Need` | Necesidades publicadas por organizaciones |
| `Match` | Matches generados por la IA (score 0-1) |

---

## 📧 Emails de demo (tras `npm run db:seed`)

| Rol | Email |
|-----|-------|
| Org | centrocultural@rivera.uy |
| Org | fundacion@livramento.br |
| Voluntario | ana.design@gmail.com (diseño) |
| Voluntario | carlos.sound@hotmail.com (sonido) |
| Voluntario | lucia.web@gmail.com (desarrollo) |
| Voluntario | pedro.logistica@yahoo.com (logística) |
| Voluntario | sofia.foto@gmail.com (fotografía) |

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router) + Tailwind CSS
- **Backend**: API Routes de Next.js
- **Base de datos**: SQLite + Prisma ORM
- **IA**: Google Gemini 2.0 Flash
- **Infra**: Docker + Docker Compose
- **Auth**: Fake auth via cookie (modo demo)

---

*Hackathon 2026 · Rivera 🇺🇾 / Santana do Livramento 🇧🇷*
