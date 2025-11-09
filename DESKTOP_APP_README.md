# 🖥️ Smart Krishi Sahayak - Desktop App

A native desktop application for Smart Krishi Sahayak built with Electron.

## 📋 Features

- **Native Desktop Experience**: Run Smart Krishi Sahayak as a standalone desktop application
- **Cross-Platform**: Available for Windows, macOS, and Linux
- **Offline Support**: Works offline with cached data
- **System Integration**: Menu bar, keyboard shortcuts, notifications
- **Auto Updates**: Check for updates automatically (coming soon)
- **Secure**: Sandboxed renderer process with contextBridge

## 🚀 Quick Start

### Development Mode

Run the app in development mode with hot reload:

```bash
npm run electron:dev
```

This will:
1. Start Vite dev server on port 5173
2. Wait for the server to be ready
3. Launch Electron with hot reload

Or use the shortcut:

```bash
npm run desktop:dev
```

### Production Build

Build the desktop app for your current platform:

```bash
npm run electron:build
```

Or use the shortcut:

```bash
npm run desktop:build
```

### Platform-Specific Builds

Build for specific platforms:

```bash
# Windows (creates .exe installer and portable .exe)
npm run electron:build:win

# macOS (creates .dmg and .zip)
npm run electron:build:mac

# Linux (creates .AppImage, .deb, and .rpm)
npm run electron:build:linux

# All platforms (requires macOS to build for all)
npm run electron:build:all
```

## 📦 Output

Built installers will be in the `release/` directory:

### Windows
- `Smart Krishi Sahayak Setup x.x.x.exe` - NSIS installer
- `Smart Krishi Sahayak x.x.x.exe` - Portable executable

### macOS
- `Smart Krishi Sahayak-x.x.x.dmg` - DMG installer
- `Smart Krishi Sahayak-x.x.x-mac.zip` - ZIP archive

### Linux
- `Smart Krishi Sahayak-x.x.x.AppImage` - Portable AppImage
- `smart-krishi-sahayak_x.x.x_amd64.deb` - Debian package
- `smart-krishi-sahayak-x.x.x.x86_64.rpm` - RPM package

## 🏗️ Architecture

### Main Process (`electron/main.js`)
- Window management
- Application lifecycle
- IPC communication handlers
- Menu bar creation
- Security policies

### Preload Script (`electron/preload.js`)
- Secure bridge between main and renderer
- Exposes limited APIs via contextBridge
- No direct Node.js access from renderer

### Renderer Process
- Your React application
- Communicates with main via `window.electron` API

## 🔐 Security

The desktop app implements Electron security best practices:

- ✅ Context Isolation enabled
- ✅ Node Integration disabled
- ✅ Remote Module disabled
- ✅ Web Security enabled
- ✅ Preload script with contextBridge
- ✅ Content Security Policy (in HTML)
- ✅ External links open in default browser

## 🎨 Customization

### Application Icon

Replace `public/logo.png` with your custom icon (at least 512x512 px).

For best results, provide platform-specific icons:
- **Windows**: `icon.ico` (256x256)
- **macOS**: `icon.icns` (1024x1024)
- **Linux**: `icon.png` (512x512)

### Window Settings

Edit `electron/main.js` to customize:
- Window size and position
- Background color
- Menu bar items
- Keyboard shortcuts

### Build Configuration

Edit the `build` section in `package.json` to customize:
- App ID and name
- File associations
- Installer options
- Code signing (for distribution)

## 📱 Available IPC APIs

The app exposes these APIs to the renderer via `window.electron`:

### App Information
```javascript
window.electron.app.getVersion()
window.electron.app.getPlatform()
window.electron.app.getAppPath('userData')
window.electron.app.checkForUpdates()
```

### Dialogs
```javascript
window.electron.dialog.showError('Error', 'Something went wrong')
window.electron.dialog.showInfo('Info', 'Operation successful')
window.electron.dialog.confirm('Confirm', 'Are you sure?')
```

### Shell Operations
```javascript
window.electron.shell.openExternal('https://example.com')
```

### File System
```javascript
await window.electron.fs.readFile('/path/to/file.txt')
await window.electron.fs.writeFile('/path/to/file.txt', 'data')
```

