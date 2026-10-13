"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashSenha = hashSenha;
exports.conferirSenha = conferirSenha;
exports.emitirToken = emitirToken;
exports.verificarToken = verificarToken;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const zod_1 = require("zod");
const tokenPayloadSchema = zod_1.z.object({
    sub: zod_1.z.number(),
    role: zod_1.z.enum(['master', 'gerente', 'profissional', 'contratante']),
    name: zod_1.z.string(),
});
function jwtSecret() {
    const secret = process.env.JWT_SECRET;
    if (!secret || secret.length < 16) {
        // Falha alto e cedo: um segredo fraco ou ausente compromete toda
        // sessao emitida por este processo, silenciosamente.
        throw new Error('JWT_SECRET ausente ou fraco - defina uma string longa e aleatoria no ambiente.');
    }
    return secret;
}
async function hashSenha(senha) {
    return bcryptjs_1.default.hash(senha, 12);
}
async function conferirSenha(senha, hash) {
    return bcryptjs_1.default.compare(senha, hash);
}
function emitirToken(payload) {
    return jsonwebtoken_1.default.sign(payload, jwtSecret(), { expiresIn: '7d' });
}
function verificarToken(token) {
    const decoded = jsonwebtoken_1.default.verify(token, jwtSecret());
    // A assinatura ja garante integridade, mas validar o formato aqui
    // evita que um payload de outro contexto (ou de uma versao antiga do
    // token, apos o schema mudar) passe adiante com campos faltando.
    return tokenPayloadSchema.parse(decoded);
}
