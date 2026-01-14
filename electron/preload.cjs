const { contextBridge } = require("electron");

contextBridge.exposeInMainWorld("electron", {
  versions: process.versions,
});
