import { get } from "@vercel/edge-config"

export async function getTeacherIdsFromEdgeConfig(): Promise<string[]> {
  try {
    const teacherIds = await get("teacher_ids")
    return Array.isArray(teacherIds) ? teacherIds : ["TEACHER001", "ADMIN123", "EDUCATOR456"]
  } catch (error) {
    console.log("[v0] Error getting teacher IDs from Edge Config:", error)
    return ["TEACHER001", "ADMIN123", "EDUCATOR456"]
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

// Note: Edge Config is read-only from application code
// To update values, use the Vercel dashboard or CLI:
// vercel env add EDGE_CONFIG_ITEM_KEY value
