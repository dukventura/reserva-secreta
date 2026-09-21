import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs';
import { randomUUID } from 'node:crypto';

/* Fotos ficam em disco, dentro de public/uploads - e' a pasta que o
   Setup Node.js App do cPanel ja cria por padrao e serve como estatica
   via Passenger. Tambem montamos express.static() no index.ts pro
   mesmo caminho funcionar em qualquer ambiente (dev local incluso),
   sem depender desse detalhe especifico de hospedagem. */

const UPLOAD_DIR = path.join(__dirname, '..', '..', 'public', 'uploads');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const TIPOS_PERMITIDOS: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
};

export const MAX_FOTOS_POR_PERFIL = 10;

export const uploadFoto = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
    // Nome aleatorio, nunca o nome original do arquivo: evita colisao
    // e evita vazar nome de arquivo do dispositivo de quem enviou.
    filename: (_req, file, cb) => cb(null, `${randomUUID()}${TIPOS_PERMITIDOS[file.mimetype] ?? ''}`),
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!TIPOS_PERMITIDOS[file.mimetype]) {
      cb(new Error('Formato não suportado. Envie uma imagem JPG, PNG ou WEBP.'));
      return;
    }
    cb(null, true);
  },
}).single('foto');

export function urlPublicaUpload(filename: string): string {
  const base = process.env.PUBLIC_URL ?? `http://localhost:${process.env.PORT ?? 3001}`;
  return `${base}/uploads/${filename}`;
}

export function caminhoArquivoUpload(filename: string): string {
  return path.join(UPLOAD_DIR, filename);
}

export function removerArquivoPelaUrl(url: string): void {
  const filename = url.split('/').pop();
  if (!filename) return;
  fs.unlink(caminhoArquivoUpload(filename), () => {
    // Melhor esforco: se o arquivo ja nao existe, nao ha o que fazer.
  });
}

export { UPLOAD_DIR };
