"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reportsRouter = void 0;
const express_1 = require("express");
const zod_1 = require("zod");
const db_1 = require("../lib/db");
const auth_1 = require("../lib/auth");
const rateLimit_1 = require("../lib/rateLimit");
exports.reportsRouter = (0, express_1.Router)();
const reasonSchema = zod_1.z.enum([
    'Conteúdo sem consentimento',
    'Perfil falso / golpe',
    'Menor de idade suspeita',
    'Assédio no contato',
    'Outro',
]);
const denunciaSchema = zod_1.z.object({
    targetSlug: zod_1.z.string().min(1),
    reason: reasonSchema,
    details: zod_1.z.string().trim().min(10, 'Descreva com um pouco mais de detalhe.').max(2000),
});
// Sem exigir login: o Marco Civil (art. 21) trata a denuncia de
// conteudo intimo sem consentimento como notificacao direta que a
// plataforma deve atender sem esperar ordem judicial - travar isso
// atras de cadastro derrubaria justamente o canal que a lei protege.
exports.reportsRouter.post('/', rateLimit_1.reportLimiter, async (req, res) => {
    const parsed = denunciaSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ erro: 'Dados inválidos.', detalhes: parsed.error.flatten() });
        return;
    }
    const perfil = await db_1.db
        .selectFrom('professional_profiles')
        .select('id')
        .where('slug', '=', parsed.data.targetSlug)
        .executeTakeFirst();
    if (!perfil) {
        res.status(404).json({ erro: 'Anúncio não encontrado.' });
        return;
    }
    // Identifica o autor so se ele mandou um token valido; sem token, ou
    // com token invalido/expirado, a denuncia segue como anonima em vez
    // de falhar - o canal nao pode depender de sessao ativa.
    let reporterUserId = null;
    const header = req.headers.authorization;
    const token = header?.startsWith('Bearer ') ? header.slice(7) : undefined;
    if (token) {
        try {
            reporterUserId = (0, auth_1.verificarToken)(token).sub;
        }
        catch {
            reporterUserId = null;
        }
    }
    await db_1.db
        .insertInto('reports')
        .values({
        target_profile_id: perfil.id,
        reporter_user_id: reporterUserId,
        reason: parsed.data.reason,
        details: parsed.data.details,
    })
        .execute();
    res.status(201).json({ ok: true });
});
