"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.profilesRouter = void 0;
const express_1 = require("express");
const zod_1 = require("zod");
const multer_1 = __importDefault(require("multer"));
const kysely_1 = require("kysely");
const db_1 = require("../lib/db");
const auth_1 = require("../middleware/auth");
const uploads_1 = require("../lib/uploads");
const plans_1 = require("../lib/plans");
const documentUploads_1 = require("../lib/documentUploads");
const selfieUploads_1 = require("../lib/selfieUploads");
const comprovanteUploads_1 = require("../lib/comprovanteUploads");
const publicProfile_1 = require("../lib/publicProfile");
exports.profilesRouter = (0, express_1.Router)();
const categoriaQuerySchema = zod_1.z.enum(['VIP', 'Mulheres', 'Trans']);
// Diretorio publico: only 'aprovado' aparece. E' o portao central do
// produto - nada entra aqui sem passar pela fila do gerente.
exports.profilesRouter.get('/', async (req, res) => {
    const { city, category } = req.query;
    let query = (0, publicProfile_1.comVerificacao)();
    if (typeof city === 'string' && city !== 'Todas')
        query = query.where('professional_profiles.city', '=', city);
    if (typeof category === 'string' && category !== 'Todas') {
        const parsed = categoriaQuerySchema.safeParse(category);
        if (!parsed.success) {
            res.status(400).json({ erro: 'Categoria inválida.' });
            return;
        }
        query = query.where('professional_profiles.category', '=', parsed.data);
    }
    const linhas = await query
        .orderBy((0, kysely_1.sql) `COALESCE(professional_profiles.boost_ate > NOW(), 0)`, 'desc')
        .orderBy('professional_profiles.prioridade', 'desc')
        .orderBy('professional_profiles.created_at', 'desc')
        .execute();
    res.json({ perfis: linhas.map(publicProfile_1.paraPerfilPublico) });
});
exports.profilesRouter.get('/me', auth_1.autenticar, (0, auth_1.exigirPapel)('profissional'), async (req, res) => {
    const perfil = await db_1.db
        .selectFrom('professional_profiles')
        .leftJoin('verifications', 'verifications.user_id', 'professional_profiles.user_id')
        .leftJoin('subscriptions', 'subscriptions.user_id', 'professional_profiles.user_id')
        .leftJoin('plans', 'plans.id', 'subscriptions.plan_id')
        .selectAll('professional_profiles')
        .select([
        'verifications.email_confirmado', 'verifications.telefone_confirmado',
        'verifications.documento_status', 'verifications.documento_url',
        'verifications.selfie_status', 'verifications.selfie_url',
        'subscriptions.status as subscription_status', 'subscriptions.vence_em as subscription_vence_em',
        'plans.nome as plano_nome',
    ])
        .where('professional_profiles.user_id', '=', req.user.sub)
        .executeTakeFirst();
    if (!perfil) {
        res.status(404).json({ erro: 'Perfil não encontrado para esta conta.' });
        return;
    }
    // Ao contrario da galeria publica, aqui mostra qualquer status - e'
    // a propria dona vendo o que ja enviou, incluindo o que ainda esta
    // em fila ou foi reprovado.
    const media = await db_1.db
        .selectFrom('media')
        .select(['id', 'url', 'status'])
        .where('profile_id', '=', perfil.id)
        .orderBy('position', 'asc')
        .execute();
    // So' pode existir um pedido pendente por vez (ver POST /me/plan-requests).
    const pedidoPendente = await db_1.db
        .selectFrom('plan_requests')
        .innerJoin('plans', 'plans.id', 'plan_requests.plan_id')
        .select(['plan_requests.id', 'plan_requests.created_at', 'plan_requests.comprovante_url', 'plans.nome as plano_nome'])
        .where('plan_requests.user_id', '=', req.user.sub)
        .where('plan_requests.status', '=', 'pendente')
        .executeTakeFirst();
    const { languages, services, locations, documento_url, selfie_url, ...resto } = perfil;
    res.json({
        perfil: {
            ...resto,
            languages: (0, publicProfile_1.parseJsonArray)(languages),
            services: (0, publicProfile_1.parseJsonArray)(services),
            locations: (0, publicProfile_1.parseJsonArray)(locations),
            gallery: media,
            // Nunca expor o nome do arquivo - so' se ja existe um enviado,
            // pra distinguir "nunca enviou" de "enviou, documento_status
            // comeca em 'pendente' por padrao pra todo mundo".
            documento_enviado: documento_url !== null,
            selfie_enviada: selfie_url !== null,
            max_fotos: await (0, plans_1.limiteFotos)(req.user.sub),
            pedido_plano_pendente: pedidoPendente
                ? {
                    id: pedidoPendente.id,
                    plano_nome: pedidoPendente.plano_nome,
                    created_at: pedidoPendente.created_at,
                    comprovante_enviado: pedidoPendente.comprovante_url !== null,
                }
                : null,
        },
    });
});
const pedidoPlanoSchema = zod_1.z.object({ plan_id: zod_1.z.number().int() });
// A propria profissional gera o pedido - antes disso, pedir um plano
// so' existia como mensagem informal de WhatsApp pra equipe.
exports.profilesRouter.post('/me/plan-requests', auth_1.autenticar, (0, auth_1.exigirPapel)('profissional'), async (req, res) => {
    const parsed = pedidoPlanoSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ erro: 'Informe o plano.' });
        return;
    }
    const plano = await db_1.db.selectFrom('plans').select('id').where('id', '=', parsed.data.plan_id).where('ativo', '=', 1).executeTakeFirst();
    if (!plano) {
        res.status(400).json({ erro: 'Plano inexistente ou desativado.' });
        return;
    }
    const existente = await db_1.db
        .selectFrom('plan_requests')
        .select('id')
        .where('user_id', '=', req.user.sub)
        .where('status', '=', 'pendente')
        .executeTakeFirst();
    if (existente) {
        res.status(409).json({ erro: 'Você já tem um pedido de plano em aberto. Cancele-o antes de pedir outro.' });
        return;
    }
    const inserted = await db_1.db.insertInto('plan_requests').values({ user_id: req.user.sub, plan_id: plano.id }).executeTakeFirstOrThrow();
    res.status(201).json({ ok: true, id: Number(inserted.insertId) });
});
exports.profilesRouter.post('/me/plan-requests/:id/cancelar', auth_1.autenticar, (0, auth_1.exigirPapel)('profissional'), async (req, res) => {
    const id = Number(req.params.id);
    const pedido = await db_1.db
        .selectFrom('plan_requests')
        .select(['id', 'status'])
        .where('id', '=', id)
        .where('user_id', '=', req.user.sub)
        .executeTakeFirst();
    if (!pedido || pedido.status !== 'pendente') {
        res.status(404).json({ erro: 'Pedido não encontrado ou já resolvido.' });
        return;
    }
    await db_1.db.updateTable('plan_requests').set({ status: 'cancelado', resolved_at: new Date() }).where('id', '=', id).execute();
    res.json({ ok: true });
});
// Sinaliza pra equipe que ja pagou o PIX gerado na tela - a confirmacao
// de verdade continua manual (ver financeRouter /plan-requests/:id/atender),
// isso so' poupa a profissional de precisar mandar WhatsApp avulso.
exports.profilesRouter.post('/me/plan-requests/:id/comprovante', auth_1.autenticar, (0, auth_1.exigirPapel)('profissional'), (req, res) => {
    (0, comprovanteUploads_1.uploadComprovante)(req, res, async (err) => {
        if (err) {
            const mensagem = err instanceof multer_1.default.MulterError && err.code === 'LIMIT_FILE_SIZE'
                ? 'Arquivo muito grande. Máximo de 8MB.'
                : err instanceof Error ? err.message : 'Não foi possível processar o arquivo.';
            res.status(400).json({ erro: mensagem });
            return;
        }
        if (!req.file) {
            res.status(400).json({ erro: 'Nenhum arquivo enviado.' });
            return;
        }
        const id = Number(req.params.id);
        const pedido = await db_1.db
            .selectFrom('plan_requests')
            .select(['id', 'status', 'comprovante_url'])
            .where('id', '=', id)
            .where('user_id', '=', req.user.sub)
            .executeTakeFirst();
        if (!pedido || pedido.status !== 'pendente') {
            (0, comprovanteUploads_1.removerComprovante)(req.file.filename);
            res.status(404).json({ erro: 'Pedido não encontrado ou já resolvido.' });
            return;
        }
        if (pedido.comprovante_url)
            (0, comprovanteUploads_1.removerComprovante)(pedido.comprovante_url);
        await db_1.db.updateTable('plan_requests').set({ comprovante_url: req.file.filename }).where('id', '=', id).execute();
        res.status(201).json({ ok: true });
    });
});
const edicaoSchema = zod_1.z.object({
    tagline: zod_1.z.string().max(255).optional(),
    bio: zod_1.z.string().max(4000).optional(),
    hourly_rate: zod_1.z.string().max(40).optional(),
    neighborhood: zod_1.z.string().max(120).optional(),
    height: zod_1.z.string().max(20).optional(),
    weight: zod_1.z.string().max(20).optional(),
    eyes: zod_1.z.string().max(60).optional(),
    hair: zod_1.z.string().max(60).optional(),
    silicone: zod_1.z.string().max(60).optional(),
    tattoos: zod_1.z.string().max(60).optional(),
    languages: zod_1.z.array(zod_1.z.string().trim().min(1).max(40)).max(10).optional(),
    services: zod_1.z.array(zod_1.z.string().trim().min(1).max(80)).max(20).optional(),
    locations: zod_1.z.array(zod_1.z.string().trim().min(1).max(80)).max(20).optional(),
});
exports.profilesRouter.patch('/me', auth_1.autenticar, (0, auth_1.exigirPapel)('profissional'), async (req, res) => {
    const parsed = edicaoSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ erro: 'Dados inválidos.', detalhes: parsed.error.flatten() });
        return;
    }
    if (Object.keys(parsed.data).length === 0) {
        res.status(400).json({ erro: 'Nada para atualizar.' });
        return;
    }
    // Colunas JSON esperam texto serializado ao escrever - o driver nao
    // faz essa conversao sozinho no caminho de escrita (so no de
    // leitura). Sem isso, um array vira o formato de lista do mysql2
    // (pensado pra clausulas IN (?)), nao um JSON valido.
    const { languages, services, locations, ...resto } = parsed.data;
    const valores = { ...resto };
    if (languages !== undefined)
        valores.languages = JSON.stringify(languages);
    if (services !== undefined)
        valores.services = JSON.stringify(services);
    if (locations !== undefined)
        valores.locations = JSON.stringify(locations);
    await db_1.db.updateTable('professional_profiles').set(valores).where('user_id', '=', req.user.sub).execute();
    res.json({ ok: true });
});
// Rascunho/reprovado -> pendente: e' o unico jeito de entrar na fila do
// gerente. Um perfil aprovado que volta a editar dados sensiveis nao
// perde o selo aqui - so a Fase 2 decide se re-analise e' automatica.
exports.profilesRouter.post('/me/submit', auth_1.autenticar, (0, auth_1.exigirPapel)('profissional'), async (req, res) => {
    const perfil = await db_1.db
        .selectFrom('professional_profiles')
        .select(['id', 'status'])
        .where('user_id', '=', req.user.sub)
        .executeTakeFirst();
    if (!perfil) {
        res.status(404).json({ erro: 'Perfil não encontrado para esta conta.' });
        return;
    }
    if (perfil.status === 'pendente' || perfil.status === 'aprovado') {
        res.status(409).json({ erro: `Perfil já está com status "${perfil.status}".` });
        return;
    }
    await db_1.db
        .updateTable('professional_profiles')
        .set({ status: 'pendente', submitted_at: new Date() })
        .where('id', '=', perfil.id)
        .execute();
    res.json({ ok: true });
});
// Foto nova entra como 'pendente' - mesma logica de moderacao do
// perfil, aplicada por foto: nada aparece na galeria publica sem
// passar pelo gerente primeiro.
exports.profilesRouter.post('/me/media', auth_1.autenticar, (0, auth_1.exigirPapel)('profissional'), (req, res) => {
    (0, uploads_1.uploadFoto)(req, res, async (err) => {
        if (err) {
            const mensagem = err instanceof multer_1.default.MulterError && err.code === 'LIMIT_FILE_SIZE'
                ? 'Arquivo muito grande. Máximo de 5MB.'
                : err instanceof Error ? err.message : 'Não foi possível processar a imagem.';
            res.status(400).json({ erro: mensagem });
            return;
        }
        if (!req.file) {
            res.status(400).json({ erro: 'Nenhuma imagem enviada.' });
            return;
        }
        const perfil = await db_1.db
            .selectFrom('professional_profiles')
            .select('id')
            .where('user_id', '=', req.user.sub)
            .executeTakeFirst();
        if (!perfil) {
            res.status(404).json({ erro: 'Perfil não encontrado para esta conta.' });
            return;
        }
        const { count } = await db_1.db
            .selectFrom('media')
            .select(db_1.db.fn.countAll().as('count'))
            .where('profile_id', '=', perfil.id)
            .where('status', '!=', 'reprovado')
            .executeTakeFirstOrThrow();
        const limite = await (0, plans_1.limiteFotos)(req.user.sub);
        if (Number(count) >= limite) {
            (0, uploads_1.removerArquivoPelaUrl)(req.file.filename);
            res.status(400).json({ erro: `Seu plano permite até ${limite} fotos. Remova uma foto ou mude de plano pra enviar mais.` });
            return;
        }
        const url = (0, uploads_1.urlPublicaUpload)(req.file.filename);
        const inserted = await db_1.db
            .insertInto('media')
            .values({ profile_id: perfil.id, url, position: Number(count) })
            .executeTakeFirstOrThrow();
        res.status(201).json({ foto: { id: Number(inserted.insertId), url, status: 'pendente' } });
    });
});
exports.profilesRouter.delete('/me/media/:id', auth_1.autenticar, (0, auth_1.exigirPapel)('profissional'), async (req, res) => {
    const foto = await db_1.db
        .selectFrom('media')
        .innerJoin('professional_profiles', 'professional_profiles.id', 'media.profile_id')
        .select(['media.id', 'media.url'])
        .where('media.id', '=', Number(req.params.id))
        .where('professional_profiles.user_id', '=', req.user.sub)
        .executeTakeFirst();
    if (!foto) {
        res.status(404).json({ erro: 'Foto não encontrada.' });
        return;
    }
    await db_1.db.deleteFrom('media').where('id', '=', foto.id).execute();
    (0, uploads_1.removerArquivoPelaUrl)(foto.url);
    res.json({ ok: true });
});
// Documento entra como 'pendente' de novo a cada envio - reenviar
// depois de uma reprovacao (ex: foto ilegivel) reabre a revisao do
// zero, sem carregar a decisao anterior.
exports.profilesRouter.post('/me/document', auth_1.autenticar, (0, auth_1.exigirPapel)('profissional'), (req, res) => {
    (0, documentUploads_1.uploadDocumento)(req, res, async (err) => {
        if (err) {
            const mensagem = err instanceof multer_1.default.MulterError && err.code === 'LIMIT_FILE_SIZE'
                ? 'Arquivo muito grande. Máximo de 8MB.'
                : err instanceof Error ? err.message : 'Não foi possível processar o arquivo.';
            res.status(400).json({ erro: mensagem });
            return;
        }
        if (!req.file) {
            res.status(400).json({ erro: 'Nenhum arquivo enviado.' });
            return;
        }
        const existente = await db_1.db
            .selectFrom('verifications')
            .select('documento_url')
            .where('user_id', '=', req.user.sub)
            .executeTakeFirst();
        if (existente?.documento_url)
            (0, documentUploads_1.removerDocumento)(existente.documento_url);
        await db_1.db
            .updateTable('verifications')
            .set({ documento_url: req.file.filename, documento_status: 'pendente', revisado_por: null, revisado_em: null })
            .where('user_id', '=', req.user.sub)
            .execute();
        res.status(201).json({ ok: true });
    });
});
// Selfie segurando papel com a data do dia - mesma logica do
// documento (reenvio reabre revisao do zero), mas em arquivo/rota
// separados porque sao dois documentos distintos pro gerente comparar
// lado a lado (rosto x identidade x foto de perfil).
exports.profilesRouter.post('/me/selfie', auth_1.autenticar, (0, auth_1.exigirPapel)('profissional'), (req, res) => {
    (0, selfieUploads_1.uploadSelfie)(req, res, async (err) => {
        if (err) {
            const mensagem = err instanceof multer_1.default.MulterError && err.code === 'LIMIT_FILE_SIZE'
                ? 'Arquivo muito grande. Máximo de 8MB.'
                : err instanceof Error ? err.message : 'Não foi possível processar o arquivo.';
            res.status(400).json({ erro: mensagem });
            return;
        }
        if (!req.file) {
            res.status(400).json({ erro: 'Nenhum arquivo enviado.' });
            return;
        }
        const existente = await db_1.db
            .selectFrom('verifications')
            .select('selfie_url')
            .where('user_id', '=', req.user.sub)
            .executeTakeFirst();
        if (existente?.selfie_url)
            (0, selfieUploads_1.removerSelfie)(existente.selfie_url);
        await db_1.db
            .updateTable('verifications')
            .set({ selfie_url: req.file.filename, selfie_status: 'pendente' })
            .where('user_id', '=', req.user.sub)
            .execute();
        res.status(201).json({ ok: true });
    });
});
// Fica depois da rota /me de proposito: caso contrario "/me" seria
// interpretado como um valor de :slug.
exports.profilesRouter.get('/:slug', async (req, res) => {
    const row = await (0, publicProfile_1.comVerificacao)().where('professional_profiles.slug', '=', req.params.slug).executeTakeFirst();
    if (!row) {
        res.status(404).json({ erro: 'Perfil não encontrado.' });
        return;
    }
    // So fotos ja aprovadas pelo gerente aparecem na galeria publica -
    // mesma logica de moderacao do perfil, aplicada por foto.
    const media = await db_1.db
        .selectFrom('media')
        .select('url')
        .where('profile_id', '=', row.id)
        .where('status', '=', 'aprovado')
        .orderBy('position', 'asc')
        .execute();
    res.json({ perfil: { ...(0, publicProfile_1.paraPerfilPublico)(row), gallery: media.map((m) => m.url) } });
});
