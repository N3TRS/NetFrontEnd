"use client"

import { useEffect, useRef, useMemo } from "react"
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

const getXTermColorsFromCSS = () => {
  const root = document.documentElement
  const computedStyle = getComputedStyle(root)

  const getColor = (varName: string): string => {
    return computedStyle.getPropertyValue(varName).trim()
  }

  return {
    background: getColor('--xterm-background'),
    foreground: getColor('--xterm-foreground'),
    cursor: getColor('--xterm-cursor'),
    cursorAccent: getColor('--xterm-cursorAccent'),
    selectionBackground: getColor('--xterm-selectionBackground'),
    black: getColor('--xterm-black'),
    red: getColor('--xterm-red'),
    green: getColor('--xterm-green'),
    yellow: getColor('--xterm-yellow'),
    blue: getColor('--xterm-blue'),
    magenta: getColor('--xterm-magenta'),
    cyan: getColor('--xterm-cyan'),
    white: getColor('--xterm-white'),
    brightBlack: getColor('--xterm-brightBlack'),
    brightRed: getColor('--xterm-brightRed'),
    brightGreen: getColor('--xterm-brightGreen'),
    brightYellow: getColor('--xterm-brightYellow'),
    brightBlue: getColor('--xterm-brightBlue'),
    brightMagenta: getColor('--xterm-brightMagenta'),
    brightCyan: getColor('--xterm-brightCyan'),
    brightWhite: getColor('--xterm-brightWhite'),
  }
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
  const writtenCountRef = useRef(0)

  const terminalOptions = useMemo(() => ({
    allowTransparency: true,
    theme: getXTermColorsFromCSS(),
    fontFamily: "'JetBrains Mono', 'Fira Code', 'Courier New', monospace",
    fontSize: 13,
    lineHeight: 1.4,
    cursorBlink: true,
    cursorStyle: "block" as const,
    scrollback: 10000,
  }), [resolvedTheme])

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
      }
    })

    if (ref.current) observer.observe(ref.current)

    return () => observer.disconnect()
  }, [instance, fitAddon, ref])

  useEffect(() => {
    if (!instance) return
    if (logs.length === 0) {
      writtenCountRef.current = 0
      instance.reset()
      return
    }
    const newLogs = logs.slice(writtenCountRef.current)
    newLogs.forEach((log) => instance.writeln(colorizeLog(log)))
    writtenCountRef.current = logs.length
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


