"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadSelfie = void 0;
exports.caminhoSelfie = caminhoSelfie;
exports.removerSelfie = removerSelfie;
const multer_1 = __importDefault(require("multer"));
const node_path_1 = __importDefault(require("node:path"));
const node_fs_1 = __importDefault(require("node:fs"));
const node_crypto_1 = require("node:crypto");
/* Selfie de verificacao (rosto + papel com data escrita a mao) e'
   dado sensivel igual ao documento - fica no mesmo tipo de diretorio
   privado, nunca em public/, so lida pelas rotas autenticadas de
   /me/selfie e /moderation/selfies. */
const SELFIE_DIR = node_path_1.default.join(__dirname, '..', '..', 'private', 'selfies');
node_fs_1.default.mkdirSync(SELFIE_DIR, { recursive: true });
const TIPOS_PERMITIDOS = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
};
exports.uploadSelfie = (0, multer_1.default)({
    storage: multer_1.default.diskStorage({
        destination: (_req, _file, cb) => cb(null, SELFIE_DIR),
        filename: (_req, file, cb) => cb(null, `${(0, node_crypto_1.randomUUID)()}${TIPOS_PERMITIDOS[file.mimetype] ?? ''}`),
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
function caminhoSelfie(filename) {
    return node_path_1.default.join(SELFIE_DIR, filename);
}
function removerSelfie(filename) {
    if (!filename)
        return;
    node_fs_1.default.unlink(caminhoSelfie(filename), () => {
        // Melhor esforco: se ja nao existe, nao ha o que fazer.
    });
}
