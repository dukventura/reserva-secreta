"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verificarPedidoSicredi = verificarPedidoSicredi;
const db_1 = require("./db");
const audit_1 = require("./audit");
const plans_1 = require("./plans");
const sicredi_1 = require("./sicredi");
async function verificarPedidoSicredi(pedidoId) {
    const pedido = await db_1.db
        .selectFrom('plan_requests')
        .innerJoin('plans', 'plans.id', 'plan_requests.plan_id')
        .innerJoin('professional_profiles', 'professional_profiles.user_id', 'plan_requests.user_id')
        .selectAll('plans')
        .select([
        'plan_requests.id as pedido_id', 'plan_requests.user_id', 'plan_requests.status as pedido_status',
        'plan_requests.sicredi_txid', 'professional_profiles.stage_name',
    ])
        .where('plan_requests.id', '=', pedidoId)
        .executeTakeFirst();
    if (!pedido || pedido.pedido_status !== 'pendente')
        return 'resolvido';
    if (!pedido.sicredi_txid)
        return 'aguardando';
    const cobranca = await (0, sicredi_1.consultarCobranca)(pedido.sicredi_txid);
    if (cobranca.status === 'ATIVA')
        return 'aguardando';
    if (cobranca.status !== 'CONCLUIDA')
        return 'expirado';
    // Marca como atendido antes de ativar, condicionado a ainda estar
    // pendente - se a tela e o cron confirmarem ao mesmo tempo, so' um
    // dos dois passa daqui e o plano nao e' ativado duas vezes.
    const marcado = await db_1.db
        .updateTable('plan_requests')
        .set({ status: 'atendido', resolved_at: new Date(), resolved_by: null })
        .where('id', '=', pedido.pedido_id)
        .where('status', '=', 'pendente')
        .executeTakeFirst();
    if (Number(marcado.numUpdatedRows) === 0)
        return 'resolvido';
    const { pedido_id: _p, user_id, pedido_status: _s, sicredi_txid: _t, stage_name, ...plano } = pedido;
    await (0, plans_1.ativarPlanoParaUsuario)({ userId: user_id, plano, registradoPor: null, observacao: `PIX automático Sicredi (txid ${pedido.sicredi_txid})` });
    await (0, audit_1.registrarAuditoria)(null, `Confirmou PIX automático (Sicredi) - plano ${plano.nome}`, stage_name);
    return 'pago';
}
