"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UPLOAD_DIR = exports.uploadFoto = void 0;
exports.urlPublicaUpload = urlPublicaUpload;
exports.caminhoArquivoUpload = caminhoArquivoUpload;
exports.removerArquivoPelaUrl = removerArquivoPelaUrl;
const multer_1 = __importDefault(require("multer"));
const node_path_1 = __importDefault(require("node:path"));
const node_fs_1 = __importDefault(require("node:fs"));
const node_crypto_1 = require("node:crypto");
/* Fotos ficam em disco, dentro de public/uploads - e' a pasta que o
   Setup Node.js App do cPanel ja cria por padrao e serve como estatica
   via Passenger. Tambem montamos express.static() no index.ts pro
   mesmo caminho funcionar em qualquer ambiente (dev local incluso),
   sem depender desse detalhe especifico de hospedagem. */
const UPLOAD_DIR = node_path_1.default.join(__dirname, '..', '..', 'public', 'uploads');
exports.UPLOAD_DIR = UPLOAD_DIR;
node_fs_1.default.mkdirSync(UPLOAD_DIR, { recursive: true });
const TIPOS_PERMITIDOS = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
};
exports.uploadFoto = (0, multer_1.default)({
    storage: multer_1.default.diskStorage({
        destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
        // Nome aleatorio, nunca o nome original do arquivo: evita colisao
        // e evita vazar nome de arquivo do dispositivo de quem enviou.
        filename: (_req, file, cb) => cb(null, `${(0, node_crypto_1.randomUUID)()}${TIPOS_PERMITIDOS[file.mimetype] ?? ''}`),
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
function urlPublicaUpload(filename) {
    const base = process.env.PUBLIC_URL ?? `http://localhost:${process.env.PORT ?? 3001}`;
    return `${base}/uploads/${filename}`;
}
function caminhoArquivoUpload(filename) {
    return node_path_1.default.join(UPLOAD_DIR, filename);
}
function removerArquivoPelaUrl(url) {
    const filename = url.split('/').pop();
    if (!filename)
        return;
    node_fs_1.default.unlink(caminhoArquivoUpload(filename), () => {
        // Melhor esforco: se o arquivo ja nao existe, nao ha o que fazer.
    });
}
