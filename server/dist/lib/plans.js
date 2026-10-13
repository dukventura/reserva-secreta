"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FOTOS_SEM_PLANO = void 0;
exports.limiteFotos = limiteFotos;
exports.somarDias = somarDias;
exports.ativarPlanoParaUsuario = ativarPlanoParaUsuario;
const db_1 = require("./db");
// Plano gratuito (sem assinatura ativa). Alinhado com o "Base: ate 3
// fotos" que o painel ja anunciava.
exports.FOTOS_SEM_PLANO = 3;
async function limiteFotos(userId) {
    const plano = await db_1.db
        .selectFrom('subscriptions')
        .innerJoin('plans', 'plans.id', 'subscriptions.plan_id')
        .select('plans.max_fotos')
        .where('subscriptions.user_id', '=', userId)
        .where('subscriptions.status', '=', 'ativo')
        .executeTakeFirst();
    return plano?.max_fotos ?? exports.FOTOS_SEM_PLANO;
}
function somarDias(base, dias) {
    const d = new Date(base);
    d.setDate(d.getDate() + dias);
    return d;
}
function inicioDoDia(d) {
    const c = new Date(d);
    c.setHours(0, 0, 0, 0);
    return c;
}
/* Ativa, renova, troca ou reativa um plano pra um usuario - usado
   tanto quando o Admin Master ativa direto quanto quando atende um
   pedido feito pela propria profissional. Renovacao do mesmo plano
   ainda em dia soma ao vencimento atual (ninguem perde dia pago);
   qualquer outro caso (plano novo, trocado ou vencido) comeca a
   contar de hoje. */
async function ativarPlanoParaUsuario(params) {
    const { userId, plano, registradoPor } = params;
    const dias = params.dias ?? plano.duracao_dias;
    const valor = params.valorCentavos ?? plano.preco_centavos;
    const hoje = inicioDoDia(new Date());
    const atual = await db_1.db.selectFrom('subscriptions').selectAll().where('user_id', '=', userId).executeTakeFirst();
    const renovacao = atual?.status === 'ativo' && atual.plan_id === plano.id && inicioDoDia(atual.vence_em) >= hoje;
    const base = renovacao ? inicioDoDia(atual.vence_em) : hoje;
    const venceEm = somarDias(base, dias);
    await db_1.db.transaction().execute(async (trx) => {
        await trx
            .insertInto('subscriptions')
            .values({ user_id: userId, plan_id: plano.id, status: 'ativo', vence_em: venceEm, ultimo_pagamento_em: hoje, registrado_por: registradoPor })
            .onDuplicateKeyUpdate({ plan_id: plano.id, status: 'ativo', vence_em: venceEm, ultimo_pagamento_em: hoje, registrado_por: registradoPor })
            .execute();
        await trx
            .updateTable('professional_profiles')
            .set({ is_vip: plano.selo_vip, prioridade: plano.prioridade })
            .where('user_id', '=', userId)
            .execute();
        await trx
            .insertInto('payments')
            .values({
            user_id: userId, tipo: 'plano', plan_id: plano.id, valor_centavos: valor, dias,
            observacao: params.observacao || null, registrado_por: registradoPor,
        })
            .execute();
    });
    return { venceEm, renovacao: Boolean(renovacao) };
}
