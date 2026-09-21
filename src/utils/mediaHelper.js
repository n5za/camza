/**
 * Converts local file path to Electron custom media:// protocol or base64/blob URL
 */
export function getMediaUrl(filePath) {
  if (!filePath) return '';
  if (filePath.startsWith('data:') || filePath.startsWith('blob:')) return filePath;
  if (filePath.startsWith('media://')) return filePath;
  if (filePath.startsWith('file://')) {
    return `media://${filePath.slice(7)}`;
  }
  return `media://${filePath}`;
}
