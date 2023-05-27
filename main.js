// main.js

// Modules to control application life and create native browser window
const { app, BrowserWindow, screen, ipcMain } = require("electron");
const config = require("./config");
const Upload = require("./upload");
const path = require("path");

const createWindow = () => {
  const titleBarStyle =
    process.platform === "darwin" ? "hiddenInset" : "hidden";

  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 100,
    height: 100,
    x: screen.getPrimaryDisplay().bounds.width - 160, // 将窗口定位在屏幕的右边
    y: 100,
    // width: 800,
    // Height:600,
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
  // mainWindow.webContents.openDevTools();
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
  const ext = path.extname(filePath);
  if (ext != ".pdf") {
    event.sender.send("drop-file-message", {
      code: 400,
      message: "不支持的文件类型",
    });
    return;
  }

  Upload(
    filePath,
    `${config.url}:${config.port}/api/doc/upload`,
    (status, message) => {
      console.log(status, message);

      if (status == "error") {
        code = message == 409 ? 409 : 500;
        event.sender.send("drop-file-message", {
          code: code,
          message: message,
        });
        return;
      }

      if (status == "success") {
        event.sender.send("drop-file-message", {
          code: 200,
          message: "处理完成",
        });
        return;
      }
    }
  );
});
