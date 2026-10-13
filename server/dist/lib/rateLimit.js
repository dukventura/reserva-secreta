"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.reportLimiter = exports.registerLimiter = exports.loginLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const rateLimitStore_1 = require("./rateLimitStore");
/* Sem isso, um unico IP mal-intencionado pode tentar milhares de
   senhas por minuto (login) ou inundar o banco de contas falsas
   (registro). As janelas sao por IP - exige `trust proxy` habilitado
   no app (ver index.ts), senao todo mundo aparece atras do IP do
   proprio Apache/Passenger e o limite vira global por engano.

   Store customizado (MySQL) em vez do MemoryStore padrao: ver
   rateLimitStore.ts para o motivo (Passenger roda multiplos
   processos). */
exports.loginLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    limit: 8,
    standardHeaders: true,
    legacyHeaders: false,
    store: new rateLimitStore_1.MysqlRateLimitStore('login'),
    message: { erro: 'Muitas tentativas de login. Aguarde alguns minutos e tente novamente.' },
});
exports.registerLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 60 * 1000,
    limit: 10,
    standardHeaders: true,
    legacyHeaders: false,
    store: new rateLimitStore_1.MysqlRateLimitStore('register'),
    message: { erro: 'Muitos cadastros a partir deste endereço. Aguarde uma hora e tente novamente.' },
});
exports.reportLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 60 * 1000,
    limit: 10,
    standardHeaders: true,
    legacyHeaders: false,
    store: new rateLimitStore_1.MysqlRateLimitStore('report'),
    message: { erro: 'Muitas denúncias enviadas. Aguarde uma hora e tente novamente.' },
});
