import { DemoStore, Row, fail } from './demo-store';

const STRONG_PASSWORD = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/;
const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const IMAGE_TYPES = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'];
export const PASSWORD_MESSAGE = 'La contraseña debe incluir minúsculas, mayúsculas y números.';

export interface RequestData {
  body: Row;
  files: Record<string, File>;
}

const filled = (input: RequestData, key: string) =>
  !!input.files[key] || (input.body[key] !== undefined && input.body[key] !== null && String(input.body[key]).trim() !== '');

const extension = (name: string) => (name.includes('.') ? name.slice(name.lastIndexOf('.') + 1).toLowerCase() : '');

/**
 * Validación con las mismas reglas que la API (sintaxis de Laravel: "sometimes|required|max:255").
 * Devuelve solo los campos validados o lanza un 422 con {message, errors}.
 */
export function validate(store: DemoStore, input: RequestData, rules: Record<string, string>): Row {
  const data: Row = {};
  const errors: Record<string, string[]> = {};
  for (const [field, spec] of Object.entries(rules)) {
    const error = check(store, input, field, spec.split('|'), data);
    if (error) errors[field] = [error];
  }
  const keys = Object.keys(errors);
  if (keys.length) {
    const more = keys.length - 1;
    fail(422, errors[keys[0]][0] + (more ? ` (y ${more} ${more === 1 ? 'error más' : 'errores más'})` : ''), errors);
  }
  return data;
}

function check(store: DemoStore, input: RequestData, field: string, rules: string[], data: Row): string | null {
  const arg = (name: string) => rules.find(rule => rule.startsWith(name + ':'))?.slice(name.length + 1);
  const has = (name: string) => rules.includes(name);
  const label = field.replace(/_/g, ' ');
  const present = field in input.body || field in input.files;
  if (has('sometimes') && !present) return null;
  const requiredWith = arg('required_with');
  if (!filled(input, field)) {
    if (has('required') || (requiredWith && filled(input, requiredWith))) return `El campo ${label} es obligatorio.`;
    if (present || has('nullable')) data[field] = null;
    return null;
  }
  const max = arg('max') !== undefined ? Number(arg('max')) : null;
  const min = arg('min') !== undefined ? Number(arg('min')) : null;
  if (has('file') || has('image')) {
    const file = input.files[field];
    if (!file) return `El campo ${label} debe ser un archivo.`;
    const ext = extension(file.name);
    if (has('image') && !IMAGE_TYPES.includes(ext)) return `El campo ${label} debe ser una imagen.`;
    const mimes = arg('mimes')?.split(',');
    if (mimes && !mimes.includes(ext)) return `El campo ${label} debe ser de tipo: ${mimes.join(', ')}.`;
    if (max !== null && file.size > max * 1024) return `El campo ${label} no debe superar los ${max} KB.`;
    data[field] = file;
    return null;
  }
  const raw = String(input.body[field]);
  const text = raw.trim();
  let value: string | number = text;
  if (has('integer')) {
    if (!/^-?\d+$/.test(text)) return `El campo ${label} debe ser un número entero.`;
    value = Number(text);
  } else if (has('numeric')) {
    if (isNaN(Number(text))) return `El campo ${label} debe ser un número.`;
    value = Number(text);
  }
  if (typeof value === 'number') {
    if (min !== null && value < min) return `El campo ${label} debe ser al menos ${min}.`;
    if (max !== null && value > max) return `El campo ${label} no debe ser mayor que ${max}.`;
  } else {
    if (min !== null && text.length < min) return `El campo ${label} debe tener al menos ${min} caracteres.`;
    if (max !== null && text.length > max) return `El campo ${label} no debe superar los ${max} caracteres.`;
  }
  if (has('email') && !EMAIL.test(text)) return `El campo ${label} debe ser un correo válido.`;
  if (has('url') && !/^https?:\/\/[^\s/]+/i.test(text)) return `El campo ${label} debe ser una URL válida.`;
  if (has('date')) {
    if (isNaN(Date.parse(text.slice(0, 10)))) return `El campo ${label} debe ser una fecha válida.`;
    const after = arg('after_or_equal');
    if (after && filled(input, after) && text < String(input.body[after]).trim()) return `El campo ${label} debe ser una fecha igual o posterior a ${after.replace(/_/g, ' ')}.`;
  }
  const allowed = arg('in')?.split(',');
  if (allowed && !allowed.includes(text)) return `El valor de ${label} no es válido.`;
  if (has('strong') && !STRONG_PASSWORD.test(raw)) return PASSWORD_MESSAGE;
  if (has('confirmed') && raw !== String(input.body[field + '_confirmation'] ?? '')) return `La confirmación de ${label} no coincide.`;
  const exists = arg('exists')?.split(',');
  if (exists && !store.t(exists[0]).some(row => String(row[exists[1]]) === String(value))) return `El valor de ${label} no es válido.`;
  const unique = arg('unique')?.split(',');
  if (unique) {
    const ignore = unique[2] ? Number(unique[2]) : null;
    const taken = store.t(unique[0]).some(row => String(row[unique[1]]).toLowerCase() === text.toLowerCase() && row['id'] !== ignore);
    if (taken) return `El valor de ${label} ya está en uso.`;
  }
  data[field] = has('strong') || has('confirmed') ? raw : value;
  return null;
}
