"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.autenticar = autenticar;
exports.exigirPapel = exigirPapel;
const auth_1 = require("../lib/auth");
function autenticar(req, res, next) {
    const header = req.headers.authorization;
    const token = header?.startsWith('Bearer ') ? header.slice(7) : undefined;
    if (!token) {
        res.status(401).json({ erro: 'Não autenticado.' });
        return;
    }
    try {
        req.user = (0, auth_1.verificarToken)(token);
        next();
    }
    catch {
        res.status(401).json({ erro: 'Sessão inválida ou expirada.' });
    }
}
function exigirPapel(...papeis) {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({ erro: 'Não autenticado.' });
            return;
        }
        if (!papeis.includes(req.user.role)) {
            res.status(403).json({ erro: `Este recurso exige o papel: ${papeis.join(' ou ')}.` });
            return;
        }
        next();
    };
}
