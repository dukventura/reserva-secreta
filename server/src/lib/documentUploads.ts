import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs';
import { randomUUID } from 'node:crypto';

/* Documento de identidade (RG/CNH) e' dado sensivel - ao contrario das
   fotos de perfil, nunca pode ficar num caminho publico, nem com nome
   aleatorio (obscuridade nao e' controle de acesso). Fica fora de
   public/, num diretorio que so as rotas autenticadas de /me/document
   e /moderation/documents leem do disco. */

const DOCUMENT_DIR = path.join(__dirname, '..', '..', 'private', 'documents');
fs.mkdirSync(DOCUMENT_DIR, { recursive: true });

const TIPOS_PERMITIDOS: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'application/pdf': '.pdf',
};

export const uploadDocumento = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, DOCUMENT_DIR),
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
}).single('documento');

export function caminhoDocumento(filename: string): string {
  return path.join(DOCUMENT_DIR, filename);
}

export function removerDocumento(filename: string | null | undefined): void {
  if (!filename) return;
  fs.unlink(caminhoDocumento(filename), () => {
    // Melhor esforco: se ja nao existe, nao ha o que fazer.
  });
}
