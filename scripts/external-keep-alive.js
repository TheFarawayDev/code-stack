// External keep-alive script for running on a separate server/service
// This version includes more robust error handling and retry logic

const SERVER_URL = "https://your-app-name.vercel.app" // Replace with your actual Vercel URL
const PING_INTERVAL = 5 * 60 * 1000 // 5 minutes
const MAX_RETRIES = 3
const RETRY_DELAY = 30 * 1000 // 30 seconds

console.log("[External Keep-Alive] Starting external keep-alive service...")
console.log(`[External Keep-Alive] Target server: ${SERVER_URL}`)

async function pingWithRetry(retryCount = 0) {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

    const response = await fetch(`${SERVER_URL}/api/dashboard`, {
      method: "GET",
      headers: {
        "User-Agent": "External-Keep-Alive-Bot/1.0",
        Accept: "application/json",
      },
      signal: controller.signal,
    })

    clearTimeout(timeoutId)
    const timestamp = new Date().toISOString()

    if (response.ok) {
      console.log(`[External Keep-Alive] ${timestamp} - ✅ Server is alive (${response.status})`)
      return true
    } else {
      throw new Error(`HTTP ${response.status}`)
    }
  } catch (error) {
    const timestamp = new Date().toISOString()

    if (retryCount < MAX_RETRIES) {
      console.log(
        `[External Keep-Alive] ${timestamp} - ⚠️  Ping failed (${error.message}), retrying in ${RETRY_DELAY / 1000}s... (${retryCount + 1}/${MAX_RETRIES})`,
      )

      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY))
      return pingWithRetry(retryCount + 1)
    } else {
      console.error(`[External Keep-Alive] ${timestamp} - ❌ All retries failed: ${error.message}`)
      return false
    }
  }
}

async function keepAlive() {
  await pingWithRetry()
}

// Initial ping
keepAlive()

// Set up interval
const intervalId = setInterval(keepAlive, PING_INTERVAL)

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("\n[External Keep-Alive] Received SIGINT, shutting down...")
  clearInterval(intervalId)
  process.exit(0)
})

process.on("SIGTERM", () => {
  console.log("\n[External Keep-Alive] Received SIGTERM, shutting down...")
  clearInterval(intervalId)
  process.exit(0)
})

// Log startup completion
console.log("[External Keep-Alive] Keep-alive service is now running. Press Ctrl+C to stop.")
