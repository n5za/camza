#!/usr/bin/env bash
#
# Camza — Uninstaller
# Removes the launcher, desktop entry and optional source tree.
#
set -e

INSTALL_DIR="${CAMZA_DIR:-$HOME/camza}"
SUDO=""
[ "$(id -u)" -ne 0 ] && command -v sudo >/dev/null 2>&1 && SUDO="sudo"

info() { echo -e "\033[0;34m[Camza]\033[0m $1"; }
ok()   { echo -e "\033[0;32m[Camza]\033[0m $1"; }

# launcher
if [ -f /usr/local/bin/camza ]; then
  $SUDO rm -f /usr/local/bin/camza && ok "Removed /usr/local/bin/camza"
fi

# desktop entry
rm -f "$HOME/.local/share/applications/camza.desktop" 2>/dev/null && ok "Removed desktop entry"

# source tree (unless --keep-source)
if [ "$1" != "--keep-source" ] && [ -d "$INSTALL_DIR" ]; then
  info "Removing source tree $INSTALL_DIR (use --keep-source to keep it)..."
  $SUDO rm -rf "$INSTALL_DIR"
fi

ok "Camza has been uninstalled. System packages (nodejs/npm/v4l-utils/ffmpeg) were left untouched."