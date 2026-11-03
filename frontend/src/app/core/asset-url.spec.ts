import { assetUrl } from './asset-url';

describe('assetUrl', () => {
  it('usa la imagen por defecto cuando no hay ruta', () => {
    expect(assetUrl(undefined)).toBe('media/no-user.png');
    expect(assetUrl('', 'media/no-item.png')).toBe('media/no-item.png');
  });

  it('respeta las URL completas y las imágenes de la demo', () => {
    expect(assetUrl('https://example.test/a.png')).toBe('https://example.test/a.png');
    expect(assetUrl('data:image/jpeg;base64,AAAA')).toBe('data:image/jpeg;base64,AAAA');
  });

  it('genera rutas relativas para que la app funcione bajo una subruta', () => {
    expect(assetUrl('/publicaciones/a.jpg')).toBe('publicaciones/a.jpg');
    expect(assetUrl('uploads/productos/a b.jpg')).toBe('api/assets/uploads/productos/a%20b.jpg');
    expect(assetUrl('img/a.jpg')).toBe('imglowres/lowa.jpg');
  });
});
