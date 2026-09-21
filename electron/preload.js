import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('camzaAPI', {
  getV4L2Devices: () => ipcRenderer.invoke('v4l2:getDevices'),
  getV4L2Capabilities: (devPath) => ipcRenderer.invoke('v4l2:getCapabilities', devPath),
  getV4L2HardwareControls: (devPath) => ipcRenderer.invoke('v4l2:getHardwareControls', devPath),
  setV4L2HardwareControl: (data) => ipcRenderer.invoke('v4l2:setHardwareControl', data),
  getPaths: () => ipcRenderer.invoke('fs:getPaths'),
  savePhoto: (data) => ipcRenderer.invoke('fs:savePhoto', data),
  saveVideo: (data) => ipcRenderer.invoke('fs:saveVideo', data),
  listGallery: (paths) => ipcRenderer.invoke('fs:listGallery', paths),
  deleteFile: (filePath) => ipcRenderer.invoke('fs:deleteFile', filePath),
  openFile: (filePath) => ipcRenderer.invoke('shell:openFile', filePath),
  openFolder: (filePath) => ipcRenderer.invoke('shell:openFolder', filePath),
  selectDirectory: () => ipcRenderer.invoke('dialog:selectDirectory')
});
