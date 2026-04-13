"use client"

import { useEffect, useMemo } from "react"
import { useXTerm } from "react-xtermjs"
import { FitAddon } from "@xterm/addon-fit"
import "@xterm/xterm/css/xterm.css"
import { LinkIcon } from "lucide-react"

const BANNER = [
  "██████╗ ██╗███████╗███╗   ██╗██╗   ██╗███████╗███╗   ██╗██╗██████╗  ██████╗      █████╗      ██████╗ ███╗   ███╗███╗   ██╗██╗ ██████╗ ██████╗ ██████╗ ███████╗",
  "██╔══██╗██║██╔════╝████╗  ██║██║   ██║██╔════╝████╗  ██║██║██╔══██╗██╔═══██╗    ██╔══██╗    ██╔═══██╗████╗ ████║████╗  ██║██║██╔════╝██╔═══██╗██╔══██╗██╔════╝",
  "██████╔╝██║█████╗  ██╔██╗ ██║██║   ██║█████╗  ██╔██╗ ██║██║██║  ██║██║   ██║    ███████║    ██║   ██║██╔████╔██║██╔██╗ ██║██║██║     ██║   ██║██║  ██║█████╗  ",
  "██╔══██╗██║██╔══╝  ██║╚██╗██║╚██╗ ██╔╝██╔══╝  ██║╚██╗██║██║██║  ██║██║   ██║    ██╔══██║    ██║   ██║██║╚██╔╝██║██║╚██╗██║██║██║     ██║   ██║██║  ██║██╔══╝  ",
  "██████╔╝██║███████╗██║ ╚████║ ╚████╔╝ ███████╗██║ ╚████║██║██████╔╝╚██████╔╝    ██║  ██║    ╚██████╔╝██║ ╚═╝ ██║██║ ╚████║██║╚██████╗╚██████╔╝██████╔╝███████╗",
  "╚═════╝ ╚═╝╚══════╝╚═╝  ╚═══╝  ╚═══╝  ╚══════╝╚═╝  ╚═══╝╚═╝╚═════╝  ╚═════╝     ╚═╝  ╚═╝     ╚═════╝ ╚═╝     ╚═╝╚═╝  ╚═══╝╚═╝ ╚═════╝ ╚═════╝ ╚═════╝ ╚══════╝",
]


const terminalOptions = {
  allowTransparency: true,
  theme: {
    background: "rgba(26, 31, 46, 0.95)",
    foreground: "#e6edf3",
    cursor: "#FF8B10",
    cursorAccent: "#0a0e14",
    selectionBackground: "#5A189A55",
    black: "#0a0e14",
    red: "#ff5555",
    green: "#50fa7b",
    yellow: "#f1fa8c",
    blue: "#7b93f5",
    magenta: "#FF8B10",
    cyan: "#8be9fd",
    white: "#c9d1d9",
    brightBlack: "#4d4d4d",
    brightRed: "#ff6e67",
    brightGreen: "#5af78e",
    brightYellow: "#f4f99d",
    brightBlue: "#caa9fa",
    brightMagenta: "#ff92d0",
    brightCyan: "#9aedfe",
    brightWhite: "#e6edf3",
  },
  fontFamily: "'JetBrains Mono', 'Fira Code', 'Courier New', monospace",
  fontSize: 14,
  lineHeight: 1.4,
  cursorBlink: true,
  cursorStyle: "block",
  scrollback: 1000,
}

export default function TerminalRunning() {
  const fitAddon = useMemo(() => new FitAddon(), [])
  const addons = useMemo(() => [fitAddon], [fitAddon])
  const { ref, instance } = useXTerm({ options: terminalOptions, addons })

  useEffect(() => {
    if (!instance) return

    fitAddon.fit()

    const observer = new ResizeObserver(() => fitAddon.fit())
    if (ref.current) observer.observe(ref.current)

    const orange = "\x1b[38;2;255;139;16m"
    const reset = "\x1b[0m"
    const hPad = Math.max(0, Math.floor((instance.cols - 158) / 2))
    const pad = " ".repeat(hPad)

    BANNER.forEach((line) => instance.writeln(orange + pad + line + reset))
    instance.writeln("")

    return () => observer.disconnect()
  }, [instance, fitAddon, ref])

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] overflow-hidden p-6 gap-4">
      <div className="flex-1 min-h-0 rounded-lg overflow-hidden border border-white/5">
        <div ref={ref} style={{ height: "100%", width: "100%" }} />
      </div>
      <div className="flex items-center justify-center gap-2 py-2">
        <LinkIcon className="w-5 h-5 text-primary shrink-0" />
        <span className="bg-linear-to-r from-primary to-accent bg-clip-text text-transparent text-xl font-semibold text-center">
          Este es la url para probar tu aplicación Maven Spring Boot
        </span>
      </div>
    </div>
  )
}
