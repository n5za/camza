#!/usr/bin/env bash
#
# Camza — Universal Linux Installer
# Works on any distro with: apt / dnf / pacman / zypper / apk
#
# Usage (one-liner, works everywhere):
#   curl -fsSL https://raw.githubusercontent.com/n5za/camza/main/install.sh | bash
#
set -e

REPO_URL="https://github.com/n5za/camza.git"
BRANCH="main"
INSTALL_DIR="${CAMZA_DIR:-$HOME/camza}"

# ---- colors ----
GREEN='\033[0;32m'; YELLOW='\033[1;33m'; BLUE='\033[0;34m'; RED='\033[0;31m'; NC='\033[0m'

info()  { echo -e "${BLUE}[Camza]${NC} $1"; }
ok()    { echo -e "${GREEN}[Camza]${NC} $1"; }
warn()  { echo -e "${YELLOW}[Camza]${NC} $1"; }
die()   { echo -e "${RED}[Camza]${NC} $1"; exit 1; }

# ---- root/sudo helper ----
SUDO=""
if [ "$(id -u)" -ne 0 ]; then
  if command -v sudo >/dev/null 2>&1; then
    SUDO="sudo"
  else
    die "Please run as root or install 'sudo' first."
  fi
fi

# ---- detect package manager ----
detect_pm() {
  if   command -v apt-get >/dev/null 2>&1; then echo "apt"
  elif command -v dnf     >/dev/null 2>&1; then echo "dnf"
  elif command -v pacman  >/dev/null 2>&1; then echo "pacman"
  elif command -v zypper  >/dev/null 2>&1; then echo "zypper"
  elif command -v apk     >/dev/null 2>&1; then echo "apk"
  else echo "unknown"; fi
}
PM="$(detect_pm)"
[ "$PM" = "unknown" ] && die "Could not detect your package manager (apt/dnf/pacman/zypper/apk)."

# ---- 1. install system dependencies ----
install_system_deps() {
  info "Detected package manager: $PM"
  case "$PM" in
    apt)
      $SUDO apt-get update
      $SUDO apt-get install -y nodejs npm v4l-utils ffmpeg
      ;;
    dnf)
      $SUDO dnf install -y nodejs npm v4l-utils ffmpeg
      ;;
    pacman)
      $SUDO pacman -Sy --noconfirm nodejs npm v4l-utils ffmpeg
      ;;
    zypper)
      $SUDO zypper --non-interactive install nodejs npm v4l-utils ffmpeg
      ;;
    apk)
      $SUDO apk add --no-cache nodejs npm v4l-utils ffmpeg
      ;;
  esac
  ok "System dependencies installed."
}

# ---- 2. get the source ----
get_source() {
  # running from inside the repo? use current dir
  if [ -f "$PWD/package.json" ] && grep -q '"camza"' "$PWD/package.json" 2>/dev/null; then
    INSTALL_DIR="$PWD"
    info "Using current directory: $INSTALL_DIR"
  elif [ -d "$INSTALL_DIR/.git" ]; then
    info "Updating existing install at $INSTALL_DIR"
    git -C "$INSTALL_DIR" pull --ff-only origin "$BRANCH" || warn "Pull failed, continuing with existing copy."
  else
    info "Cloning Camza into $INSTALL_DIR ..."
    git clone --depth 1 --branch "$BRANCH" "$REPO_URL" "$INSTALL_DIR"
  fi
}

# ---- 3. install npm deps + build ----
build_app() {
  cd "$INSTALL_DIR"
  if [ ! -d node_modules ]; then
    info "Installing npm dependencies..."
    npm install --no-fund --no-audit
  fi
  info "Building the app..."
  if [ ! -d dist ]; then
    npm run build
  else
    warn "dist/ already exists, skipping build (remove dist/ to rebuild)."
  fi
  ok "App built successfully."
}

# ---- 4. create launcher ----
create_launcher() {
  local BIN_DIR="/usr/local/bin"
  if [ ! -w "$BIN_DIR" ]; then
    $SUDO mkdir -p "$BIN_DIR"
  fi
  local LAUNCHER="$BIN_DIR/camza"
  cat > /tmp/camza-launcher <<EOF
#!/usr/bin/env bash
cd "$INSTALL_DIR"
if [ ! -d node_modules ]; then
  echo "[Camza] Installing dependencies..."; npm install --no-fund --no-audit
fi
if [ ! -d dist ]; then
  echo "[Camza] Building..."; npm run build
fi
exec npx electron .
EOF
  if [ -w "$BIN_DIR" ]; then
    cp /tmp/camza-launcher "$LAUNCHER"
  else
    $SUDO cp /tmp/camza-launcher "$LAUNCHER"
  fi
  chmod +x "$LAUNCHER" 2>/dev/null || $SUDO chmod +x "$LAUNCHER"
  rm -f /tmp/camza-launcher
  ok "Created launcher: $LAUNCHER"
}

# ---- 5. desktop entry ----
create_desktop_entry() {
  local APPS_DIR="$HOME/.local/share/applications"
  mkdir -p "$APPS_DIR"
  cat > "$APPS_DIR/camza.desktop" <<EOF
[Desktop Entry]
Name=Camza
Comment=Premium Linux Camera App
Exec=/usr/local/bin/camza
Icon=$INSTALL_DIR/logo.png
Terminal=false
Type=Application
Categories=Graphics;AudioVideo;
EOF
  ok "Created desktop entry."
}

main() {
  info "Installing Camza — Premium Linux Camera App"
  install_system_deps
  get_source
  build_app
  create_launcher
  create_desktop_entry
  echo
  ok "Installation complete! 🎉"
  echo
  echo "  Run the app with:      camza"
  echo "  Dev mode:              cd $INSTALL_DIR && npm run dev  (then: npm run electron:start)"
  echo "  Uninstall:             curl -fsSL https://raw.githubusercontent.com/n5za/camza/main/uninstall.sh | bash"
  echo
}

main "$@"