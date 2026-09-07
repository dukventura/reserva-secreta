import { db } from './db';

export async function registrarAuditoria(actorUserId: number | null, action: string, target: string) {
  await db.insertInto('audit_log').values({ actor_user_id: actorUserId, action, target }).execute();
}
