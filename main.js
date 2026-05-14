const { app, BrowserWindow, session } = require('electron');
const path = require('path');

// Bắt buộc: Cho phép truy cập Camera trên bản build
app.commandLine.appendSwitch('enable-features', 'WebRTCPipeWireCapturer');
app.commandLine.appendSwitch('use-fake-ui-for-media-stream');

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 768,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false
    },
    autoHideMenuBar: true,
    title: "Quiz Game - Nhận diện nghiêng đầu"
  });

  // Cấp mọi quyền một cách tự động (bao gồm Camera/Microphone)
  session.defaultSession.setPermissionRequestHandler((webContents, permission, callback) => {
    callback(true);
  });
  session.defaultSession.setPermissionCheckHandler((webContents, permission) => {
    return true;
  });

  mainWindow.loadFile('index.html');

  // Tự động mở công cụ gỡ lỗi (DevTools) để xem lỗi Camera
  // mainWindow.webContents.openDevTools();
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});
