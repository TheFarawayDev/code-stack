import { NextResponse } from "next/server"
import { getActiveCodes, getExpiredCodes, cleanupExpired, getTeacherIds } from "@/lib/storage"

export async function GET() {
  // Only block if explicitly not on Vercel and not in development
  if (process.env.VERCEL !== "1" && process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "This service only works on Vercel" }, { status: 403 })
  }

  try {
    console.log("[v0] Dashboard API: Cleaning up expired codes")
    await cleanupExpired()

    const activeCodes = getActiveCodes()
    const expiredCodes = getExpiredCodes()
    const teacherIds = getTeacherIds()

    console.log("[v0] Dashboard API: Returning data", {
      activeCount: activeCodes.length,
      expiredCount: expiredCodes.length,
      teacherIdCount: teacherIds.length,
    })

    return NextResponse.json({
      activeCodes,
      expiredCodes,
      teacherIds,
    })
  } catch (error) {
    console.error("[v0] Dashboard API error:", error)
    return NextResponse.json({ error: "Failed to fetch dashboard data" }, { status: 500 })
  }
}
