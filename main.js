// main.js

// Modules to control application life and create native browser window
const { app, BrowserWindow, screen, ipcMain } = require("electron");
const path = require("path");

const createWindow = () => {
  const titleBarStyle =
    process.platform === "darwin" ? "hiddenInset" : "hidden";

  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    x: screen.getPrimaryDisplay().bounds.width - 160, // 将窗口定位在屏幕的右边
    y: 100,
    resizable: false,
    maximizable: false,
    minimizablen: false,
    frame: false,
    autoHideMenuBar: true,
    transparent: true,
    alwaysOnTop: true,
    titleBarStyle: titleBarStyle,
    webPreferences: { preload: path.join(__dirname, "preload.js") },
  });

  // and load the index.html of the app.
  mainWindow.loadFile("index.html");

  // 隐藏窗口的标题栏和关闭按钮
  if (process.platform === "darwin") {
    mainWindow.setWindowButtonVisibility(false);
  }

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
ipcMain.on("drop-file", (event, filePath) => {
  console.log(`读取文件 ${filePath}`);
  setTimeout(() => {
    event.sender.send("drop-file-message", `文件 ${filePath} 已读取`);
  }, 1000);
});
