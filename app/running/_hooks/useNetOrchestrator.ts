"use client"

import { io, Socket } from "socket.io-client"

const ORCHESTRATOR_BASE = process.env.NEXT_PUBLIC_URL_APIGATEWAY
const ORCHESTRATOR_WS = process.env.NEXT_PUBLIC_URL_APIGATEWAY

interface SubmitBuildResponse {
  jobName: string
  message: string
}

interface StreamLogsCallbacks {
  onLog: (line: string) => void
  onError: (error: string) => void
  onComplete: (exitCode?: number) => void
}

export const useNetOrchestrator = () => {
  const submitBuild = async (repoUrl: string): Promise<string> => {
    try {
      const response = await fetch(`${ORCHESTRATOR_BASE}/orchestrator/run`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ REPO_URL: repoUrl }),
      })

      if (!response.ok) {
        throw new Error(`Failed to submit build: ${response.statusText}`)
      }

      const data: SubmitBuildResponse = await response.json()
      return data.jobName
    } catch (error) {
      throw new Error(`Failed to submit build: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  const streamLogs = (
    jobName: string,
    callbacks: StreamLogsCallbacks
  ): (() => void) => {
    let cancelled = false
    let socket: Socket | null = null

    try {
      socket = io(ORCHESTRATOR_WS, {
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
        transports: ["websocket", "polling"],
      })

      socket.on("connect", () => {
        socket!.emit("logs", jobName)
      })

      socket.on("logs:data", (data: string) => {
        if (!cancelled && data && data.trim()) {
          callbacks.onLog(data)
        }
      })

      socket.on("logs:complete", () => {
        if (!cancelled) {
          callbacks.onComplete(0)
        }
      })

      socket.on("logs:error", (error: any) => {
        if (!cancelled) {
          const errorMsg = typeof error === "string" ? error : error?.message || "Unknown error"
          console.error("WebSocket error:", errorMsg)
          callbacks.onError(errorMsg)
          callbacks.onComplete(-1)
        }
        if (socket) {
          socket.disconnect()
        }
      })

      socket.on("disconnect", () => {
        if (!cancelled) {
          if (socket!.connected === false && !cancelled) {
            callbacks.onError("WebSocket connection lost")
            callbacks.onComplete(-1)
          }
        }
      })

      socket.on("connect_error", (error: any) => {
        if (!cancelled) {
          console.error("WebSocket connection error:", error.message)
          callbacks.onError(`Connection error: ${error.message}`)
          callbacks.onComplete(-1)
        }
      })
    } catch (error) {
      if (!cancelled) {
        const errorMsg = error instanceof Error ? error.message : "Unknown error"
        callbacks.onError(errorMsg)
        callbacks.onComplete(-1)
      }
    }

    return () => {
      cancelled = true
      if (socket) {
        socket.disconnect()
      }
    }
  }

  return {
    submitBuild,
    streamLogs,
  }
}
