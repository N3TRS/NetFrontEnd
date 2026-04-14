"use client"

import { useEffect, useMemo } from "react"
import { useXTerm } from "react-xtermjs"
import { FitAddon } from "@xterm/addon-fit"
import { useTheme } from "@/lib/theme/useTheme"
import "@xterm/xterm/css/xterm.css"

interface TerminalOutputProps {
  logs: string[]
}

const LOG_LEVEL_COLORS: Record<string, { color: string; indicator: string }> = {
  INFO: { color: "\x1b[38;2;80;250;123m", indicator: "✓" }, // Green
  WARN: { color: "\x1b[38;2;241;250;140m", indicator: "⚠" }, // Yellow
  ERROR: { color: "\x1b[38;2;255;85;85m", indicator: "✕" }, // Red
  DEBUG: { color: "\x1b[38;2;139;233;253m", indicator: "◆" }, // Cyan
}

const RESET_COLOR = "\x1b[0m"

// xterm color schemes based on theme
const XTERM_COLORS = {
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

const colorizeLog = (line: string): string => {
  for (const [level, { color }] of Object.entries(LOG_LEVEL_COLORS)) {
    if (line.includes(level)) {
      return color + line + RESET_COLOR
    }
  }
  return line
}

export default function TerminalOutput({ logs }: TerminalOutputProps) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const themeColors = isDark ? XTERM_COLORS.dark : XTERM_COLORS.light

  const terminalOptions = useMemo(() => ({
    allowTransparency: true,
    theme: themeColors,
    fontFamily: "'JetBrains Mono', 'Fira Code', 'Courier New', monospace",
    fontSize: 13,
    lineHeight: 1.4,
    cursorBlink: true,
    cursorStyle: "block" as const,
    scrollback: 1000,
  }), [themeColors])

  const fitAddon = useMemo(() => new FitAddon(), [])
  const addons = useMemo(() => [fitAddon], [fitAddon])
  const { ref, instance } = useXTerm({ options: terminalOptions, addons })

  useEffect(() => {
    if (!instance) return

    fitAddon.fit()

    const observer = new ResizeObserver(() => {
      try {
        fitAddon.fit()
      } catch (e) {
        // Handle resize edge cases
      }
    })
    
    if (ref.current) observer.observe(ref.current)

    return () => observer.disconnect()
  }, [instance, fitAddon, ref])

  useEffect(() => {
    if (!instance || logs.length === 0) return

    const lastLog = logs[logs.length - 1]
    const colorizedLog = colorizeLog(lastLog)
    instance.writeln(colorizedLog)
  }, [logs, instance])

  return (
    <div 
      className="flex-1 min-h-0 rounded-none overflow-hidden border transition-theme"
      style={{
        borderColor: 'var(--terminal-border)',
      }}
      role="region"
      aria-label="Terminal output area"
    >
      <div 
        ref={ref} 
        style={{ 
          height: "100%", 
          width: "100%",
          overflow: 'hidden',
          overscrollBehavior: 'contain',
        }} 
      />
    </div>
  )
}

