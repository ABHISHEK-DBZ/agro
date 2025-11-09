/**
 * Electron Preload Script
 * Secure bridge between renderer and main process
 * Smart Krishi Sahayak Desktop App
 */

const { contextBridge, ipcRenderer } = require('electron');

/**
 * Expose protected methods that allow the renderer process to use
 * the ipcRenderer without exposing the entire object
 */
contextBridge.exposeInMainWorld('electron', {
  /**
   * App Information
   */
  app: {
    getVersion: () => ipcRenderer.invoke('get-app-version'),
    getPlatform: () => ipcRenderer.invoke('get-platform'),
    getAppPath: (name) => ipcRenderer.invoke('get-app-path', name),
    checkForUpdates: () => ipcRenderer.invoke('check-for-updates')
  },

  /**
   * Dialog Operations
   */
  dialog: {
    showMessage: (options) => ipcRenderer.invoke('show-dialog', options),
    showError: (title, content) => ipcRenderer.invoke('show-dialog', {
      type: 'error',
      title,
      message: content,
      buttons: ['OK']
    }),
    showInfo: (title, content) => ipcRenderer.invoke('show-dialog', {
      type: 'info',
      title,
      message: content,
      buttons: ['OK']
    }),
    showWarning: (title, content) => ipcRenderer.invoke('show-dialog', {
      type: 'warning',
      title,
      message: content,
      buttons: ['OK']
    }),
    confirm: (title, content) => ipcRenderer.invoke('show-dialog', {
      type: 'question',
      title,
      message: content,
      buttons: ['Yes', 'No']
    })
  },

  /**
   * Shell Operations
   */
  shell: {
    openExternal: (url) => ipcRenderer.invoke('open-external', url)
  },

  /**
   * File System Operations
   */
  fs: {
    readFile: (filePath) => ipcRenderer.invoke('read-file', filePath),
    writeFile: (filePath, data) => ipcRenderer.invoke('write-file', filePath, data)
  },

  /**
   * Platform Detection
   */
  platform: {
    isWindows: process.platform === 'win32',
    isMac: process.platform === 'darwin',
    isLinux: process.platform === 'linux',
    name: process.platform
  },

  /**
   * Check if running in Electron
   */
  isElectron: true
});

// Log preload script loaded
console.log('🔒 Electron preload script loaded - Secure IPC bridge ready');
