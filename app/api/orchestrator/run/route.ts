import { NextResponse } from "next/server"

const ORCHESTRATOR_URL = process.env.ORCHESTRATOR_URL || "http://localhost:3001"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const upstream = await fetch(`${ORCHESTRATOR_URL}/orchestrator/run`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    })
    const data = await upstream.json()
    return NextResponse.json(data, { status: upstream.status })
  } catch (error) {
    return NextResponse.json(
      { message: "Proxy failed", error: String(error) },
      { status: 502 }
    )
  }
}
