import { NextResponse } from "next/server"
import { getTeacherIds, addTeacherId, removeTeacherId } from "@/lib/storage"

export async function GET() {
  console.log("[v0] Getting teacher IDs")
  try {
    const teacherIds = getTeacherIds()
    console.log("[v0] Teacher IDs retrieved:", teacherIds)
    return NextResponse.json({ teacherIds: Array.from(teacherIds) })
  } catch (error) {
    console.error("[v0] Error getting teacher IDs:", error)
    return NextResponse.json({ error: "Failed to get teacher IDs" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  console.log("[v0] Adding teacher ID")
  try {
    const { teacherId } = await request.json()
    console.log("[v0] Adding teacher ID:", teacherId)

    if (!teacherId || typeof teacherId !== "string") {
      return NextResponse.json({ error: "Invalid teacher ID" }, { status: 400 })
    }

    const success = addTeacherId(teacherId)
    if (success) {
      const teacherIds = getTeacherIds()
      console.log("[v0] Teacher ID added successfully, new count:", teacherIds.size)
      return NextResponse.json({
        success: true,
        teacherIds: Array.from(teacherIds),
        count: teacherIds.size,
      })
    } else {
      return NextResponse.json({ error: "Teacher ID already exists" }, { status: 400 })
    }
  } catch (error) {
    console.error("[v0] Error adding teacher ID:", error)
    return NextResponse.json({ error: "Failed to add teacher ID" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  console.log("[v0] Removing teacher ID")
  try {
    const { teacherId } = await request.json()
    console.log("[v0] Removing teacher ID:", teacherId)

    if (!teacherId || typeof teacherId !== "string") {
      return NextResponse.json({ error: "Invalid teacher ID" }, { status: 400 })
    }

    const success = removeTeacherId(teacherId)
    if (success) {
      const teacherIds = getTeacherIds()
      console.log("[v0] Teacher ID removed successfully, new count:", teacherIds.size)
      return NextResponse.json({
        success: true,
        teacherIds: Array.from(teacherIds),
        count: teacherIds.size,
      })
    } else {
      return NextResponse.json({ error: "Teacher ID not found" }, { status: 404 })
    }
  } catch (error) {
    console.error("[v0] Error removing teacher ID:", error)
    return NextResponse.json({ error: "Failed to remove teacher ID" }, { status: 500 })
  }
}
