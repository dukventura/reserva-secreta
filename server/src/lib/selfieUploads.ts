import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs';
import { randomUUID } from 'node:crypto';

/* Selfie de verificacao (rosto + papel com data escrita a mao) e'
   dado sensivel igual ao documento - fica no mesmo tipo de diretorio
   privado, nunca em public/, so lida pelas rotas autenticadas de
   /me/selfie e /moderation/selfies. */

const SELFIE_DIR = path.join(__dirname, '..', '..', 'private', 'selfies');
fs.mkdirSync(SELFIE_DIR, { recursive: true });

const TIPOS_PERMITIDOS: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
};

export const uploadSelfie = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, SELFIE_DIR),
    filename: (_req, file, cb) => cb(null, `${randomUUID()}${TIPOS_PERMITIDOS[file.mimetype] ?? ''}`),
  }),
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!TIPOS_PERMITIDOS[file.mimetype]) {
      cb(new Error('Formato não suportado. Envie uma imagem (JPG, PNG ou WEBP).'));
      return;
    }
    cb(null, true);
  },
}).single('selfie');

export function caminhoSelfie(filename: string): string {
  return path.join(SELFIE_DIR, filename);
}

export function removerSelfie(filename: string | null | undefined): void {
  if (!filename) return;
  fs.unlink(caminhoSelfie(filename), () => {
    // Melhor esforco: se ja nao existe, nao ha o que fazer.
  });
}
