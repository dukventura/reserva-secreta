import type { Selectable } from 'kysely';
import { db, type Database } from './db';

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
}): Promise<{ venceEm: Date; renovacao: boolean }> {
  const { userId, plano, registradoPor } = params;
  const dias = params.dias ?? plano.duracao_dias;
  const valor = params.valorCentavos ?? plano.preco_centavos;
  const hoje = inicioDoDia(new Date());

  const atual = await db.selectFrom('subscriptions').selectAll().where('user_id', '=', userId).executeTakeFirst();
  const renovacao = atual?.status === 'ativo' && atual.plan_id === plano.id && inicioDoDia(atual.vence_em) >= hoje;
  const base = renovacao ? inicioDoDia(atual!.vence_em) : hoje;
  const venceEm = somarDias(base, dias);

  await db.transaction().execute(async (trx) => {
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
