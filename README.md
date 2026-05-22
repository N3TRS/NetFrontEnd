# 💻 NetFrontEnd — IDE Colaborativo en Tiempo Real

<div align="center">

### 🛠️ Stack Tecnológico

![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-16.2.6-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-19.2.6-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)

### ☁️ Colaboración & Tiempo Real

![Yjs](https://img.shields.io/badge/Yjs-CRDT_Sync-5522A1?style=for-the-badge)
![Monaco](https://img.shields.io/badge/Monaco_Editor-0.55.1-007ACC?style=for-the-badge&logo=visualstudiocode&logoColor=white)
![Socket.IO](https://img.shields.io/badge/Socket.IO-4.8.3-010101?style=for-the-badge&logo=socketdotio&logoColor=white)
![Excalidraw](https://img.shields.io/badge/Excalidraw-0.18.1-6965DB?style=for-the-badge)

### 🚀 Despliegue & Calidad

![Vercel](https://img.shields.io/badge/Vercel-Deploy-000000?style=for-the-badge&logo=vercel&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-CI/CD-2088FF?style=for-the-badge&logo=github-actions&logoColor=white)
![pnpm](https://img.shields.io/badge/pnpm-10-F69220?style=for-the-badge&logo=pnpm&logoColor=white)

</div>

---

## 📑 Tabla de Contenidos

1. [👤 Integrantes](#1--integrantes)
2. [🎯 Objetivo del Proyecto](#2--objetivo-del-proyecto)
3. [⚡ Funcionalidades Principales](#3--funcionalidades-principales)
4. [📋 Estrategia de Versionamiento y Branches](#4--estrategia-de-versionamiento-y-branches)
5. [⚙️ Tecnologías Utilizadas](#5-️-tecnologías-utilizadas)
6. [🧩 Páginas y Rutas](#6--páginas-y-rutas)
7. [🏛️ Arquitectura y Componentes](#7-️-arquitectura-y-componentes)
8. [🗂️ Organización del Código](#8-️-organización-del-código)
9. [🔗 Conexiones con Servicios Externos](#9--conexiones-con-servicios-externos)
10. [🚀 Ejecución del Proyecto](#10--ejecución-del-proyecto)
11. [⚙️ Pipelines CI/CD](#11-️-pipelines-cicd)
12. [☁️ Despliegue en Vercel](#12-️-despliegue-en-vercel)
13. [🤝 Integrantes y Contribuciones](#13--integrantes-y-contribuciones)

---

## 1. 👤 Integrantes

- Tulio Riaño Sánchez
- Julian Camilo Lopez Barrero
- Juan Sebastián Puentes Julio
- David Alejandro Patacon Henao

---

## 2. 🎯 Objetivo del Proyecto

**NetFrontEnd** es la interfaz web de **OmniCode** — un IDE colaborativo en tiempo real para el navegador. Permite a múltiples desarrolladores escribir, ejecutar y revisar código simultáneamente desde cualquier lugar, sin necesidad de configurar un entorno local. Integra edición colaborativa con CRDT (Yjs), ejecución instantánea de código, video/audio en tiempo real, pizarras colaborativas (Excalidraw), análisis de código con IA, e importación de repositorios GitHub.

---

## 3. ⚡ Funcionalidades Principales

| Funcionalidad | Descripción |
|---|---|
| **Editor colaborativo** | Monaco Editor sincronizado con CRDT (Yjs). Múltiples cursores visibles en tiempo real. |
| **Ejecución de código** | Ejecuta JavaScript, TypeScript, Python y Java sin instalar compiladores (vía Piston API). |
| **Video/Audio WebRTC** | Llamadas de voz y video con mediasoup-client, integradas en el editor. |
| **Pizarra colaborativa** | Tablero Excalidraw sincronizado con NetBoard en tiempo real. |
| **Chat de IA** | Panel de análisis de código con NetAI directamente en el editor. |
| **Integración GitHub** | Importa repositorios desde tu cuenta GitHub para editarlos y ejecutarlos. |
| **Gestión de sesiones** | Crea sesiones con código de invitación; controla roles (viewer, editor, admin). |
| **Terminal integrada** | xterm.js con soporte de autocompletado y fit-addon. |

---

## 4. 📋 Estrategia de Versionamiento y Branches

### Estrategia de Ramas (Git Flow)

#### `main` — Estable, auto-deploy a Vercel
#### `develop` — Integración de features
#### `feature/*` — Desarrollo de componentes/páginas

### 4.1 Convenciones para commits

```
feat: agregar componente VideoCall con mediasoup-client
fix: corregir sincronización de cursor en reconexión Yjs
style: ajustar layout del panel de IA en mobile
test: agregar prueba de hook useSessionSocket
```

---

## 5. ⚙️ Tecnologías Utilizadas

| **Tecnología** | **Uso en el proyecto** |
|---|---|
| **Next.js 16.2.6** | Framework React con App Router (SSR + RSC). |
| **React 19.2.6** | Librería de UI con Concurrent Features. |
| **TypeScript 5** | Tipado estático en todos los componentes. |
| **Tailwind CSS 4** | Estilos utility-first. |
| **Chakra UI 3.35.0** | Componentes accesibles y sistema de diseño. |
| **shadcn/ui** | Componentes Radix UI estilizados. |
| **Monaco Editor 0.55.1** | Editor de código (el mismo de VSCode). |
| **Yjs 13.6.30** | CRDT para sincronización colaborativa sin servidor central. |
| **y-websocket 3.0.0** | Proveedor WebSocket para Yjs. |
| **Socket.io-client 4.8.3** | Comunicación en tiempo real con NetSessions/NetCalls. |
| **mediasoup-client 3.20.0** | WebRTC SFU client para video/audio. |
| **Excalidraw 0.18.1** | Pizarra de diagramas colaborativa. |
| **@xterm/xterm 5.5.0** | Terminal web. |
| **Zustand 5.0.13** | Estado global ligero. |
| **Framer Motion 12.38.0** | Animaciones de UI. |
| **pnpm 10** | Gestor de paquetes eficiente. |

---

## 6. 🧩 Páginas y Rutas

| Ruta | Descripción |
|---|---|
| `/` | Landing page (Hero, Features, Navbar) |
| `/login` | Formulario de inicio de sesión (email/password o GitHub) |
| `/register` | Formulario de registro |
| `/forgot-password` | Recuperación de contraseña |
| `/reset-password` | Reset de contraseña con token |
| `/dashboard` | Panel principal: sesiones activas, selección de proyectos |
| `/dashboard/sessions` | Gestión de sesiones del usuario |
| `/codeEditor` | IDE colaborativo (`?sessionId=&inviteCode=&name=&language=`) |
| `/sessions` | Listado de sesiones |
| `/auth/callback` | Callback OAuth GitHub |
| `/(landing)/documentation` | Documentación del proyecto |

### API Routes (Next.js)

| Endpoint | Descripción |
|---|---|
| `POST /api/orchestrator/run` | Proxy a NetOrchestrator (ejecución Maven/Java) |
| `POST /api/code/execute` | Proxy a Piston API (ejecución de código) |

---

## 7. 🏛️ Arquitectura y Componentes

### Flujo de la Aplicación

```
Usuario
   │
   ├─ /login o /auth/github ──► NetAuthentication (JWT)
   │
   ├─ /dashboard ──────────────► NetSessions (sesiones del usuario)
   │
   └─ /codeEditor
         ├── Monaco + Yjs ──────► NetSessions WebSocket (sync CRDT)
         ├── VideoCall ──────────► NetCalls (Socket.IO + Mediasoup)
         ├── Whiteboard ─────────► NetBoard (Socket.IO + Excalidraw)
         ├── AIChatPanel ────────► NetAI (/analyze)
         └── Run Code ───────────► Piston API (ejecución)
```

### Componentes Principales del Editor

| Componente | Descripción |
|---|---|
| `MonacoCanvas` | Monaco + integración Yjs CRDT + cursores remotos |
| `EditorTerminal` | xterm.js con fit-addon |
| `AIChatPanel` | Chat con NetAI para análisis de código |
| `CollaborativeWhiteboard` | Excalidraw sincronizado con NetBoard |
| `VideoCall` | Audio/video WebRTC con mediasoup-client |
| `SessionRolesModal` | Gestión de permisos de participantes |
| `EditorHeader` | Toolbar: lenguaje, acciones, info de sesión |
| `EditorSidebar` | Navegador de archivos (react-arborist) |

### Hooks Principales

| Hook | Propósito |
|---|---|
| `useSessionSocket` | Conexión Socket.IO a NetSessions |
| `useCodeExecution` | Ejecución de código via Piston |
| `useSessionPermissions` | Verificación de roles del participante |
| `useWebRTC` | Gestión de streams WebRTC |
| `useAuth` | Autenticación JWT y OAuth |

---

## 8. 🗂️ Organización del Código

```
NetFrontEnd/
│
├── app/                              # Next.js App Router
│   ├── (landing)/                    # Landing + documentación
│   ├── auth/callback/                # OAuth callback
│   ├── codeEditor/                   # IDE colaborativo
│   │   ├── App.tsx                   # Componente raíz del editor
│   │   ├── api.ts                    # API client methods
│   │   ├── components/               # Todos los componentes del editor
│   │   ├── hooks/                    # useSessionSocket, useWebRTC, etc.
│   │   ├── lib/                      # Utilidades del editor
│   │   └── _stores/callStore.ts      # Estado global Zustand
│   ├── dashboard/                    # Panel de sesiones
│   ├── sessions/                     # Listado de sesiones
│   ├── api/                          # Route handlers Next.js
│   │   ├── orchestrator/run/         # Proxy a NetOrchestrator
│   │   └── code/execute/             # Proxy a Piston
│   ├── _contexts/ProjectContext.tsx  # Contexto de proyecto
│   ├── login/ register/              # Formularios de auth
│   ├── layout.tsx                    # Root layout
│   └── globals.css
│
├── components/ui/                    # shadcn/ui + componentes compartidos
├── lib/                              # Utilidades globales + terminal
├── public/                           # Assets estáticos
├── next.config.ts                    # Config: transpile excalidraw, optimize imports
├── tailwind.config.js
├── package.json                      # pnpm 10
└── .github/workflows/ci.yml
```

---

## 9. 🔗 Conexiones con Servicios Externos

| Servicio | Variable de Entorno | Descripción |
|---|---|---|
| **NetOrchestrator** | `ORCHESTRATOR_URL` | Ejecución de proyectos Maven/Java vía `/api/orchestrator/run`. |
| **NetAuthentication** | Backend API | Autenticación, JWT, repos GitHub. |
| **NetSessions** | WebSocket (NetSessions URL) | Sincronización CRDT Yjs + presencia + ejecución de código. |
| **NetCalls** | WebSocket (NetCalls URL) | Señalización de llamadas + Socket.IO. |
| **NetBoard** | WebSocket (NetBoard URL) | Sincronización de pizarra Excalidraw. |
| **NetAI** | HTTP REST | `/analyze` para análisis de código con IA. |
| **Piston API** | `PISTON_API_URL` | Ejecución de código (JS, TS, Python, Java). |
| **GitHub OAuth** | Implicit (auth service) | Login y acceso a repositorios. |

---

## 10. 🚀 Ejecución del Proyecto

### 📋 Prerrequisitos

- **Node.js 18+**, **pnpm 10** (o npm/bun/yarn)

```bash
# Instalar dependencias
pnpm install

# Desarrollo con hot-reload
pnpm dev

# Build de producción
pnpm build

# Servidor de producción
pnpm start
```

📍 **URL Local:** `http://localhost:3000`

### ⚙️ Variables de Entorno

| Variable | Requerida | Descripción |
|:---|:---:|:---|
| `ORCHESTRATOR_URL` | ❌ | URL de NetOrchestrator (default: `http://localhost:3001`) |

> La mayoría de conexiones backend se manejan desde el cliente directamente via variables configuradas en los stores/hooks.

### Validaciones de código

```bash
pnpm lint           # ESLint
pnpm type-check     # TypeScript (tsc --noEmit)
```

---

## 11. ⚙️ Pipelines CI/CD

### Pipeline — `ci.yml`

**Triggers:** push a `main` y `develop`

```
Checkout → pnpm install
    → security-audit (npm audit --audit-level high)
    → quality-checks (ESLint + TypeScript type-check)
    → deploy (Vercel CLI)
```

### Secrets requeridos

| Secret | Descripción |
|---|---|
| `VERCEL_TOKEN` | Token de autenticación Vercel |
| `VERCEL_ORG_ID` | ID de la organización en Vercel |
| `VERCEL_PROJECT_ID` | ID del proyecto en Vercel |

---

## 12. ☁️ Despliegue en Vercel

NetFrontEnd se despliega automáticamente en Vercel en cada push a `main`.

| Recurso | Valor |
|---|---|
| **Plataforma** | Vercel (SPA + SSR) |
| **Trigger** | Push automático desde `main` |
| **Build command** | `pnpm build` |
| **Output directory** | `.next/` |

---

## 13. 🤝 Integrantes y Contribuciones

<div align="center">

![Course](https://img.shields.io/badge/Course-ARSW-orange?style=for-the-badge)
![Year](https://img.shields.io/badge/Year-2026--1-blue?style=for-the-badge)

| 👤 Integrante | 🎓 Rol |
|:---|:---|
| Tulio Riaño Sánchez | Desarrollo y arquitectura |
| Julian Camilo Lopez Barrero | Desarrollo y arquitectura |
| Juan Sebastián Puentes Julio | Desarrollo y arquitectura |
| David Alejandro Patacon Henao | Desarrollo y arquitectura |

> 💡 **NetFrontEnd** une todas las piezas del ecosistema OmniCode en una sola interfaz: edición colaborativa CRDT, ejecución instantánea, video/audio WebRTC, pizarras y análisis IA — todo en el navegador, sin instalar nada.

**🎓 Escuela Colombiana de Ingeniería Julio Garavito**

</div>
