import { NextResponse } from "next/server"
import { get } from "@vercel/edge-config"

export const config = {
  matcher: ["/welcome", "/api/config/:path*"],
}

export async function middleware(request: Request) {
  const url = new URL(request.url)

  // Handle welcome endpoint
  if (url.pathname === "/welcome") {
    const greeting = await get("greeting")
    return NextResponse.json(greeting || "Hello from Edge Config!")
  }

  // Handle config API endpoints
  if (url.pathname.startsWith("/api/config/")) {
    const configKey = url.pathname.split("/api/config/")[1]
    const configValue = await get(configKey)
    return NextResponse.json({ key: configKey, value: configValue })
  }

  return NextResponse.next()
}
