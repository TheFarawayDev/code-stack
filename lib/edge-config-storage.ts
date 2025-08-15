import { get, set } from "@vercel/edge-config"

export async function getTeacherIdsFromEdgeConfig(): Promise<string[]> {
  try {
    const teacherIds = await get("teacher_ids")
    return Array.isArray(teacherIds) ? teacherIds : ["TEACHER001", "ADMIN123", "EDUCATOR456"]
  } catch (error) {
    console.log("[v0] Error getting teacher IDs from Edge Config:", error)
    return ["TEACHER001", "ADMIN123", "EDUCATOR456"]
  }
}

export async function setTeacherIdsToEdgeConfig(teacherIds: string[]): Promise<boolean> {
  try {
    await set("teacher_ids", teacherIds)
    return true
  } catch (error) {
    console.log("[v0] Error setting teacher IDs to Edge Config:", error)
    return false
  }
}

export async function getConfigValue(key: string): Promise<any> {
  try {
    return await get(key)
  } catch (error) {
    console.log(`[v0] Error getting config value for ${key}:`, error)
    return null
  }
}

export async function setConfigValue(key: string, value: any): Promise<boolean> {
  try {
    await set(key, value)
    return true
  } catch (error) {
    console.log(`[v0] Error setting config value for ${key}:`, error)
    return false
  }
}
