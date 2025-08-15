// Keep-alive script to prevent serverless function from going idle
// This script pings the server every 5 minutes to keep it warm

const SERVER_URL = process.env.SERVER_URL || "https://your-app-name.vercel.app"
const PING_INTERVAL = 5 * 60 * 1000 // 5 minutes in milliseconds

console.log("[Keep-Alive] Starting keep-alive service...")
console.log(`[Keep-Alive] Server URL: ${SERVER_URL}`)
console.log(`[Keep-Alive] Ping interval: ${PING_INTERVAL / 1000} seconds`)

async function pingServer() {
  try {
    const response = await fetch(`${SERVER_URL}/api/dashboard`, {
      method: "GET",
      headers: {
        "User-Agent": "Keep-Alive-Bot/1.0",
      },
    })

    const timestamp = new Date().toISOString()

    if (response.ok) {
      console.log(`[Keep-Alive] ${timestamp} - Server ping successful (${response.status})`)
    } else {
      console.log(`[Keep-Alive] ${timestamp} - Server ping failed (${response.status})`)
    }
  } catch (error) {
    const timestamp = new Date().toISOString()
    console.error(`[Keep-Alive] ${timestamp} - Ping error:`, error.message)
  }
}

// Initial ping
pingServer()

// Set up interval pinging
setInterval(pingServer, PING_INTERVAL)

// Handle graceful shutdown
process.on("SIGINT", () => {
  console.log("\n[Keep-Alive] Shutting down keep-alive service...")
  process.exit(0)
})

process.on("SIGTERM", () => {
  console.log("\n[Keep-Alive] Shutting down keep-alive service...")
  process.exit(0)
})
