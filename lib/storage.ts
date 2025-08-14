// Shared storage instance for the in-memory code storage
export const codeStorage = new Map<string, { code: string; timestamp: number }>()

// Clean up expired entries (older than 1 hour)
export function cleanupExpired() {
  const oneHourAgo = Date.now() - 60 * 60 * 1000 // 1 hour in milliseconds
  for (const [key, value] of codeStorage.entries()) {
    if (value.timestamp < oneHourAgo) {
      codeStorage.delete(key)
    }
  }
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
