# NetFrontEnd

IDE colaborativo en tiempo real para programación en el navegador. Escribe, ejecuta y comparte código con otros desarrolladores simultáneamente, sin necesidad de configurar tu máquina local.

NetFrontEnd es parte de **OmniCode** — *The Future of Collaborative Coding* (El futuro de la programación colaborativa). Una plataforma diseñada para que múltiples usuarios programen juntos en tiempo real, ejecuten código instantáneamente y colaboren en proyectos desde cualquier lugar.

## Características Principales

- **Editor de Código Colaborativo**: Edita código simultáneamente con otros usuarios. Los cambios se sincronizan en tiempo real con cursores múltiples visibles.
- **Ejecución Instantánea**: Ejecuta código en JavaScript, TypeScript, Python y Java sin necesidad de instalar compiladores. Obtén resultados inmediatos.
- **Integración GitHub**: Importa repositorios directamente desde tu cuenta de GitHub y ejecuta código desde tus proyectos.

## Comenzar

Estas instrucciones te permitirán obtener una copia del proyecto ejecutándose en tu máquina local para desarrollo.

### Requisitos Previos

Necesitarás tener instalado:

- **Node.js** versión 18 o superior. Descárgalo desde [nodejs.org](https://nodejs.org/)
- Un gestor de paquetes: **npm**, **pnpm**, **bun** o **yarn**

Verifica que los tienes instalados:

```bash
node --version  # v18.x.x o superior
npm --version   # o pnpm --version, bun --version, yarn --version
```

### Instalación

**1. Clona el repositorio**

```bash
git clone https://github.com/N3TRS/NetFrontEnd.git
cd NetFrontEnd
```

**2. Instala las dependencias**

Elige el gestor de paquetes que prefieras:

```bash
# Con npm
npm install

# Con pnpm
pnpm install

# Con bun
bun install

# Con yarn
yarn install
```

**3. Inicia el servidor de desarrollo**

```bash
# Con npm
npm run dev

# Con pnpm
pnpm dev

# Con bun
bun dev

# Con yarn
yarn dev
```

El servidor estará disponible en `http://localhost:3000`. Abre tu navegador y accede a esa URL para ver la aplicación en funcionamiento.

## Cómo Usar

### Programar en Tiempo Real

1. Crea una cuenta o inicia sesión con tu cuenta de GitHub
2. Accede al dashboard
3. Selecciona o crea una sesión de programación
4. Comparte el enlace de la sesión con otros usuarios
5. Comienza a escribir código — los cambios se sincronizan automáticamente

### Ejecutar Código

1. Escribe tu código en el editor
2. Selecciona el lenguaje (JavaScript, TypeScript, Python o Java)
3. Haz clic en el botón "Run Code"
4. La salida se mostrará en el panel derecho en tiempo real

### Usar Repositorios GitHub

1. Desde el dashboard, selecciona "Seleccionar Proyecto"
2. Busca y selecciona un repositorio de tu cuenta
3. El código del repositorio se cargará en el editor
4. Ejecuta y edita el código colaborativamente

## Compilación para Producción

Para crear una compilación optimizada lista para producción:

```bash
npm run build   # o: pnpm build, bun build, yarn build
```

Esto generará los archivos optimizados en el directorio `.next/`.

Para iniciar el servidor de producción localmente:

```bash
npm start       # o: pnpm start, bun start, yarn start
```

## Hecho con

- [Next.js](https://nextjs.org/) - Framework React moderno con SSR y file-based routing
- [React](https://react.dev/) - Librería JavaScript para construir interfaces de usuario
- [TypeScript](https://www.typescriptlang.org/) - Tipado estático para JavaScript
- [Monaco Editor](https://microsoft.github.io/monaco-editor/) - Editor de código potente y personalizable (usado en VSCode)
- [Tailwind CSS](https://tailwindcss.com/) - Framework de estilos utility-first para diseño moderno
- [Chakra UI](https://chakra-ui.com/) - Librería de componentes accesibles y reutilizables
- [Socket.io](https://socket.io/) - Comunicación en tiempo real bidireccional

## Arquitectura

NetFrontEnd se comunica con:

- **Backend API** - Para autenticación, gestión de usuarios y sesiones
- **Piston API** - Para compilación y ejecución de código
- **GitHub OAuth** - Para autenticación y acceso a repositorios

El flujo típico:

1. Usuario se autentica con GitHub u email/password
2. Se obtiene un JWT token almacenado en el navegador
3. Usuario accede al editor colaborativo
4. Los cambios de código se envían al backend
5. Al hacer clic "Run Code", se envía a Piston API para ejecución

## Desarrollo

### Scripts Disponibles

```bash
# Desarrollar con hot reload
npm run dev

# Compilar para producción
npm run build

# Iniciar servidor producción (requiere build previo)
npm start

# Validar código con ESLint
npm run lint
```

### Estructura del Proyecto

```
NetFrontEnd/
├── app/                    # Rutas y páginas (Next.js 13+ App Router)
│   ├── (landing)/          # Página de inicio
│   ├── auth/               # Autenticación
│   ├── login/              # Formulario de login
│   ├── register/           # Formulario de registro
│   ├── dashboard/          # Panel principal
│   ├── codeEditor/         # Editor de código colaborativo
│   ├── globals.css         # Estilos globales
│   └── layout.tsx          # Layout raíz
├── components/             # Componentes reutilizables
│   └── ui/                 # Componentes shadcn/ui
├── lib/                    # Funciones utilitarias
├── public/                 # Archivos estáticos
└── package.json            # Dependencias y scripts
```

## Deployment

NetFrontEnd está deployado en [Vercel](https://vercel.com/). La URL de la aplicación en vivo se encuentra en el repositorio de GitHub.

Para deployar tu propia instancia en Vercel:

1. Haz fork del repositorio
2. Conéctalo a tu cuenta de Vercel
3. Configura las variables de entorno necesarias
4. Vercel automáticamente deployará en cada push a main

## Autores

- **Tulio Riaño Sánchez** - *Desarrollador Principal* - [GitHub](https://github.com/TulioRianSanchez)
- **Julián López Barrero** - *Desarrollador* - [GitHub](https://github.com/JulianLopez11)
- **Alejandro Henao** - *Desarrollador* - [GitHub](https://github.com/AlejandroHenao2572)
- **Sebastián Puentes** - *Desarrollador* - [GitHub](https://github.com/orgs/N3TRS/people/sebasPuentes)

Ver la lista completa de [contribuidores](https://github.com/N3TRS/NetFrontEnd/graphs/contributors).

## Licencia

Este proyecto está licenciado bajo la Licencia MIT — ver el archivo [LICENSE](LICENSE) para más detalles.

## Reconocimientos

- Inspirado en plataformas colaborativas como Replit y Codeshare
- Agradecimientos a los desarrolladores de Monaco Editor, Tailwind CSS y Next.js
- Comunidad de desarrolladores open source que hace posible proyectos como este
