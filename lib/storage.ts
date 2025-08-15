import { promises as fs } from "fs"
import path from "path"

export const codeStorage = new Map<string, StoredCode>()
export const codeHistory = new Map<string, StoredCode>()

// Initialize teacher IDs from environment variable or use defaults
let teacherIds: Set<string> | null = null

async function initializeTeacherIds(): Promise<Set<string>> {
  // Try Edge Config first
  try {
    const { getTeacherIdsFromEdgeConfig } = await import("./edge-config-storage")
    const edgeConfigIds = await getTeacherIdsFromEdgeConfig()
    console.log("[v0] Loaded teacher IDs from Edge Config:", edgeConfigIds)
    return new Set(edgeConfigIds)
  } catch (error) {
    console.log("[v0] Could not load from Edge Config, trying environment variable")
  }

  // Fallback to environment variable
  const envTeacherIds = process.env.TEACHER_IDS
  if (envTeacherIds) {
    try {
      const ids = JSON.parse(envTeacherIds)
      console.log("[v0] Loaded teacher IDs from environment:", ids)
      return new Set(Array.isArray(ids) ? ids : ["TEACHER001", "ADMIN123", "EDUCATOR456"])
    } catch (error) {
      console.log("[v0] Failed to parse TEACHER_IDS from environment, using defaults")
    }
  }

  console.log("[v0] Using default teacher IDs")
  return new Set(["TEACHER001", "ADMIN123", "EDUCATOR456"])
}

async function getTeacherIdsSet(): Promise<Set<string>> {
  if (!teacherIds) {
    teacherIds = await initializeTeacherIds()
  }
  return teacherIds
}

export interface StoredCode {
  code: string
  timestamp: number
  expiresAt: number
  expired?: boolean
  teacherId?: string
  accessCode?: string
}

const STORAGE_DIR = path.join(process.cwd(), ".storage")
const ACTIVE_CODES_FILE = path.join(STORAGE_DIR, "active-codes.json")
const CODE_HISTORY_FILE = path.join(STORAGE_DIR, "code-history.json")

async function ensureStorageDir() {
  try {
    await fs.mkdir(STORAGE_DIR, { recursive: true })
  } catch (error) {
    console.log("[v0] Could not create storage directory:", error)
  }
}

async function saveActiveCodes() {
  try {
    await ensureStorageDir()
    const data = Object.fromEntries(codeStorage.entries())
    await fs.writeFile(ACTIVE_CODES_FILE, JSON.stringify(data, null, 2))
    console.log("[v0] Saved active codes to file")
  } catch (error) {
    console.log("[v0] Could not save active codes:", error)
  }
}

async function saveCodeHistory() {
  try {
    await ensureStorageDir()
    const data = Object.fromEntries(codeHistory.entries())
    await fs.writeFile(CODE_HISTORY_FILE, JSON.stringify(data, null, 2))
    console.log("[v0] Saved code history to file")
  } catch (error) {
    console.log("[v0] Could not save code history:", error)
  }
}

async function loadActiveCodes() {
  try {
    const data = await fs.readFile(ACTIVE_CODES_FILE, "utf-8")
    const parsed = JSON.parse(data)
    for (const [key, value] of Object.entries(parsed)) {
      codeStorage.set(key, value as StoredCode)
    }
    console.log("[v0] Loaded", codeStorage.size, "active codes from file")
  } catch (error) {
    console.log("[v0] Could not load active codes (starting fresh):", error)
  }
}

async function loadCodeHistory() {
  try {
    const data = await fs.readFile(CODE_HISTORY_FILE, "utf-8")
    const parsed = JSON.parse(data)
    for (const [key, value] of Object.entries(parsed)) {
      codeHistory.set(key, value as StoredCode)
    }
    console.log("[v0] Loaded", codeHistory.size, "history entries from file")
  } catch (error) {
    console.log("[v0] Could not load code history (starting fresh):", error)
  }
}

let initialized = false
async function initializeStorage() {
  if (initialized) return
  initialized = true

  console.log("[v0] Initializing persistent storage...")
  await loadActiveCodes()
  await loadCodeHistory()
  await cleanupExpired()
}

// Clean up expired entries based on expiresAt timestamp
export async function cleanupExpired() {
  await initializeStorage()

  const now = Date.now()
  const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000

  console.log("[v0] Cleaning up expired codes")
  let changesActive = false
  let changesHistory = false

  // Move expired active codes to history
  for (const [key, value] of codeStorage.entries()) {
    if (value.expiresAt < now) {
      codeHistory.set(key, { ...value, expired: true })
      codeStorage.delete(key)
      console.log("[v0] Moved expired code to history:", key)
      changesActive = true
      changesHistory = true
    }
  }

  // Clean up history older than 30 days
  for (const [key, value] of codeHistory.entries()) {
    if (value.timestamp < thirtyDaysAgo) {
      codeHistory.delete(key)
      console.log("[v0] Removed old history entry:", key)
      changesHistory = true
    }
  }

  if (changesActive) await saveActiveCodes()
  if (changesHistory) await saveCodeHistory()
}

// Generate a random 12-character access code
export function generateAccessCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  let result = ""
  for (let i = 0; i < 12; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export async function storeCode(accessCode: string, storedCode: StoredCode) {
  await initializeStorage()
  codeStorage.set(accessCode, storedCode)
  console.log("[v0] Stored code:", accessCode)
  await saveActiveCodes()
}

export async function expireCode(accessCode: string): Promise<boolean> {
  await initializeStorage()
  const stored = codeStorage.get(accessCode)
  if (stored) {
    codeHistory.set(accessCode, { ...stored, expired: true })
    codeStorage.delete(accessCode)
    console.log("[v0] Manually expired code:", accessCode)
    await saveActiveCodes()
    await saveCodeHistory()
    return true
  }
  return false
}

export async function getActiveCodes(): Promise<StoredCode[]> {
  await initializeStorage()
  return Array.from(codeStorage.entries()).map(([accessCode, data]) => ({
    ...data,
    accessCode,
  }))
}

export async function getExpiredCodes(): Promise<StoredCode[]> {
  await initializeStorage()
  return Array.from(codeHistory.entries()).map(([accessCode, data]) => ({
    ...data,
    accessCode,
  }))
}

async function persistTeacherIds() {
  const ids = await getTeacherIdsSet()
  const idsArray = Array.from(ids)
  console.log("[v0] Teacher IDs updated. Current list:", idsArray)
  console.log("[v0] To persist across restarts, set TEACHER_IDS environment variable to:", JSON.stringify(idsArray))
}

export async function isValidTeacherId(teacherId: string): Promise<boolean> {
  const ids = await getTeacherIdsSet()
  return ids.has(teacherId)
}

export async function getTeacherIds(): Promise<string[]> {
  const ids = await getTeacherIdsSet()
  return Array.from(ids)
}

export async function addTeacherId(teacherId: string): Promise<boolean> {
  const ids = await getTeacherIdsSet()
  if (ids.has(teacherId)) {
    console.log("[v0] Teacher ID already exists:", teacherId)
    return false
  }
  ids.add(teacherId)
  console.log("[v0] Added teacher ID:", teacherId)
  await persistTeacherIds()
  return true
}

export async function removeTeacherId(teacherId: string): Promise<boolean> {
  const ids = await getTeacherIdsSet()
  const removed = ids.delete(teacherId)
  if (removed) {
    console.log("[v0] Removed teacher ID:", teacherId)
    await persistTeacherIds()
  }
  return removed
}

export async function getTeacherIdCount(): Promise<number> {
  const ids = await getTeacherIdsSet()
  return ids.size
}
