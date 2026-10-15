"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.webhooksRouter = void 0;
const express_1 = require("express");
const db_1 = require("../lib/db");
const audit_1 = require("../lib/audit");
const plans_1 = require("../lib/plans");
const mercadopago_1 = require("../lib/mercadopago");
exports.webhooksRouter = (0, express_1.Router)();
// Mercado Pago chama esse endpoint sempre que o status de um pagamento
// muda - e' assim que o PIX automatico se confirma sozinho, sem
// precisar de ninguem olhando o painel. Nunca confia no corpo da
// notificacao pra decidir nada (poderia ser forjado): so usa o id pra
// buscar o pagamento de verdade na API deles antes de agir.
exports.webhooksRouter.post('/mercadopago', async (req, res) => {
    // Responde 200 rapido pra qualquer coisa que nao seja um pagamento
    // de verdade - o MP reenvia (com backoff) se nao receber 200, e
    // nao vale a pena atrasar a resposta validando tipo antes.
    const dataId = req.body?.data?.id ? String(req.body.data.id) : req.query['data.id'] ? String(req.query['data.id']) : null;
    if (req.body?.type !== 'payment' || !dataId) {
        res.sendStatus(200);
        return;
    }
    const assinaturaValida = (0, mercadopago_1.validarAssinaturaWebhook)({
        xSignature: req.header('x-signature'),
        xRequestId: req.header('x-request-id'),
        dataId,
    });
    if (!assinaturaValida) {
        console.error('Webhook Mercado Pago com assinatura invalida, ignorado. data.id=', dataId);
        res.sendStatus(200);
        return;
    }
    try {
        const pagamento = await (0, mercadopago_1.buscarPagamentoMercadoPago)(dataId);
        if (pagamento.status !== 'approved') {
            res.sendStatus(200);
            return;
        }
        const pedido = await db_1.db
            .selectFrom('plan_requests')
            .innerJoin('plans', 'plans.id', 'plan_requests.plan_id')
            .innerJoin('professional_profiles', 'professional_profiles.user_id', 'plan_requests.user_id')
            .select([
            'plan_requests.id', 'plan_requests.user_id', 'plan_requests.status',
            'plans.id as plan_id', 'plans.nome as plano_nome', 'plans.preco_centavos', 'plans.duracao_dias',
            'plans.max_fotos', 'plans.prioridade', 'plans.selo_vip', 'plans.ativo',
            'professional_profiles.stage_name',
        ])
            .where('plan_requests.mercadopago_payment_id', '=', dataId)
            .executeTakeFirst();
        // Pagamento aprovado mas o pedido ja foi resolvido por outro
        // caminho (ex: admin atendeu manualmente antes do webhook chegar)
        // ou nao bate com nenhum pedido - nao ha' nada a fazer, so' loga.
        if (!pedido || pedido.status !== 'pendente') {
            res.sendStatus(200);
            return;
        }
        await (0, plans_1.ativarPlanoParaUsuario)({
            userId: pedido.user_id,
            plano: {
                id: pedido.plan_id, nome: pedido.plano_nome, preco_centavos: pedido.preco_centavos,
                duracao_dias: pedido.duracao_dias, max_fotos: pedido.max_fotos, prioridade: pedido.prioridade,
                selo_vip: pedido.selo_vip, ativo: pedido.ativo, created_at: new Date(), updated_at: new Date(),
            },
            registradoPor: null,
        });
        await db_1.db
            .updateTable('plan_requests')
            .set({ status: 'atendido', resolved_at: new Date(), resolved_by: null })
            .where('id', '=', pedido.id)
            .execute();
        await (0, audit_1.registrarAuditoria)(null, `Confirmou PIX automático (Mercado Pago) - plano ${pedido.plano_nome}`, pedido.stage_name);
        res.sendStatus(200);
    }
    catch (err) {
        console.error('Erro processando webhook do Mercado Pago:', err);
        // 200 mesmo assim - um 500 faria o MP reenviar a mesma notificacao
        // indefinidamente pro mesmo erro de bug nosso, sem ajudar em nada.
        res.sendStatus(200);
    }
});
