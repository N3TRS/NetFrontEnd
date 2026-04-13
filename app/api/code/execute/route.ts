import { NextResponse } from "next/server";

const EXEC_API_BASE = process.env.CODE_EXEC_API_URL || "http://localhost:2000/api/v2";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const upstreamResponse = await fetch(`${EXEC_API_BASE}/execute`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    const responseText = await upstreamResponse.text();

    let data: unknown;
    try {
      data = responseText ? JSON.parse(responseText) : {};
    } catch {
      data = { message: responseText || "Invalid upstream response" };
    }

    return NextResponse.json(data, { status: upstreamResponse.status });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unexpected error while proxying execution request";

    return NextResponse.json(
      {
        message: "Proxy execution failed",
        error: message,
      },
      { status: 502 }
    );
  }
}
