export const codeStorage = new Map<string, StoredCode>()
export const codeHistory = new Map<string, StoredCode>()

export interface StoredCode {
  code: string
  timestamp: number
  expiresAt: number
  expired?: boolean
}

// Clean up expired entries based on expiresAt timestamp
export async function cleanupExpired() {
  const now = Date.now()
  const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000

  console.log("[v0] Cleaning up expired codes")

  // Move expired active codes to history
  for (const [key, value] of codeStorage.entries()) {
    if (value.expiresAt < now) {
      codeHistory.set(key, { ...value, expired: true })
      codeStorage.delete(key)
      console.log("[v0] Moved expired code to history:", key)
    }
  }

  // Clean up history older than 30 days
  for (const [key, value] of codeHistory.entries()) {
    if (value.timestamp < thirtyDaysAgo) {
      codeHistory.delete(key)
      console.log("[v0] Removed old history entry:", key)
    }
  }
}

export async function storeCode(accessCode: string, storedCode: StoredCode) {
  codeStorage.set(accessCode, storedCode)
  console.log("[v0] Stored code:", accessCode)
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

export async function expireCode(accessCode: string): Promise<boolean> {
  const stored = codeStorage.get(accessCode)
  if (stored) {
    codeHistory.set(accessCode, { ...stored, expired: true })
    codeStorage.delete(accessCode)
    console.log("[v0] Manually expired code:", accessCode)
    return true
  }
  return false
}

export function getActiveCodes(): StoredCode[] {
  return Array.from(codeStorage.entries()).map(([accessCode, data]) => ({
    ...data,
    accessCode,
  }))
}

export function getExpiredCodes(): StoredCode[] {
  return Array.from(codeHistory.entries()).map(([accessCode, data]) => ({
    ...data,
    accessCode,
  }))
}
