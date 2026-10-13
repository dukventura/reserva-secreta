"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadComprovante = void 0;
exports.caminhoComprovante = caminhoComprovante;
exports.removerComprovante = removerComprovante;
const multer_1 = __importDefault(require("multer"));
const node_path_1 = __importDefault(require("node:path"));
const node_fs_1 = __importDefault(require("node:fs"));
const node_crypto_1 = require("node:crypto");
/* Comprovante de PIX e' dado financeiro da profissional - mesma logica
   de documento/selfie: fora de public/, so' as rotas autenticadas de
   /me/plan-requests e /finance/plan-requests leem do disco. */
const COMPROVANTE_DIR = node_path_1.default.join(__dirname, '..', '..', 'private', 'comprovantes');
node_fs_1.default.mkdirSync(COMPROVANTE_DIR, { recursive: true });
const TIPOS_PERMITIDOS = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
    'application/pdf': '.pdf',
};
exports.uploadComprovante = (0, multer_1.default)({
    storage: multer_1.default.diskStorage({
        destination: (_req, _file, cb) => cb(null, COMPROVANTE_DIR),
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
}).single('comprovante');
function caminhoComprovante(filename) {
    return node_path_1.default.join(COMPROVANTE_DIR, filename);
}
function removerComprovante(filename) {
    if (!filename)
        return;
    node_fs_1.default.unlink(caminhoComprovante(filename), () => {
        // Melhor esforco: se ja nao existe, nao ha o que fazer.
    });
}
