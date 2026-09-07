import { randomBytes } from 'node:crypto';

export function slugify(texto: string): string {
  return texto
    .normalize('NFD')
    // Marcas diacriticas combinantes (U+0300-U+036F) que sobram apos o
    // NFD separar cada acento da letra base - ex: "í" vira "i" + U+0301.
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function slugUnico(base: string): string {
  const sufixo = randomBytes(2).toString('hex');
  return `${slugify(base)}-${sufixo}`;
}
