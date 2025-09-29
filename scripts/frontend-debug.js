// Frontend Video Generation Debug Tool
// Copy and paste this into your browser console while on the website

class FrontendVideoDebugger {
  constructor() {
    this.logs = []
    this.startTime = Date.now()
    this.originalFetch = window.fetch
    this.originalConsole = window.console

    // Override fetch to monitor API calls
    this.setupFetchInterceptor()

    // Add debug CSS for visual indicators
    this.addDebugStyles()
  }

  log(step, status, message, data = null) {
    const timestamp = Date.now() - this.startTime
    const logEntry = {
      timestamp: `${timestamp}ms`,
      step,
      status,
      message,
      data,
      time: new Date().toISOString()
    }
    this.logs.push(logEntry)

    const emoji = {
      'start': '🚀',
      'success': '✅',
      'error': '❌',
      'info': 'ℹ️',
      'warning': '⚠️'
    }[status] || '📝'

    console.log(`%c${emoji} [${timestamp}ms] ${step}: ${message}`,
      `color: ${status === 'error' ? 'red' : status === 'success' ? 'green' : 'blue'}; font-weight: bold;`)

    if (data) {
      console.log('   Data:', data)
    }

    // Show visual indicator on page
    this.showVisualIndicator(step, status, message)
  }

  setupFetchInterceptor() {
    const self = this
    window.fetch = async function(...args) {
      const [url, options] = args

      if (url.includes('/api/wan25/') || url.includes('/api/animations') || url.includes('/api/animation-history')) {
        self.log('API_CALL', 'start', `Calling ${url}`, { method: options?.method || 'GET' })
      }

      try {
        const response = await self.originalFetch.apply(this, args)
        const clonedResponse = response.clone()

        if (url.includes('/api/wan25/') || url.includes('/api/animations') || url.includes('/api/animation-history')) {
          const responseData = await clonedResponse.json().catch(() => ({}))

          if (response.ok) {
            self.log('API_CALL', 'success', `${url} responded ${response.status}`, responseData)
          } else {
            self.log('API_CALL', 'error', `${url} failed ${response.status}`, responseData)
          }
        }

        return response
      } catch (error) {
        if (url.includes('/api/wan25/') || url.includes('/api/animations') || url.includes('/api/animation-history')) {
          self.log('API_CALL', 'error', `${url} network error`, { error: error.message })
        }
        throw error
      }
    }
  }

  addDebugStyles() {
    const style = document.createElement('style')
    style.textContent = `
      .debug-indicator {
        position: fixed;
        top: 20px;
        right: 20px;
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 10px 15px;
        border-radius: 8px;
        font-family: monospace;
        font-size: 12px;
        z-index: 10000;
        max-width: 300px;
        word-wrap: break-word;
        animation: slideInRight 0.3s ease-out;
      }

      .debug-indicator.success {
        border-left: 4px solid #10b981;
      }

      .debug-indicator.error {
        border-left: 4px solid #ef4444;
      }

      .debug-indicator.warning {
        border-left: 4px solid #f59e0b;
      }

      .debug-indicator.info {
        border-left: 4px solid #3b82f6;
      }

      @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }

      .debug-panel {
        position: fixed;
        bottom: 20px;
        left: 20px;
        background: rgba(0, 0, 0, 0.9);
        color: white;
        padding: 15px;
        border-radius: 8px;
        font-family: monospace;
        font-size: 11px;
        z-index: 10000;
        max-width: 400px;
        max-height: 200px;
        overflow-y: auto;
      }
    `
    document.head.appendChild(style)
  }

