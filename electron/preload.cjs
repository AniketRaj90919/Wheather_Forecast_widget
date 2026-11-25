const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  openWeather: () => ipcRenderer.send("open-weather"),

  closeWeather: () => ipcRenderer.send("close-weather"),

  onWeatherClosed: (callback) => {
    ipcRenderer.on("weather-closed", callback);
  },
});