### Platform Detection
```javascript
window.electron.platform.isWindows
window.electron.platform.isMac
window.electron.platform.isLinux
window.electron.isElectron // true
```

## 🔧 Development

### Project Structure

```
electron/
  ├── main.js          # Main process
  └── preload.js       # Preload script
release/               # Built installers (gitignored)
dist/                  # Vite build output
public/                # Static assets
  └── logo.png         # App icon
```

### Adding New IPC Handlers

1. Add handler in `electron/main.js`:
```javascript
ipcMain.handle('my-handler', async (event, arg) => {
  return { result: 'success' };
});
```

2. Expose in `electron/preload.js`:
```javascript
contextBridge.exposeInMainWorld('electron', {
  myAPI: {
    myMethod: (arg) => ipcRenderer.invoke('my-handler', arg)
  }
});
```

3. Use in React:
```javascript
const result = await window.electron.myAPI.myMethod('test');
```

## 🐛 Debugging

### DevTools

Press `Ctrl+Shift+I` (Windows/Linux) or `Cmd+Option+I` (macOS) to open DevTools.

Or add to menu:
```javascript
{ label: 'DevTools', accelerator: 'F12', role: 'toggleDevTools' }
```

### Main Process Logs

Main process logs appear in the terminal where you ran `npm run electron:dev`.

### Electron Reloader

In development, changes to `electron/` files will automatically reload the app.

## 📊 Performance

### Bundle Size Optimization

The app uses the same optimized Vite build as the web version:
- Code splitting
- Tree shaking
- Minification
- Lazy loading

### Memory Usage

Electron apps use more memory than web apps due to:
- Node.js runtime
- Chromium browser engine
- Main process overhead

Typical memory usage: 150-300 MB

## 🚢 Distribution

### Code Signing (Optional)

For production distribution, code sign your app:

**Windows**: Set `WIN_CSC_LINK` and `WIN_CSC_KEY_PASSWORD`
**macOS**: Set `CSC_LINK` and `CSC_KEY_PASSWORD`

### Auto-Updates (Coming Soon)

Implement with `electron-updater`:

```bash
npm install electron-updater
```

Configure in `package.json`:
```json
"publish": {
  "provider": "github",
  "owner": "ABHISHEK-DBZ",
  "repo": "agro"
}
```

## 📝 Scripts Reference

| Command | Description |
|---------|-------------|
| `npm run electron` | Run built app |
| `npm run electron:dev` | Development mode with hot reload |
| `npm run electron:build` | Build for current platform |
| `npm run electron:build:win` | Build Windows installer |
| `npm run electron:build:mac` | Build macOS installer |
| `npm run electron:build:linux` | Build Linux packages |
| `npm run electron:build:all` | Build for all platforms |
| `npm run desktop:dev` | Shortcut for dev mode |
| `npm run desktop:build` | Shortcut for build |

## 🔗 Resources

- [Electron Documentation](https://www.electronjs.org/docs)
- [Electron Security](https://www.electronjs.org/docs/tutorial/security)
- [electron-builder](https://www.electron.build/)
- [IPC Communication](https://www.electronjs.org/docs/api/ipc-main)

## ⚠️ Known Issues

1. **macOS**: First run may show "unidentified developer" warning
   - Solution: Right-click → Open, or code sign the app

2. **Linux**: AppImage may not run on older distributions
   - Solution: Use .deb or .rpm packages

3. **Windows**: SmartScreen may warn about unknown publisher
   - Solution: Code sign with EV certificate

## 📄 License

MIT License - see [LICENSE](../LICENSE) file

## 👨‍💻 Author

**ABHISHEK-DBZ**
- GitHub: [@ABHISHEK-DBZ](https://github.com/ABHISHEK-DBZ)
- Project: [agro](https://github.com/ABHISHEK-DBZ/agro)

## 🙏 Support

If you find this helpful:
- ⭐ Star the repository
- 🐛 Report bugs
- 💡 Suggest features
- 🤝 Contribute code

---

**Built with ❤️ for farmers using Electron + React + TypeScript + Vite**
