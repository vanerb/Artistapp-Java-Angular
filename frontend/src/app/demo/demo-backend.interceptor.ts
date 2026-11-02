import { HttpErrorResponse, HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DemoApi } from './demo-api';
import { ApiFail, DemoStore, Row } from './demo-store';

let api: DemoApi | null = null;
const demoApi = () => (api ??= new DemoApi(new DemoStore()));

/** Vuelve a los datos de muestra originales (borra lo guardado en este navegador). */
export function resetDemoData(): void {
  demoApi().reset();
}

/**
 * Sustituye al servidor en la demo estática: las peticiones a /api se resuelven en el navegador
 * con DemoApi; cualquier otra URL sigue su camino normal.
 */
export const demoBackendInterceptor: HttpInterceptorFn = (request, next) => {
  const match = /^(?:https?:\/\/[^/]+)?\/api(\/[^?#]*)/.exec(request.url);
  if (!match) return next(request);

  return new Observable(subscriber => {
    let cancelled = false;
    const run = async () => {
      const body: Row = {};
      const files: Record<string, File> = {};
      let method = request.method;
      if (request.body instanceof FormData) {
        request.body.forEach((value, key) => {
          if (value instanceof File) { if (value.size > 0 || value.name) files[key] = value; }
          else body[key] = value;
        });
        // Igual que en la API: los formularios con archivos envían PATCH como POST + _method.
        if (method === 'POST' && typeof body['_method'] === 'string') method = String(body['_method']).toUpperCase();
        delete body['_method'];
      } else if (request.body && typeof request.body === 'object') {
        Object.assign(body, request.body);
      }
      const query: Record<string, string> = {};
      for (const key of request.params.keys()) query[key] = request.params.get(key) ?? '';
      const header = request.headers.get('Authorization');
      const token = header?.startsWith('Bearer ') ? header.slice(7) : null;
      // Latencia breve para que la interfaz muestre sus estados de carga como con un servidor real.
      await new Promise(resolve => setTimeout(resolve, 120));
      try {
        const result = await demoApi().handle({ method, path: match[1].replace(/\/+$/, '') || '/', query, body, files, token });
        if (!cancelled) {
          subscriber.next(new HttpResponse({ status: result.status, body: result.body, url: request.url }));
          subscriber.complete();
        }
      } catch (error) {
        if (cancelled) return;
        if (error instanceof ApiFail) {
          subscriber.error(new HttpErrorResponse({ status: error.status, error: error.body, url: request.url, statusText: 'Error' }));
        } else {
          console.error('[demo]', error);
          subscriber.error(new HttpErrorResponse({ status: 500, error: { message: 'Error del servidor.' }, url: request.url, statusText: 'Error' }));
        }
      }
    };
    void run();
    return () => { cancelled = true; };
  });
};
