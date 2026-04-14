"use client"

import { useEffect, useMemo } from "react"
import { useXTerm } from "react-xtermjs"
import { FitAddon } from "@xterm/addon-fit"
import { useTheme } from "@/lib/theme/useTheme"
import { xtermColors } from "@/lib/theme/colors"
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
  const themeColors = isDark ? xtermColors.dark : xtermColors.light

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
        borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
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

