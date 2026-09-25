import { Router } from 'express';
import { z } from 'zod';
import { db } from '../lib/db';
import { autenticar, exigirPapel } from '../middleware/auth';
import { registrarAuditoria } from '../lib/audit';
import { removerArquivoPelaUrl } from '../lib/uploads';
import { caminhoDocumento } from '../lib/documentUploads';

export const moderationRouter = Router();
moderationRouter.use(autenticar, exigirPapel('gerente', 'master'));

moderationRouter.get('/profiles/pending', async (_req, res) => {
  // thumbnail_url vem da galeria de verdade (media aprovada), nao de
  // cover_image - esse campo nunca e' preenchido no fluxo real de
  // cadastro (/anunciar so grava em `media`), entao sempre aparecia
  // "Sem foto" mesmo pra perfis com fotos aprovadas. approved_photos
  // vai junto pro gerente ver de cara se ja da pra aprovar - o botao
  // de decidir tambem barra no servidor, isto e' so pra nao
  // surpreender no clique.
  const perfis = await db
    .selectFrom('professional_profiles')
    .select((eb) => [
      'professional_profiles.id', 'professional_profiles.slug', 'professional_profiles.stage_name',
      'professional_profiles.age', 'professional_profiles.city', 'professional_profiles.category',
      'professional_profiles.whatsapp', 'professional_profiles.submitted_at',
      eb.selectFrom('media')
        .select('media.url')
        .whereRef('media.profile_id', '=', 'professional_profiles.id')
        .where('media.status', '=', 'aprovado')
        .orderBy('media.position', 'asc')
        .limit(1)
        .as('thumbnail_url'),
      eb.selectFrom('media')
        .select(eb.fn.countAll<number>().as('c'))
        .whereRef('media.profile_id', '=', 'professional_profiles.id')
        .where('media.status', '=', 'aprovado')
        .as('approved_photos'),
    ])
    .where('professional_profiles.status', '=', 'pendente')
    .orderBy('professional_profiles.submitted_at', 'asc')
    .execute();
  res.json({ perfis: perfis.map((p) => ({ ...p, approved_photos: Number(p.approved_photos) })) });
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

  if (parsed.data.status === 'aprovado') {
    // Nunca publicar perfil sem nenhuma foto real - e' exatamente o
    // problema que a moderacao manual deixou passar antes disso existir.
    const { count } = await db
      .selectFrom('media')
      .select(db.fn.countAll<number>().as('count'))
      .where('profile_id', '=', id)
      .where('status', '=', 'aprovado')
      .executeTakeFirstOrThrow();
    if (Number(count) === 0) {
      res.status(400).json({ erro: 'Este perfil ainda não tem nenhuma foto aprovada. Aprove ao menos uma foto antes de publicar o anúncio.' });
      return;
    }
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

moderationRouter.get('/media/pending', async (_req, res) => {
  const fotos = await db
    .selectFrom('media')
    .innerJoin('professional_profiles', 'professional_profiles.id', 'media.profile_id')
    .select([
      'media.id', 'media.url', 'media.created_at',
      'professional_profiles.stage_name as profile_name', 'professional_profiles.slug as profile_slug',
    ])
    .where('media.status', '=', 'pendente')
    .orderBy('media.created_at', 'asc')
    .execute();
  res.json({ fotos });
});

moderationRouter.post('/media/:id/decide', async (req, res) => {
  const parsed = decisaoSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ erro: 'Informe status: aprovado ou reprovado.' });
    return;
  }
  const id = Number(req.params.id);
  const foto = await db
    .selectFrom('media')
    .innerJoin('professional_profiles', 'professional_profiles.id', 'media.profile_id')
    .select(['media.id', 'media.url', 'professional_profiles.stage_name as profile_name'])
    .where('media.id', '=', id)
    .executeTakeFirst();
  if (!foto) {
    res.status(404).json({ erro: 'Foto não encontrada.' });
    return;
  }

  await db.updateTable('media').set({ status: parsed.data.status }).where('id', '=', id).execute();
  // Reprovada nao aparece em lugar nenhum - libera o espaco em disco em
  // vez de acumular arquivo orfao que ninguem vai ver de novo.
  if (parsed.data.status === 'reprovado') removerArquivoPelaUrl(foto.url);

  await registrarAuditoria(
    req.user!.sub,
    parsed.data.status === 'aprovado' ? 'Aprovou foto' : 'Reprovou foto',
    foto.profile_name,
  );
  res.json({ ok: true });
});

moderationRouter.get('/documents/pending', async (_req, res) => {
  const documentos = await db
    .selectFrom('verifications')
    .innerJoin('users', 'users.id', 'verifications.user_id')
    .leftJoin('professional_profiles', 'professional_profiles.user_id', 'verifications.user_id')
    .select([
      'verifications.user_id', 'verifications.updated_at', 'users.name as user_name',
      'professional_profiles.slug as profile_slug', 'professional_profiles.stage_name as profile_name',
    ])
    .where('verifications.documento_status', '=', 'pendente')
    .where('verifications.documento_url', 'is not', null)
    .orderBy('verifications.updated_at', 'asc')
    .execute();
  res.json({ documentos });
});

// Nunca serve o documento por URL publica: so essa rota autenticada le
// o arquivo do disco privado e devolve pro gerente/master.
moderationRouter.get('/documents/:userId/file', async (req, res) => {
  const userId = Number(req.params.userId);
  const verificacao = await db
    .selectFrom('verifications')
    .select('documento_url')
    .where('user_id', '=', userId)
    .executeTakeFirst();
  if (!verificacao?.documento_url) {
    res.status(404).json({ erro: 'Documento não encontrado.' });
    return;
  }
  res.sendFile(caminhoDocumento(verificacao.documento_url));
});

moderationRouter.post('/documents/:userId/decide', async (req, res) => {
  const parsed = decisaoSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ erro: 'Informe status: aprovado ou reprovado.' });
    return;
  }
  const userId = Number(req.params.userId);
  const alvo = await db
    .selectFrom('verifications')
    .innerJoin('users', 'users.id', 'verifications.user_id')
    .select(['verifications.user_id', 'users.name as user_name'])
    .where('verifications.user_id', '=', userId)
    .executeTakeFirst();
  if (!alvo) {
    res.status(404).json({ erro: 'Documento não encontrado.' });
    return;
  }

  await db
    .updateTable('verifications')
    .set({ documento_status: parsed.data.status, revisado_por: req.user!.sub, revisado_em: new Date() })
    .where('user_id', '=', userId)
    .execute();

  await registrarAuditoria(
    req.user!.sub,
    parsed.data.status === 'aprovado' ? 'Aprovou documento' : 'Reprovou documento',
    alvo.user_name,
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
