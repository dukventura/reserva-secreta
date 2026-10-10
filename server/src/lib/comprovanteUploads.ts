import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs';
import { randomUUID } from 'node:crypto';

/* Comprovante de PIX e' dado financeiro da profissional - mesma logica
   de documento/selfie: fora de public/, so' as rotas autenticadas de
   /me/plan-requests e /finance/plan-requests leem do disco. */

const COMPROVANTE_DIR = path.join(__dirname, '..', '..', 'private', 'comprovantes');
fs.mkdirSync(COMPROVANTE_DIR, { recursive: true });

const TIPOS_PERMITIDOS: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'application/pdf': '.pdf',
};

export const uploadComprovante = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, COMPROVANTE_DIR),
    filename: (_req, file, cb) => cb(null, `${randomUUID()}${TIPOS_PERMITIDOS[file.mimetype] ?? ''}`),
  }),
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!TIPOS_PERMITIDOS[file.mimetype]) {
      cb(new Error('Formato não suportado. Envie uma imagem (JPG, PNG, WEBP) ou PDF.'));
      return;
    }
    cb(null, true);
  },
}).single('comprovante');

export function caminhoComprovante(filename: string): string {
  return path.join(COMPROVANTE_DIR, filename);
}

export function removerComprovante(filename: string | null | undefined): void {
  if (!filename) return;
  fs.unlink(caminhoComprovante(filename), () => {
    // Melhor esforco: se ja nao existe, nao ha o que fazer.
  });
}
