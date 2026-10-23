export function assetUrl(path?: string, fallback = 'media/no-user.png'): string {
  if (!path) return `/${fallback}`;
  if (/^https?:\/\//i.test(path)) return path;
  const normalized = path.replace(/^\//, '');
  if (normalized.startsWith('uploads/')) return `/api/assets/${normalized.split('/').map(encodeURIComponent).join('/')}`;
  // El catálogo legado guardaba la imagen completa en img/ y mostraba su preview lowres.
  if (normalized.startsWith('img/')) return `/imglowres/low${normalized.slice(4)}`;
  return `/${normalized}`;
}
