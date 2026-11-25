
import { app, BrowserWindow, ipcMain, screen } from "electron";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow;


function setWidgetBounds(isOpen) {
  const { x: areaX, y: areaY, width, height } =
    screen.getPrimaryDisplay().workArea;

  // Original icon position (bottom-right)
  const iconX = areaX + width - 80 - 30;
  const iconY = areaY + height - 80 - 30;

  if (isOpen) {
    mainWindow.setBounds({
      x: iconX - 320,
      y: iconY - 420,
      width: 400,
      height: 500,
    });
  } else {
    mainWindow.setBounds({
      x: iconX,
      y: iconY,
      width: 80,
      height: 80,
    });
  }
}


function createWindow() {
  mainWindow = new BrowserWindow({
    width: 80,
    height: 80,

    frame: false,
    transparent: true,
    resizable: false,
    alwaysOnTop: true,

    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  setWidgetBounds(false);

  mainWindow.loadURL("http://localhost:5173");

  mainWindow.on("blur", () => {
    if (!mainWindow || mainWindow.isDestroyed()) return;

    setWidgetBounds(false);
    mainWindow.webContents.send("weather-closed");
  });
}

app.whenReady().then(() => {
  createWindow();

  ipcMain.on("open-weather", () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      setWidgetBounds(true);
    }
  });

  ipcMain.on("close-weather", () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      setWidgetBounds(false);
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
