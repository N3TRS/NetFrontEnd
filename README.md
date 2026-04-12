# NetFrontEnd

Real-time collaborative IDE for programming in your browser. Write, execute, and share code with other developers simultaneously, without needing to configure your local machine.

NetFrontEnd is part of **OmniCode** — *The Future of Collaborative Coding*. A platform designed for multiple users to code together in real-time, execute code instantly, and collaborate on projects from anywhere.

## Key Features

- **Collaborative Code Editor**: Edit code simultaneously with other users. Changes sync in real-time with multiple visible cursors.
- **Instant Code Execution**: Run code in JavaScript, TypeScript, Python, and Java without needing to install compilers. Get results immediately.
- **GitHub Integration**: Import repositories directly from your GitHub account and execute code from your projects.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development.

### Prerequisites

You'll need to have installed:

- **Node.js** version 18 or higher. Download from [nodejs.org](https://nodejs.org/)
- A package manager: **npm**, **pnpm**, **bun**, or **yarn**

Verify you have them installed:

```bash
node --version  # v18.x.x or higher
npm --version   # or pnpm --version, bun --version, yarn --version
```

### Installation

**1. Clone the repository**

```bash
git clone https://github.com/N3TRS/NetFrontEnd.git
cd NetFrontEnd
```

**2. Install dependencies**

Choose your preferred package manager:

```bash
# With npm
npm install

# With pnpm
pnpm install

# With bun
bun install

# With yarn
yarn install
```

**3. Start the development server**

```bash
# With npm
npm run dev

# With pnpm
pnpm dev

# With bun
bun dev

# With yarn
yarn dev
```

The server will be available at `http://localhost:3000`. Open your browser and navigate to that URL to see the application running.

## How to Use

### Real-Time Collaborative Programming

1. Create an account or sign in with your GitHub account
2. Access the dashboard
3. Select or create a programming session
4. Share the session link with other users
5. Start writing code — changes sync automatically

### Execute Code

1. Write your code in the editor
2. Select the language (JavaScript, TypeScript, Python, or Java)
3. Click the "Run Code" button
4. Output will display in the right panel in real-time

### Use GitHub Repositories

1. From the dashboard, select "Select Project"
2. Search and select a repository from your account
3. The repository code will load in the editor
4. Execute and edit the code collaboratively

## Production Build

To create an optimized production build:

```bash
npm run build   # or: pnpm build, bun build, yarn build
```

This will generate optimized files in the `.next/` directory.

To start the production server locally:

```bash
npm start       # or: pnpm start, bun start, yarn start
```

## Built With

- [Next.js](https://nextjs.org/) - Modern React framework with SSR and file-based routing
- [React](https://react.dev/) - JavaScript library for building user interfaces
- [TypeScript](https://www.typescriptlang.org/) - Static typing for JavaScript
- [Monaco Editor](https://microsoft.github.io/monaco-editor/) - Powerful and customizable code editor (used in VSCode)
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework for modern design
- [Chakra UI](https://chakra-ui.com/) - Library of accessible and reusable components
- [Socket.io](https://socket.io/) - Bidirectional real-time communication

## Architecture

NetFrontEnd communicates with:

- **Backend API** - For authentication, user management, and sessions
- **Piston API** - For code compilation and execution
- **GitHub OAuth** - For authentication and repository access

Typical flow:

1. User authenticates with GitHub or email/password
2. JWT token is obtained and stored in the browser
3. User accesses the collaborative editor
4. Code changes are sent to the backend
5. Clicking "Run Code" sends the code to Piston API for execution

## Development

### Available Scripts

```bash
# Develop with hot reload
npm run dev

# Build for production
npm run build

# Start production server (requires prior build)
npm start

# Validate code with ESLint
npm run lint
```

### Project Structure

```
NetFrontEnd/
├── app/                    # Routes and pages (Next.js 13+ App Router)
│   ├── (landing)/          # Landing page
│   ├── auth/               # Authentication
│   ├── login/              # Login form
│   ├── register/           # Registration form
│   ├── dashboard/          # Main dashboard
│   ├── codeEditor/         # Collaborative code editor
│   ├── globals.css         # Global styles
│   └── layout.tsx          # Root layout
├── components/             # Reusable components
│   └── ui/                 # shadcn/ui components
├── lib/                    # Utility functions
├── public/                 # Static files
└── package.json            # Dependencies and scripts
```

## Deployment

NetFrontEnd is deployed on [Vercel](https://vercel.com/). The live application URL can be found in the GitHub repository.

To deploy your own instance on Vercel:

1. Fork the repository
2. Connect it to your Vercel account
3. Configure necessary environment variables
4. Vercel will automatically deploy on each push to main

## Authors

- **Tulio Riaño Sánchez** - *Lead Developer* - [GitHub](https://github.com/tulio3101)
- **Julián López Barrero** - *Developer* - [GitHub](https://github.com/JulianLopez11)
- **Alejandro Henao** - *Developer* - [GitHub](https://github.com/AlejandroHenao2572)
- **Sebastián Puentes** - *Developer* - [GitHub](https://github.com/sebaspuentes)
- **OpenCode** - *Developer* - [GitHub](https://github.com/anomalyco/opencode)

See the complete list of [contributors](https://github.com/N3TRS/NetFrontEnd/graphs/contributors).

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Inspired by collaborative platforms like Replit and Codeshare
- Thanks to the developers of Monaco Editor, Tailwind CSS, and Next.js
- Open source developer community that makes projects like this possible
