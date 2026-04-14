// Color configuration for light and dark themes
export const terminalColors = {
  light: {
    // Backgrounds
    bg: {
      primary: '#ffffff',
      secondary: '#f6f8fa',
      tertiary: '#eaeef2',
    },
    // Text
    text: {
      primary: '#0d1117',
      secondary: '#424a52',
      tertiary: '#656d76',
    },
    // Borders
    border: {
      primary: 'rgba(0, 0, 0, 0.1)',
      secondary: 'rgba(0, 0, 0, 0.05)',
    },
    // Status colors
    status: {
      running: '#0969da',
      completed: '#1a7f37',
      failed: '#d1242f',
      idle: '#57606a',
    },
    // Accents
    accent: {
      primary: '#0969da',
      orange: '#fb8500',
    },
    // UI Elements
    button: {
      bg: '#f6f8fa',
      bgHover: '#eaeef2',
      text: '#0d1117',
      border: 'rgba(0, 0, 0, 0.1)',
    },
    dropdown: {
      bg: '#ffffff',
      border: 'rgba(0, 0, 0, 0.1)',
      hover: '#f6f8fa',
    },
  },
  dark: {
    // Backgrounds
    bg: {
      primary: 'rgba(26, 31, 46, 0.95)',
      secondary: 'rgba(26, 31, 46, 0.8)',
      tertiary: 'rgba(26, 31, 46, 0.6)',
    },
    // Text
    text: {
      primary: '#e6edf3',
      secondary: '#8b949e',
      tertiary: '#6e7681',
    },
    // Borders
    border: {
      primary: 'rgba(255, 255, 255, 0.1)',
      secondary: 'rgba(255, 255, 255, 0.05)',
    },
    // Status colors
    status: {
      running: '#ff8b10',
      completed: '#50fa7b',
      failed: '#ff5555',
      idle: '#888888',
    },
    // Accents
    accent: {
      primary: '#ff8b10',
      orange: '#ff8b10',
    },
    // UI Elements
    button: {
      bg: '#21262d',
      bgHover: '#30363d',
      text: '#e6edf3',
      border: 'rgba(255, 255, 255, 0.1)',
    },
    dropdown: {
      bg: '#0d1117',
      border: 'rgba(255, 255, 255, 0.1)',
      hover: 'rgba(255, 255, 255, 0.05)',
    },
  },
}

// Terminal-specific xterm colors
export const xtermColors = {
  light: {
    background: '#ffffff',
    foreground: '#0d1117',
    cursor: '#0969da',
    cursorAccent: '#ffffff',
    selectionBackground: '#0969da33',
    black: '#0d1117',
    red: '#d1242f',
    green: '#1a7f37',
    yellow: '#9e6a03',
    blue: '#0969da',
    magenta: '#8250df',
    cyan: '#0184bc',
    white: '#6e7681',
    brightBlack: '#57606a',
    brightRed: '#f85149',
    brightGreen: '#3fb950',
    brightYellow: '#d29922',
    brightBlue: '#58a6ff',
    brightMagenta: '#bc8ef9',
    brightCyan: '#79c0ff',
    brightWhite: '#e6edf3',
  },
  dark: {
    background: 'rgba(26, 31, 46, 0.95)',
    foreground: '#e6edf3',
    cursor: '#ff8b10',
    cursorAccent: '#0a0e14',
    selectionBackground: '#5a189a55',
    black: '#0a0e14',
    red: '#ff5555',
    green: '#50fa7b',
    yellow: '#f1fa8c',
    blue: '#7b93f5',
    magenta: '#ff8b10',
    cyan: '#8be9fd',
    white: '#c9d1d9',
    brightBlack: '#4d4d4d',
    brightRed: '#ff6e67',
    brightGreen: '#5af78e',
    brightYellow: '#f4f99d',
    brightBlue: '#caa9fa',
    brightMagenta: '#ff92d0',
    brightCyan: '#9aedfe',
    brightWhite: '#e6edf3',
  },
}
