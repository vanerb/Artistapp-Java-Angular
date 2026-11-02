/**
 * Archivos de la demo: las imágenes se reducen y se guardan como data URL en localStorage,
 * y las portadas de productos reciben la misma marca de agua ARTISTAPP que genera la API.
 */
const MAX_SIZE = 900;
const MAX_DIGITAL_BYTES = 1024 * 1024;

export async function imageDataUrl(file: File, watermark = false): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_SIZE / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const g = canvas.getContext('2d')!;
  g.fillStyle = '#fff';
  g.fillRect(0, 0, width, height);
  g.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();
  if (watermark) drawWatermark(g, width, height);
  return canvas.toDataURL('image/jpeg', 0.78);
}

function drawWatermark(g: CanvasRenderingContext2D, width: number, height: number): void {
  const text = 'ARTISTAPP';
  g.font = `bold ${Math.max(14, Math.round(Math.min(width, height) * 0.035))}px sans-serif`;
  const spacingX = Math.max(115, Math.floor(width * 0.45));
  const spacingY = Math.max(65, Math.floor(height * 0.22));
  const stamp = (x: number, y: number, shadow: number, alpha: number) => {
    g.fillStyle = `rgba(0,0,0,${shadow})`;
    g.fillText(text, x + 1, y + 1);
    g.fillStyle = `rgba(255,255,255,${alpha})`;
    g.fillText(text, x, y);
  };
  for (let y = -height; y < height * 2; y += spacingY) {
    for (let x = -width; x < width * 2; x += spacingX) stamp(x + Math.floor(y * 0.35), y, 0.25, 0.39);
  }
  stamp(Math.max(0, (width - g.measureText(text).width) / 2), height / 2, 0.3, 0.6);
}

/** Guarda el archivo digital si es pequeño; si no, la descarga será un archivo de ejemplo. */
export async function digitalFile(file: File): Promise<{ name: string; type: string; data: string | null }> {
  if (file.size > MAX_DIGITAL_BYTES) return { name: file.name, type: file.type, data: null };
  const data = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
  return { name: file.name, type: file.type, data };
}

export async function downloadBlob(stored: { name: string; type: string; data: string | null } | string): Promise<Blob> {
  if (typeof stored === 'object' && stored.data) return (await fetch(stored.data)).blob();
  const name = typeof stored === 'object' ? stored.name : 'archivo';
  return new Blob([`Archivo digital de demostración: ${name}\n\nEn la demo de GitHub Pages no se conservan archivos grandes.`], { type: 'text/plain' });
}
