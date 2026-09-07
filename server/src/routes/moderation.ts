import { Router } from 'express';
import { z } from 'zod';
import { db } from '../lib/db';
import { autenticar, exigirPapel } from '../middleware/auth';
import { registrarAuditoria } from '../lib/audit';

export const moderationRouter = Router();
moderationRouter.use(autenticar, exigirPapel('gerente', 'master'));

moderationRouter.get('/profiles/pending', async (_req, res) => {
  const perfis = await db
    .selectFrom('professional_profiles')
    .select(['id', 'slug', 'stage_name', 'age', 'city', 'category', 'whatsapp', 'cover_image', 'submitted_at'])
    .where('status', '=', 'pendente')
    .orderBy('submitted_at', 'asc')
    .execute();
  res.json({ perfis });
});

const decisaoSchema = z.object({ status: z.enum(['aprovado', 'reprovado']) });

moderationRouter.post('/profiles/:id/decide', async (req, res) => {
  const parsed = decisaoSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ erro: 'Informe status: aprovado ou reprovado.' });
    return;
  }
  const id = Number(req.params.id);
  const perfil = await db.selectFrom('professional_profiles').select(['stage_name']).where('id', '=', id).executeTakeFirst();
  if (!perfil) {
    res.status(404).json({ erro: 'Anúncio não encontrado.' });
    return;
  }

  await db.updateTable('professional_profiles').set({ status: parsed.data.status }).where('id', '=', id).execute();
  await registrarAuditoria(
    req.user!.sub,
    parsed.data.status === 'aprovado' ? 'Aprovou anúncio' : 'Reprovou anúncio',
    perfil.stage_name,
  );
  res.json({ ok: true });
});

moderationRouter.get('/reports', async (_req, res) => {
  const denuncias = await db
    .selectFrom('reports')
    .innerJoin('professional_profiles', 'professional_profiles.id', 'reports.target_profile_id')
    .select([
      'reports.id', 'reports.reason', 'reports.details', 'reports.status', 'reports.created_at',
      'reports.reporter_user_id', 'professional_profiles.stage_name as target_name', 'professional_profiles.slug as target_slug',
    ])
    .where('reports.status', '=', 'pendente')
    .orderBy('reports.created_at', 'asc')
    .execute();
  res.json({ denuncias });
});

moderationRouter.post('/reports/:id/decide', async (req, res) => {
  const parsed = decisaoSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ erro: 'Informe status: aprovado ou reprovado.' });
    return;
  }
  const id = Number(req.params.id);
  const denuncia = await db
    .selectFrom('reports')
    .innerJoin('professional_profiles', 'professional_profiles.id', 'reports.target_profile_id')
    .select(['reports.id', 'reports.target_profile_id', 'professional_profiles.stage_name as target_name'])
    .where('reports.id', '=', id)
    .executeTakeFirst();
  if (!denuncia) {
    res.status(404).json({ erro: 'Denúncia não encontrada.' });
    return;
  }

  await db.transaction().execute(async (trx) => {
    await trx
      .updateTable('reports')
      .set({ status: parsed.data.status, decided_by: req.user!.sub, decided_at: new Date() })
      .where('id', '=', id)
      .execute();

    // Denuncia procedente suspende o anuncio na hora - e' o gatilho do
    // Marco Civil art. 21 para conteudo intimo sem consentimento: a
    // remocao nao espera ordem judicial quando a notificacao e' direta.
    if (parsed.data.status === 'aprovado') {
      await trx
        .updateTable('professional_profiles')
        .set({ status: 'suspenso' })
        .where('id', '=', denuncia.target_profile_id)
        .execute();
    }
  });

  await registrarAuditoria(
    req.user!.sub,
    parsed.data.status === 'aprovado' ? 'Procedeu denúncia e suspendeu anúncio' : 'Arquivou denúncia',
    denuncia.target_name,
  );
  res.json({ ok: true });
});

moderationRouter.get('/audit-log', async (req, res) => {
  // Gerente ve so as proprias acoes; master ve o log inteiro - mesma
  // distincao que ja estava desenhada no plano estrategico e no painel
  // mockado.
  let query = db
    .selectFrom('audit_log')
    .leftJoin('users', 'users.id', 'audit_log.actor_user_id')
    .select(['audit_log.id', 'audit_log.action', 'audit_log.target', 'audit_log.created_at', 'users.name as actor_name', 'users.role as actor_role'])
    .orderBy('audit_log.created_at', 'desc')
    .limit(200);

  if (req.user!.role === 'gerente') {
    query = query.where('audit_log.actor_user_id', '=', req.user!.sub);
  }

  const registros = await query.execute();
  res.json({ registros });
});
