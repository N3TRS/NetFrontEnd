"use client"

const ORCHESTRATOR_BASE = "/api/orchestrator"

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
      const response = await fetch(`${ORCHESTRATOR_BASE}/run`, {
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

    const run = async () => {
      try {
        const response = await fetch(`${ORCHESTRATOR_BASE}/logs/${jobName}`, {
          headers: {
            Accept: "text/event-stream",
            "Cache-Control": "no-cache",
          },
        })

        if (!response.ok || !response.body) {
          callbacks.onError(`Failed to connect: ${response.statusText}`)
          callbacks.onComplete(-1)
          return
        }

        const reader = response.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ""
        let hasReceivedData = false

        while (!cancelled) {
          let done: boolean
          let value: Uint8Array | undefined

          try {
            const result = await reader.read()
            done = result.done
            value = result.value
          } catch {
            // Browser throws "Error in input stream" when server closes the
            // SSE connection — treat as normal completion if data was received
            if (!cancelled) callbacks.onComplete(hasReceivedData ? 0 : -1)
            return
          }

          if (done) break

          hasReceivedData = true
          buffer += decoder.decode(value, { stream: true })

          const lines = buffer.split("\n")
          buffer = lines.pop() ?? ""

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue
            let data = line.slice(6).trim()
            // Handle NestJS JSON-wrapped format: {"data": "..."}
            try {
              const parsed = JSON.parse(data)
              if (parsed && typeof parsed.data === "string") {
                data = parsed.data
              }
            } catch {
              // plain text, use as-is
            }
            if (data) callbacks.onLog(data)
          }
        }

        if (!cancelled) callbacks.onComplete(0)
      } catch (error) {
        if (!cancelled) {
          callbacks.onError(
            error instanceof Error ? error.message : "Unknown error"
          )
          callbacks.onComplete(-1)
        }
      }
    }

    run()
    return () => {
      cancelled = true
    }
  }

  return {
    submitBuild,
    streamLogs,
  }
}
