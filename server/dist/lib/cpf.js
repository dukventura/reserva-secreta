"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.soDigitos = soDigitos;
exports.cpfValido = cpfValido;
exports.hashCpf = hashCpf;
exports.mascararCpf = mascararCpf;
const node_crypto_1 = require("node:crypto");
function soDigitos(cpf) {
    return cpf.replace(/\D/g, '');
}
// Digitos verificadores (modulo 11). Recusa tambem sequencias repetidas
// (111.111.111-11), que passam na conta mas nao existem.
function cpfValido(cpf) {
    const d = soDigitos(cpf);
    if (d.length !== 11 || /^(\d)\1{10}$/.test(d))
        return false;
    for (const tamanho of [9, 10]) {
        let soma = 0;
        for (let i = 0; i < tamanho; i++)
            soma += Number(d[i]) * (tamanho + 1 - i);
        const digito = ((soma * 10) % 11) % 10;
        if (digito !== Number(d[tamanho]))
            return false;
    }
    return true;
}
// HMAC com o JWT_SECRET: sem a chave, o hash nao da' pra reverter nem
// por forca bruta (CPF tem so' 10^9 combinacoes, um SHA puro cairia).
// ATENCAO: trocar o JWT_SECRET invalida a deteccao de CPF repetido dos
// cadastros antigos.
function hashCpf(cpf) {
    return (0, node_crypto_1.createHmac)('sha256', `cpf:${process.env.JWT_SECRET}`).update(soDigitos(cpf)).digest('hex');
}
// So' os digitos do meio: o gerente confere com o documento sem o
// sistema guardar o CPF inteiro.
function mascararCpf(cpf) {
    const d = soDigitos(cpf);
    return `***.${d.slice(3, 6)}.${d.slice(6, 9)}-**`;
}
