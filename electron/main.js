import { app, BrowserWindow, ipcMain, shell, dialog, protocol, net } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import util from 'util';
import fs from 'fs';
import os from 'os';

const execPromise = util.promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow = null;

// Register privileged custom protocol for local media playback
protocol.registerSchemesAsPrivileged([
  { scheme: 'media', privileges: { secure: true, standard: true, supportFetchAPI: true, corsEnabled: true, stream: true } }
]);

// Smart Auto-Directory Resolver
const homeDir = os.homedir();

function resolveTargetDirectories() {
  const picturesBase = path.join(homeDir, 'Pictures');
  const videosBase = path.join(homeDir, 'Videos');

  let photoDir;
  if (fs.existsSync(picturesBase)) {
    photoDir = path.join(picturesBase, 'Camza');
  } else {
    photoDir = path.join(homeDir, 'Camza', 'Photos');
  }

  let videoDir;
  if (fs.existsSync(videosBase)) {
    videoDir = path.join(videosBase, 'Camza');
  } else {
    videoDir = path.join(homeDir, 'Camza', 'Videos');
  }

  return { photoDir, videoDir };
}

function ensureDirectoriesExist(customPhotoDir, customVideoDir) {
  try {
    const { photoDir: defaultPhoto, videoDir: defaultVideo } = resolveTargetDirectories();

    const validPhoto = (customPhotoDir && typeof customPhotoDir === 'string' && customPhotoDir.trim().length > 0)
      ? customPhotoDir
      : defaultPhoto;

    const validVideo = (customVideoDir && typeof customVideoDir === 'string' && customVideoDir.trim().length > 0)
      ? customVideoDir
      : defaultVideo;

    if (!fs.existsSync(validPhoto)) {
      fs.mkdirSync(validPhoto, { recursive: true });
    }
    if (!fs.existsSync(validVideo)) {
      fs.mkdirSync(validVideo, { recursive: true });
    }

    return { photoPath: validPhoto, videoPath: validVideo };
  } catch (err) {
    console.error('Error creating directory:', err);
    return { photoPath: homeDir, videoPath: homeDir };
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1240,
    height: 820,
    minWidth: 900,
    minHeight: 600,
    icon: path.join(__dirname, '../logo.png'),
    backgroundColor: '#0f1117',
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: '#0f1117',
      symbolColor: '#e2e8f0',
      height: 36
    },
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: false
    }
  });

  const distIndexPath = path.join(__dirname, '../dist/index.html');
  if (fs.existsSync(distIndexPath)) {
    mainWindow.loadFile(distIndexPath);
  } else {
    mainWindow.loadURL('http://localhost:5173');
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  // Handle media:// protocol for serving local images & videos safely
  protocol.handle('media', (request) => {
    try {
      const urlPath = decodeURIComponent(request.url.replace(/^media:\/\//, ''));
      const filePath = urlPath.startsWith('/') ? urlPath : `/${urlPath}`;
      return net.fetch(`file://${filePath}`);
    } catch (err) {
      console.error('media protocol error:', err);
      return new Response('File not found', { status: 404 });
    }
  });

  ensureDirectoriesExist();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// Helper to strip protocol prefixes for shell commands
function sanitizePath(inputPath) {
  if (!inputPath || typeof inputPath !== 'string') return '';
  let clean = inputPath.replace(/^media:\/\//, '').replace(/^file:\/\//, '');
  if (!clean.startsWith('/')) clean = `/${clean}`;
  return clean;
}

// Setup IPC Listeners
// 1. Detect V4L2 Cameras on Linux
ipcMain.handle('v4l2:getDevices', async () => {
  try {
    const { stdout } = await execPromise('v4l2-ctl --list-devices');
    const lines = stdout.split('\n');
    const devices = [];
    let currentDeviceName = '';

    for (let line of lines) {
      if (line.trim().endsWith(':')) {
        currentDeviceName = line.trim().slice(0, -1);
      } else if (line.trim().startsWith('/dev/video')) {
        const devPath = line.trim();
        devices.push({
          name: currentDeviceName || devPath,
          path: devPath
        });
      }
    }
    return { success: true, devices };
  } catch (err) {
    console.warn('v4l2-ctl failed or not available:', err.message);
    return { success: false, error: err.message, devices: [] };
  }
});

// 2. Detect Hardware Formats, Resolutions, and FPS via V4L2
ipcMain.handle('v4l2:getCapabilities', async (event, devicePath) => {
  if (!devicePath) return { success: false, capabilities: [] };
  try {
    const { stdout } = await execPromise(`v4l2-ctl --list-formats-ext -d ${devicePath}`);
    const sizeMatches = [...stdout.matchAll(/Size: Discrete (\d+)x(\d+)/g)];
    const intervalMatches = [...stdout.matchAll(/Interval: Discrete [\d.]+s \(([\d.]+) fps\)/g)];

    const resolutionsSet = new Set();
    const fpsSet = new Set();

    sizeMatches.forEach(m => {
      const w = parseInt(m[1], 10);
      const h = parseInt(m[2], 10);
      resolutionsSet.add(`${w}x${h}`);
    });

    intervalMatches.forEach(m => {
      const fps = Math.round(parseFloat(m[1]));
      fpsSet.add(fps);
    });

    const resolutions = Array.from(resolutionsSet);
    const fpsList = Array.from(fpsSet).sort((a, b) => a - b);

    return {
      success: true,
      resolutions,
      fpsList,
      maxResolution: resolutions[0] || '1280x720',
      maxFps: fpsList[fpsList.length - 1] || 30
    };
  } catch (err) {
    return { success: false, error: err.message, resolutions: [], fpsList: [] };
  }
});

// 3. Direct Linux Hardware Sensor Controls (V4L2 Master)
ipcMain.handle('v4l2:getHardwareControls', async (event, devicePath) => {
  if (!devicePath) return { success: false, controls: [] };
  try {
    const { stdout } = await execPromise(`v4l2-ctl -l -d ${devicePath}`);
    const lines = stdout.split('\n');
    const controls = [];

    for (let line of lines) {
      const match = line.match(/^\s*([a_z0-9_]+)\s+0x[0-9a-f]+\s+\(([a-z]+)\)\s*:(.*)$/i);
      if (match) {
        const key = match[1].trim();
        const type = match[2].trim();
        const rest = match[3].trim();

        const minMatch = rest.match(/min=(-?\d+)/);
        const maxMatch = rest.match(/max=(-?\d+)/);
        const valMatch = rest.match(/value=(-?\d+)/);

        if (valMatch) {
          controls.push({
            key,
            type,
            min: minMatch ? parseInt(minMatch[1], 10) : 0,
            max: maxMatch ? parseInt(maxMatch[1], 10) : 255,
            value: parseInt(valMatch[1], 10)
          });
        }
      }
    }
    return { success: true, controls };
  } catch (err) {
    return { success: false, error: err.message, controls: [] };
  }
});

ipcMain.handle('v4l2:setHardwareControl', async (event, { devicePath, control, value }) => {
  if (!devicePath || !control) return { success: false };
  try {
    await execPromise(`v4l2-ctl -c ${control}=${value} -d ${devicePath}`);
    return { success: true };
  } catch (err) {
    console.warn(`v4l2 set control failed (${control}=${value}):`, err.message);
    return { success: false, error: err.message };
  }
});

// 4. File Management & Shell Integration
ipcMain.handle('fs:getPaths', async () => {
  const { photoPath, videoPath } = ensureDirectoriesExist();
  return { photoDir: photoPath, videoDir: videoPath };
});

ipcMain.handle('fs:savePhoto', async (event, { base64Data, customDir, format = 'png' }) => {
  try {
    const { photoPath } = ensureDirectoriesExist(customDir);
    
    const timestamp = new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 15);
    const fileName = `camza_${timestamp}.${format}`;
    const filePath = path.join(photoPath, fileName);

    const base64Image = base64Data.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Image, 'base64');

    fs.writeFileSync(filePath, buffer);
    return { success: true, filePath, fileName };
  } catch (err) {
    console.error('savePhoto error:', err);
    return { success: false, error: err.message };
  }
});

ipcMain.handle('fs:saveVideo', async (event, { arrayBuffer, customDir, format = 'mp4' }) => {
  try {
    const { videoPath } = ensureDirectoriesExist(null, customDir);

    const timestamp = new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 15);
    const fileName = `camza_${timestamp}.${format}`;
    const filePath = path.join(videoPath, fileName);

    const buffer = Buffer.from(arrayBuffer);
    fs.writeFileSync(filePath, buffer);
    return { success: true, filePath, fileName };
  } catch (err) {
    console.error('saveVideo error:', err);
    return { success: false, error: err.message };
  }
});

ipcMain.handle('fs:listGallery', async (event, { photoDir, videoDir }) => {
  try {
    const { photoPath: pDir, videoPath: vDir } = ensureDirectoriesExist(photoDir, videoDir);

    const photos = fs.existsSync(pDir) ? fs.readdirSync(pDir) : [];
    const videos = fs.existsSync(vDir) ? fs.readdirSync(vDir) : [];

    const items = [];

    photos.forEach(f => {
      const lower = f.toLowerCase();
      if (lower.endsWith('.png') || lower.endsWith('.jpg') || lower.endsWith('.jpeg')) {
        const fullPath = path.join(pDir, f);
        const stat = fs.statSync(fullPath);
        items.push({
          id: f,
          name: f,
          path: fullPath,
          type: 'photo',
          size: stat.size,
          mtime: stat.mtimeMs
        });
      }
    });

    videos.forEach(f => {
      const lower = f.toLowerCase();
      if (lower.endsWith('.mp4') || lower.endsWith('.mkv') || lower.endsWith('.webm')) {
        const fullPath = path.join(vDir, f);
        const stat = fs.statSync(fullPath);
        items.push({
          id: f,
          name: f,
          path: fullPath,
          type: 'video',
          size: stat.size,
          mtime: stat.mtimeMs
        });
      }
    });

    items.sort((a, b) => b.mtime - a.mtime);
    return { success: true, items };
  } catch (err) {
    console.error('listGallery error:', err);
    return { success: false, error: err.message, items: [] };
  }
});

ipcMain.handle('fs:deleteFile', async (event, filePath) => {
  try {
    const targetPath = sanitizePath(filePath);
    if (fs.existsSync(targetPath)) {
      fs.unlinkSync(targetPath);
      return { success: true };
    }
    return { success: false, error: 'File not found' };
  } catch (err) {
    console.error('deleteFile error:', err);
    return { success: false, error: err.message };
  }
});

ipcMain.handle('shell:openFile', async (event, filePath) => {
  try {
    const targetPath = sanitizePath(filePath);
    await shell.openPath(targetPath);
    return { success: true };
  } catch (err) {
    console.error('openFile error:', err);
    return { success: false, error: err.message };
  }
});

ipcMain.handle('shell:openFolder', async (event, filePath) => {
  try {
    const targetPath = sanitizePath(filePath);
    if (fs.existsSync(targetPath)) {
      const stat = fs.statSync(targetPath);
      if (stat.isDirectory()) {
        await shell.openPath(targetPath);
      } else {
        shell.showItemInFolder(targetPath);
      }
    } else {
      const { photoPath } = ensureDirectoriesExist();
      await shell.openPath(photoPath);
    }
    return { success: true };
  } catch (err) {
    console.error('openFolder error:', err);
    return { success: false, error: err.message };
  }
});

ipcMain.handle('dialog:selectDirectory', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory']
  });
  if (!result.canceled && result.filePaths.length > 0) {
    return { success: true, path: result.filePaths[0] };
  }
  return { success: false };
});
