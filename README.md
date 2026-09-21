# Camza — Premium Linux Camera App 📸

Camza is a feature-rich, high-performance desktop camera application for Linux, built with Electron, React, Vite, and WebGL. It provides a stunning glassmorphism interface and powerful real-time hardware/software enhancements designed to make even low-quality 10MB webcams look like high-end 50MB professional cameras! ✨

![Camza Logo](./logo.png)

## ⚡ One-Line Install (Works on Any Distro)

Automatically detects your package manager (`apt` / `dnf` / `pacman` / `zypper` / `apk`), installs all system dependencies, downloads Camza, builds it, and creates a `camza` launcher + desktop entry:

```bash
curl -fsSL https://raw.githubusercontent.com/n5za/camza/main/install.sh | bash
```

That's it — then run the app from anywhere with:

```bash
camza
```

To uninstall:

```bash
curl -fsSL https://raw.githubusercontent.com/n5za/camza/main/uninstall.sh | bash
```

### What gets installed per distro

| Package manager | Distros            | Dependencies installed (`nodejs npm v4l-utils ffmpeg`) |
|-----------------|--------------------|--------------------------------------------------------|
| `apt`           | Debian, Ubuntu, Kali, Mint… | `apt-get install`                              |
| `dnf`           | Fedora, RHEL, Rocky, Alma…  | `dnf install`                                  |
| `pacman`        | Arch, Manjaro, EndeavourOS… | `pacman -Sy`                                   |
| `zypper`        | openSUSE                    | `zypper install`                               |
| `apk`           | Alpine                     | `apk add`                                      |

## 🛠️ Manual Installation

### Prerequisites
- `Node.js` (v18+)
- `npm`
- `v4l2-ctl` (Linux Video4Linux2 utility for hardware control)
- `ffmpeg` (Optional, for advanced video operations)

### Steps
1. **Clone the repo:**
   ```bash
   git clone https://github.com/n5za/camza.git && cd camza
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Run in Development Mode:**
   ```bash
   npm run dev
   ```
   *(This starts the Vite React server on port 5173)*
4. **Launch the Desktop App:**
   ```bash
   npm run electron:start
   ```
5. **Build for Production:**
   ```bash
   npm run build
   ```

## Features 🚀
- **Pro HD Magic Enhancer**: Instantly applies a sharpness kernel, contrast bump, and virtual studio ring light to make your camera crisp and professional.
- **Anti-Blowout Shield**: Directly adjusts your Linux V4L2 hardware sensor exposure and gain to instantly fix blown-out white backgrounds.
- **Live Video Filters**: Real-time WebGL/Canvas2D shaders including Cyberpunk, Vintage, Grayscale, Thermal, Matrix, and more.
- **Burst Mode**: Rapid-fire capture 5 photos in quick succession with a single click.
- **Smart Auto-Saving**: Automatically detects and saves your photos and videos directly into `~/Pictures/Camza` and `~/Videos/Camza`.
- **Premium Dark Glass UI**: Modern aesthetic with floating controls, micro-animations, and live filter previews.
- **Full Hardware Control**: Change manual sliders for brightness, contrast, saturation, and native V4L2 sensor controls.

## Keyboard Shortcuts ⌨️
- `Space`: Take a Photo / Burst Capture
- `R`: Start / Stop Video Recording
- `M`: Toggle Horizontal Mirror
- `F`: Enter / Exit Fullscreen Mode
- `S`: Open Settings
- `G`: Open Gallery
- `B`: Toggle Burst Mode (Photo mode only)
- `Escape`: Close any open side panels or modals

## Tech Stack 🧩
- **Frontend**: React 18, Vite, Lucide Icons, pure Vanilla CSS with CSS variables.
- **Backend/Desktop**: Electron (Node.js).
- **Processing**: HTML5 Canvas, requestAnimationFrame for live shader manipulation.
- **System**: Child processes to execute `v4l2-ctl` for deep Linux camera hardware access.

## License 📄
MIT License