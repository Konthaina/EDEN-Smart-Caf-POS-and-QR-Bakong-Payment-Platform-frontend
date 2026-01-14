const { app, BrowserWindow } = require('electron/main')
const path = require('node:path')

// Check if we're in development mode
const isDev = process.env.NODE_ENV === 'development' || process.argv.includes('--dev')
const VITE_DEV_SERVER_URL = 'http://localhost:5173'

function createWindow() {
    const win = new BrowserWindow({
        width: 1200,
        height: 800,
        minWidth: 800,
        minHeight: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.cjs'),
            nodeIntegration: false,
            contextIsolation: true
        },
        title: 'EDEN Smart Café POS'
    })

    // Load the app
    if (isDev) {
        // Development mode - load from Vite dev server
        win.loadURL(VITE_DEV_SERVER_URL)
        // Open DevTools in development
        win.webContents.openDevTools()
    } else {
        // Production mode - load from built files
        win.loadFile(path.join(__dirname, 'dist', 'index.html'))
    }

    // Handle loading errors
    win.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
        console.error('Failed to load:', errorDescription)
        if (isDev) {
            console.log('Make sure Vite dev server is running on', VITE_DEV_SERVER_URL)
        }
    })
}

app.whenReady().then(() => {
    createWindow()

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow()
        }
    })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})