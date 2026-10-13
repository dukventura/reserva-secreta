"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.slugify = slugify;
exports.slugUnico = slugUnico;
const node_crypto_1 = require("node:crypto");
function slugify(texto) {
    return texto
        .normalize('NFD')
        // Marcas diacriticas combinantes (U+0300-U+036F) que sobram apos o
        // NFD separar cada acento da letra base - ex: "í" vira "i" + U+0301.
        .replace(/[̀-ͯ]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}
function slugUnico(base) {
    const sufixo = (0, node_crypto_1.randomBytes)(2).toString('hex');
    return `${slugify(base)}-${sufixo}`;
}
