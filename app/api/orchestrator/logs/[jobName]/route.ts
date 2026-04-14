import { NextRequest } from "next/server"

const ORCHESTRATOR_URL = process.env.ORCHESTRATOR_URL || "http://localhost:3001"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ jobName: string }> }
) {
  const { jobName } = await params
  const upstream = await fetch(
    `${ORCHESTRATOR_URL}/orchestrator/logs/${jobName}`,
    {
      headers: { Accept: "text/event-stream" },
      cache: "no-store",
    }
  )

  return new Response(upstream.body, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
      "X-Accel-Buffering": "no",
    },
  })
}
