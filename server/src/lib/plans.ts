import type { Selectable } from 'kysely';
import { db, type Database, type SubscriptionStatus } from './db';

type Plan = Selectable<Database['plans']>;

// Plano gratuito (sem assinatura ativa). Alinhado com o "Base: ate 3
// fotos" que o painel ja anunciava.
export const FOTOS_SEM_PLANO = 3;

export async function limiteFotos(userId: number): Promise<number> {
  const plano = await db
    .selectFrom('subscriptions')
    .innerJoin('plans', 'plans.id', 'subscriptions.plan_id')
    .select('plans.max_fotos')
    .where('subscriptions.user_id', '=', userId)
    .where('subscriptions.status', '=', 'ativo')
    .executeTakeFirst();
  return plano?.max_fotos ?? FOTOS_SEM_PLANO;
}

export function somarDias(base: Date, dias: number): Date {
  const d = new Date(base);
  d.setDate(d.getDate() + dias);
  return d;
}

function inicioDoDia(d: Date): Date {
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
export async function ativarPlanoParaUsuario(params: {
  userId: number;
  plano: Plan;
  dias?: number;
  valorCentavos?: number;
  observacao?: string | null;
  registradoPor: number;
}): Promise<{ venceEm: Date; renovacao: boolean; paymentId: number }> {
  const { userId, plano, registradoPor } = params;
  const dias = params.dias ?? plano.duracao_dias;
  const valor = params.valorCentavos ?? plano.preco_centavos;
  const hoje = inicioDoDia(new Date());

  const atual = await db.selectFrom('subscriptions').selectAll().where('user_id', '=', userId).executeTakeFirst();
  const renovacao = atual?.status === 'ativo' && atual.plan_id === plano.id && inicioDoDia(atual.vence_em) >= hoje;
  const base = renovacao ? inicioDoDia(atual!.vence_em) : hoje;
  const venceEm = somarDias(base, dias);

  const paymentId = await db.transaction().execute(async (trx) => {
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
    const pagamento = await trx
      .insertInto('payments')
      .values({
        user_id: userId, tipo: 'plano', plan_id: plano.id, valor_centavos: valor, dias,
        observacao: params.observacao || null, registrado_por: registradoPor,
      })
      .executeTakeFirstOrThrow();
    return Number(pagamento.insertId);
  });

  return { venceEm, renovacao: Boolean(renovacao), paymentId };
}

interface AssinaturaAnterior {
  subscription: { plan_id: number | null; status: string; vence_em: string; ultimo_pagamento_em: string; registrado_por: number | null } | null;
  is_vip: number;
  prioridade: number;
}

/* Liberacao automatica: sem API do banco nao da' pra saber sozinho que
   o PIX caiu, entao o plano e' ativado na hora em que a profissional
   envia o comprovante, e a equipe confere o extrato depois. Guarda um
   retrato do que existia antes pra conseguir desfazer se o dinheiro
   nao cair. Quem ja teve uma liberacao desfeita perde esse direito e
   volta pra fila manual. Retorna false quando nao liberou. */
export async function liberarPlanoAutomaticamente(pedidoId: number): Promise<boolean> {
  const pedido = await db
    .selectFrom('plan_requests')
    .select(['id', 'user_id', 'plan_id', 'status', 'liberado_em'])
    .where('id', '=', pedidoId)
    .executeTakeFirst();
  if (!pedido || pedido.status !== 'pendente' || pedido.liberado_em) return false;

  const plano = await db.selectFrom('plans').selectAll().where('id', '=', pedido.plan_id).executeTakeFirst();
  if (!plano || !plano.ativo) return false;

  const jaFoiDesfeita = await db
    .selectFrom('plan_requests')
    .select('id')
    .where('user_id', '=', pedido.user_id)
    .where('status', '=', 'recusado')
    .where('liberado_em', 'is not', null)
    .executeTakeFirst();
  if (jaFoiDesfeita) return false;

  const sub = await db.selectFrom('subscriptions').selectAll().where('user_id', '=', pedido.user_id).executeTakeFirst();
  const perfil = await db
    .selectFrom('professional_profiles')
    .select(['is_vip', 'prioridade'])
    .where('user_id', '=', pedido.user_id)
    .executeTakeFirstOrThrow();
  const anterior: AssinaturaAnterior = {
    subscription: sub
      ? {
          plan_id: sub.plan_id, status: sub.status, vence_em: sub.vence_em.toISOString(),
          ultimo_pagamento_em: sub.ultimo_pagamento_em.toISOString(), registrado_por: sub.registrado_por,
        }
      : null,
    is_vip: perfil.is_vip,
    prioridade: perfil.prioridade,
  };

  const { paymentId } = await ativarPlanoParaUsuario({
    userId: pedido.user_id,
    plano,
    observacao: `Liberado automaticamente pelo comprovante (pedido RS${pedido.id}) - conferir PIX`,
    registradoPor: pedido.user_id,
  });
  await db
    .updateTable('plan_requests')
    .set({ liberado_em: new Date(), liberacao_payment_id: paymentId, assinatura_anterior: JSON.stringify(anterior) })
    .where('id', '=', pedido.id)
    .execute();
  return true;
}

/* Desfaz uma liberacao automatica cujo PIX nao caiu: devolve a
   assinatura e o destaque do perfil ao que eram antes e apaga o
   pagamento que tinha sido registrado. */
export async function desfazerLiberacao(pedidoId: number): Promise<void> {
  const pedido = await db
    .selectFrom('plan_requests')
    .select(['user_id', 'liberado_em', 'liberacao_payment_id', 'assinatura_anterior'])
    .where('id', '=', pedidoId)
    .executeTakeFirst();
  if (!pedido?.liberado_em || !pedido.assinatura_anterior) return;
  const anterior = JSON.parse(pedido.assinatura_anterior) as AssinaturaAnterior;

  await db.transaction().execute(async (trx) => {
    if (anterior.subscription) {
      const s = anterior.subscription;
      await trx
        .updateTable('subscriptions')
        .set({
          plan_id: s.plan_id, status: s.status as SubscriptionStatus, vence_em: new Date(s.vence_em),
          ultimo_pagamento_em: new Date(s.ultimo_pagamento_em), registrado_por: s.registrado_por,
        })
        .where('user_id', '=', pedido.user_id)
        .execute();
    } else {
      await trx.deleteFrom('subscriptions').where('user_id', '=', pedido.user_id).execute();
    }
    await trx
      .updateTable('professional_profiles')
      .set({ is_vip: anterior.is_vip, prioridade: anterior.prioridade })
      .where('user_id', '=', pedido.user_id)
      .execute();
    if (pedido.liberacao_payment_id) {
      await trx.deleteFrom('payments').where('id', '=', pedido.liberacao_payment_id).execute();
    }
  });
}
