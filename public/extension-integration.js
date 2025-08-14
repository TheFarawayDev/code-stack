// Extension Integration Code for Code Storage Server
// Replace YOUR_VERCEL_URL with your actual Vercel deployment URL

const VERCEL_SERVER_URL = "https://your-app-name.vercel.app" // <-- UPDATE THIS

class CodeStorageAPI {
  constructor(serverUrl = VERCEL_SERVER_URL) {
    this.serverUrl = serverUrl
  }

  // Store code and get access code
  async storeCode(code) {
    try {
      const response = await fetch(`${this.serverUrl}/api/store`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to store code")
      }

      const data = await response.json()
      return {
        success: true,
        accessCode: data.accessCode,
        expiresIn: data.expiresIn,
        message: data.message,
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
      }
    }
  }

  // Retrieve code using access code
  async retrieveCode(accessCode) {
    try {
      const response = await fetch(`${this.serverUrl}/api/retrieve/${accessCode}`)

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to retrieve code")
      }

      const data = await response.json()
      return {
        success: true,
        code: data.code,
        storedAt: data.storedAt,
        message: data.message,
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
      }
    }
  }

  // Generate a quick email with the access code
  generateEmailLink(accessCode) {
    const subject = encodeURIComponent("Code Access Code")
    const body = encodeURIComponent(`Your code access code: ${accessCode}\n\nThis code expires in 1 hour.`)
    return `mailto:?subject=${subject}&body=${body}`
  }
}

// Example usage in your extension:
const codeStorage = new CodeStorageAPI()

// Store code (similar to your export functionality)
async function exportCodeToServer(code) {
  const result = await codeStorage.storeCode(code)

  if (result.success) {
    console.log("Code stored successfully!")
    console.log("Access Code:", result.accessCode)

    // Copy access code to clipboard
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(result.accessCode)
      console.log("Access code copied to clipboard!")
    }

    return result.accessCode
  } else {
    console.error("Failed to store code:", result.error)
    return null
  }
}

// Retrieve code (similar to your import functionality)
async function importCodeFromServer(accessCode) {
  const result = await codeStorage.retrieveCode(accessCode)

  if (result.success) {
    console.log("Code retrieved successfully!")
    console.log("Retrieved code:", result.code)

    // You can now use the retrieved code in your extension
    return result.code
  } else {
    console.error("Failed to retrieve code:", result.error)
    return null
  }
}

// Integration with your existing extension code
// Replace your existing export/import logic with these functions:

// For export (replace your existing export button logic):
document.getElementById("exportBtn")?.addEventListener("click", async () => {
  const code = document.getElementById("codeInput")?.value
  if (!code) {
    alert("No code to export")
    return
  }

  const accessCode = await exportCodeToServer(code)
  if (accessCode) {
    // Show the access code to user
    document.getElementById("exportString").value = accessCode
    alert(`Code stored! Access code: ${accessCode}`)
  }
})

// For import (replace your existing import button logic):
document.getElementById("importBtn")?.addEventListener("click", async () => {
  const accessCode = document.getElementById("importString")?.value?.trim()
  if (!accessCode) {
    alert("Please enter an access code")
    return
  }

  const code = await importCodeFromServer(accessCode)
  if (code) {
    // Use the retrieved code (download or display)
    const blob = new Blob([code], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "retrieved_code.txt"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }
})
