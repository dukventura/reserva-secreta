"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadDocumento = void 0;
exports.caminhoDocumento = caminhoDocumento;
exports.removerDocumento = removerDocumento;
const multer_1 = __importDefault(require("multer"));
const node_path_1 = __importDefault(require("node:path"));
const node_fs_1 = __importDefault(require("node:fs"));
const node_crypto_1 = require("node:crypto");
/* Documento de identidade (RG/CNH) e' dado sensivel - ao contrario das
   fotos de perfil, nunca pode ficar num caminho publico, nem com nome
   aleatorio (obscuridade nao e' controle de acesso). Fica fora de
   public/, num diretorio que so as rotas autenticadas de /me/document
   e /moderation/documents leem do disco. */
const DOCUMENT_DIR = node_path_1.default.join(__dirname, '..', '..', 'private', 'documents');
node_fs_1.default.mkdirSync(DOCUMENT_DIR, { recursive: true });
const TIPOS_PERMITIDOS = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
    'application/pdf': '.pdf',
};
exports.uploadDocumento = (0, multer_1.default)({
    storage: multer_1.default.diskStorage({
        destination: (_req, _file, cb) => cb(null, DOCUMENT_DIR),
        filename: (_req, file, cb) => cb(null, `${(0, node_crypto_1.randomUUID)()}${TIPOS_PERMITIDOS[file.mimetype] ?? ''}`),
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
function caminhoDocumento(filename) {
    return node_path_1.default.join(DOCUMENT_DIR, filename);
}
function removerDocumento(filename) {
    if (!filename)
        return;
    node_fs_1.default.unlink(caminhoDocumento(filename), () => {
        // Melhor esforco: se ja nao existe, nao ha o que fazer.
    });
}
