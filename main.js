import { app, BrowserWindow, ipcMain, screen } from "electron";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow;

// Get location name through Electron main process
ipcMain.handle("get-location-name", async (event, { latitude, longitude }) => {
  const url =
    `https://nominatim.openstreetmap.org/reverse` +
    `?lat=${latitude}` +
    `&lon=${longitude}` +
    `&format=json`;

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Weather Desktop Widget",
        "Accept": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Location request failed: ${response.status}`);
    }

    const data = await response.json();


    const address = data.address || {};

const locationName =
  address.city ||
  address.town ||
  address.village ||
  address.suburb ||
  address.city_district ||
  address.municipality ||
  address.county ||
  address.state_district ||
  "Unknown location";

return {
  name: locationName,
  state: address.state || "",
  country: address.country || "",
};

  } catch (error) {
    console.error("Location request error:", error);

    throw error;
  }
});

function createWindow() {
  const display = screen.getPrimaryDisplay();
  const { width, height } = display.workAreaSize;

  mainWindow = new BrowserWindow({
    width: 80,
    height: 80,

    x: width - 110,
    y: height - 110,

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

  mainWindow.loadURL("http://localhost:5173");

  mainWindow.show();

  mainWindow.on("blur", () => {
    const display = screen.getPrimaryDisplay();
    const { width, height } = display.workAreaSize;

    const iconSize = 80;

    const x = width - iconSize - 30;
    const y = height - iconSize - 30;

    mainWindow.setBounds({
      x,
      y,
      width: iconSize,
      height: iconSize,
    });

    mainWindow.webContents.send("weather-closed");
  });
}

app.whenReady().then(() => {
  createWindow();

  ipcMain.on("open-weather", () => {
    const display = screen.getPrimaryDisplay();
    const { width, height } = display.workAreaSize;

    const widgetWidth = 400;
    const widgetHeight = 500;

    const x = width - widgetWidth - 30;
    const y = height - widgetHeight - 30;

    mainWindow.setBounds({
      x,
      y,
      width: widgetWidth,
      height: widgetHeight,
    });
  });

  ipcMain.on("close-weather", () => {
    const display = screen.getPrimaryDisplay();
    const { width, height } = display.workAreaSize;

    const iconSize = 80;

    const x = width - iconSize - 30;
    const y = height - iconSize - 30;

    mainWindow.setBounds({
      x,
      y,
      width: iconSize,
      height: iconSize,
    });
  });
});