  showVisualIndicator(step, status, message) {
    // Remove existing indicator
    const existing = document.querySelector('.debug-indicator')
    if (existing) {
      existing.remove()
    }

    // Create new indicator
    const indicator = document.createElement('div')
    indicator.className = `debug-indicator ${status}`
    indicator.innerHTML = `
      <strong>${step}</strong><br>
      ${message}
    `
    document.body.appendChild(indicator)

    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (indicator.parentNode) {
        indicator.remove()
      }
    }, 5000)
  }

  createDebugPanel() {
    const panel = document.createElement('div')
    panel.className = 'debug-panel'
    panel.innerHTML = `
      <div><strong>🔧 Video Debug Panel</strong></div>
      <div id="debug-status">Monitoring...</div>
      <div style="margin-top: 10px;">
        <button onclick="videoDebugger.checkFormData()" style="margin: 2px; padding: 5px 10px; font-size: 10px;">Check Form</button>
        <button onclick="videoDebugger.checkAuth()" style="margin: 2px; padding: 5px 10px; font-size: 10px;">Check Auth</button>
        <button onclick="videoDebugger.testAPIs()" style="margin: 2px; padding: 5px 10px; font-size: 10px;">Test APIs</button>
        <button onclick="videoDebugger.clearLogs()" style="margin: 2px; padding: 5px 10px; font-size: 10px;">Clear</button>
      </div>
    `
    document.body.appendChild(panel)
    return panel
  }

  async checkFormData() {
    this.log('FORM_CHECK', 'start', 'Checking form data')

    // Check if video generator form exists
    const textInput = document.querySelector('input[placeholder*="prompt"], input[placeholder*="text"], textarea[placeholder*="prompt"], textarea[placeholder*="text"]')
    const generateButton = document.querySelector('button[type="submit"], button:contains("Generate"), button:contains("生成")')
    const fileInput = document.querySelector('input[type="file"]')

    if (textInput) {
      this.log('FORM_CHECK', 'success', 'Text input found', { value: textInput.value, placeholder: textInput.placeholder })
    } else {
      this.log('FORM_CHECK', 'warning', 'Text input not found')
    }

    if (generateButton) {
      this.log('FORM_CHECK', 'success', 'Generate button found', { disabled: generateButton.disabled, text: generateButton.textContent })
    } else {
      this.log('FORM_CHECK', 'warning', 'Generate button not found')
    }

    if (fileInput) {
      this.log('FORM_CHECK', 'info', 'File input found', { files: fileInput.files.length })
    }

    // Check form state
    const forms = document.querySelectorAll('form')
    if (forms.length > 0) {
      this.log('FORM_CHECK', 'info', `Found ${forms.length} forms on page`)
    }
  }

  async checkAuth() {
    this.log('AUTH_CHECK', 'start', 'Checking authentication status')

    try {
      const response = await fetch('/api/animations', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (response.status === 401) {
        this.log('AUTH_CHECK', 'warning', 'User not authenticated')
      } else if (response.ok) {
        this.log('AUTH_CHECK', 'success', 'User authenticated')
      } else {
        this.log('AUTH_CHECK', 'error', `Authentication check failed: ${response.status}`)
      }
    } catch (error) {
      this.log('AUTH_CHECK', 'error', 'Authentication check failed', { error: error.message })
    }
  }

  async testAPIs() {
    this.log('API_TEST', 'start', 'Testing API endpoints')

    const endpoints = [
      { name: 'Animations', url: '/api/animations' },
      { name: 'Animation History', url: '/api/animation-history' }
    ]

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint.url)
        const status = response.status === 401 ? 'auth_required' : response.ok ? 'success' : 'error'
        const message = `${endpoint.name}: HTTP ${response.status}`

        this.log('API_TEST', status === 'error' ? 'error' : 'info', message)
      } catch (error) {
        this.log('API_TEST', 'error', `${endpoint.name}: ${error.message}`)
      }
    }
  }

  monitorVideoGeneration() {
    this.log('MONITOR', 'start', 'Monitoring for video generation')

    // Monitor form submissions
    document.addEventListener('submit', (e) => {
      if (e.target.closest('form')) {
        this.log('FORM_SUBMIT', 'info', 'Form submitted', { formAction: e.target.action })
      }
    })

    // Monitor button clicks
    document.addEventListener('click', (e) => {
      if (e.target.matches('button[type="submit"], button:contains("Generate"), button:contains("生成")')) {
        this.log('BUTTON_CLICK', 'info', 'Generate button clicked', { buttonText: e.target.textContent })
      }
    })

    // Monitor state changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          // Check for video elements being added
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              if (node.tagName === 'VIDEO' || node.querySelector && node.querySelector('video')) {
                this.log('VIDEO_ADDED', 'success', 'Video element added to DOM', { src: node.src || node.querySelector('video')?.src })
              }
            }
          })
        }
      })
    })

    observer.observe(document.body, { childList: true, subtree: true })
  }

  clearLogs() {
    this.logs = []
    this.startTime = Date.now()
    console.clear()
    this.log('DEBUG', 'info', 'Logs cleared')
  }

  showLogs() {
    console.table(this.logs)
  }

  exportLogs() {
    const data = JSON.stringify(this.logs, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `video-debug-logs-${new Date().getTime()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }
}

// Auto-initialize when script is loaded
console.log('🔧 Initializing Frontend Video Debugger...')
window.videoDebugger = new FrontendVideoDebugger()
window.videoDebugger.createDebugPanel()
window.videoDebugger.monitorVideoGeneration()

console.log(`
🎉 Video Debugger Ready!

Available commands:
- videoDebugger.checkFormData()    // Check form inputs
- videoDebugger.checkAuth()        // Check authentication
- videoDebugger.testAPIs()         // Test API endpoints
- videoDebugger.showLogs()         // Show all logs in table
- videoDebugger.exportLogs()       // Export logs as JSON
- videoDebugger.clearLogs()        // Clear all logs

The debugger will automatically monitor:
✅ API calls to video generation endpoints
✅ Form submissions
✅ Video elements added to page
✅ Authentication status

Look for the debug panel in the bottom-left corner!
`)

// Export for use
window.videoDebugger