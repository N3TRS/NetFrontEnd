"use client"

const ORCHESTRATOR_URL = "http://localhost:3001"

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
      const response = await fetch(`${ORCHESTRATOR_URL}/orchestrator/run`, {
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
    callbacks: StreamLogsCallbacks,
    maxRetries: number = 3
  ): EventSource | null => {
    let retries = 0
    let eventSource: EventSource | null = null

    const connect = (): void => {
      try {
        eventSource = new EventSource(
          `${ORCHESTRATOR_URL}/orchestrator/logs/${jobName}`
        )

        eventSource.onmessage = (event: MessageEvent) => {
          const logLine = event.data
          callbacks.onLog(logLine)
        }

        eventSource.onerror = () => {
          eventSource?.close()
          eventSource = null

          if (retries < maxRetries) {
            retries++
            setTimeout(() => {
              connect()
            }, 2000)
          } else {
            callbacks.onError(
              `Connection failed after ${maxRetries} attempts`
            )
            callbacks.onComplete(-1)
          }
        }
      } catch (error) {
        if (retries < maxRetries) {
          retries++
          setTimeout(() => {
            connect()
          }, 2000)
        } else {
          callbacks.onError(
            `Failed to connect: ${error instanceof Error ? error.message : "Unknown error"}`
          )
          callbacks.onComplete(-1)
        }
      }
    }

    connect()
    return eventSource
  }

  const closeStream = (eventSource: EventSource | null): void => {
    if (eventSource) {
      eventSource.close()
    }
  }

  return {
    submitBuild,
    streamLogs,
    closeStream,
  }
}
