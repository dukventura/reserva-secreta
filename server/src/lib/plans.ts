import { db } from './db';

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
