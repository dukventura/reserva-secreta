import { Router } from 'express';
import { z } from 'zod';
import multer from 'multer';
import { db } from '../lib/db';
import { autenticar, exigirPapel } from '../middleware/auth';
import { uploadFoto, urlPublicaUpload, removerArquivoPelaUrl, MAX_FOTOS_POR_PERFIL } from '../lib/uploads';

export const profilesRouter = Router();

const CAMPOS_PUBLICOS = [
  'professional_profiles.id', 'professional_profiles.slug', 'professional_profiles.stage_name',
  'professional_profiles.age', 'professional_profiles.city', 'professional_profiles.neighborhood',
  'professional_profiles.height', 'professional_profiles.weight', 'professional_profiles.eyes',
  'professional_profiles.hair', 'professional_profiles.languages', 'professional_profiles.silicone',
  'professional_profiles.tattoos', 'professional_profiles.services', 'professional_profiles.locations',
  'professional_profiles.category', 'professional_profiles.tagline', 'professional_profiles.bio',
  'professional_profiles.hourly_rate', 'professional_profiles.whatsapp', 'professional_profiles.is_vip',
  'professional_profiles.cover_image',
] as const;

function comVerificacao() {
  // isVerified reflete o documento aprovado de verdade (tabela
  // verifications), em vez de um campo redundante que poderia
  // dessincronizar do status real de verificacao.
  return db
    .selectFrom('professional_profiles')
    .leftJoin('verifications', 'verifications.user_id', 'professional_profiles.user_id')
    .select([...CAMPOS_PUBLICOS, 'verifications.documento_status as documento_status'])
    .where('professional_profiles.status', '=', 'aprovado');
}

// mysql2 reconhece o tipo JSON pelo protocolo e ja devolve array/objeto
// desserializado - so cai em string quando o driver nao tem essa info
// (ex: outra lib, ou coluna criada como TEXT puro). Tratamos os dois
// casos para nao depender desse detalhe de driver. Array vazio (nao
// null) poupa checagem extra em todo lugar que itera a lista no front.
function parseJsonArray(valor: unknown): string[] {
  if (Array.isArray(valor)) return valor;
  if (typeof valor === 'string' && valor) {
    try {
      const parsed = JSON.parse(valor);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

function paraPerfilPublico(row: Awaited<ReturnType<ReturnType<typeof comVerificacao>['executeTakeFirst']>>) {
  if (!row) return null;
  const { id: _id, documento_status, languages, services, locations, ...resto } = row;
  return {
    ...resto,
    languages: parseJsonArray(languages),
    services: parseJsonArray(services),
    locations: parseJsonArray(locations),
    is_verified: documento_status === 'aprovado',
  };
}

const categoriaQuerySchema = z.enum(['VIP', 'Mulheres', 'Trans']);

// Diretorio publico: only 'aprovado' aparece. E' o portao central do
// produto - nada entra aqui sem passar pela fila do gerente.
profilesRouter.get('/', async (req, res) => {
  const { city, category } = req.query;
  let query = comVerificacao();
  if (typeof city === 'string' && city !== 'Todas') query = query.where('professional_profiles.city', '=', city);
  if (typeof category === 'string' && category !== 'Todas') {
    const parsed = categoriaQuerySchema.safeParse(category);
    if (!parsed.success) {
      res.status(400).json({ erro: 'Categoria inválida.' });
      return;
    }
    query = query.where('professional_profiles.category', '=', parsed.data);
  }
  const linhas = await query
    .orderBy('professional_profiles.is_vip', 'desc')
    .orderBy('professional_profiles.created_at', 'desc')
    .execute();
  res.json({ perfis: linhas.map(paraPerfilPublico) });
});

profilesRouter.get('/me', autenticar, exigirPapel('profissional'), async (req, res) => {
  const perfil = await db
    .selectFrom('professional_profiles')
    .leftJoin('verifications', 'verifications.user_id', 'professional_profiles.user_id')
    .selectAll('professional_profiles')
    .select([
      'verifications.email_confirmado', 'verifications.telefone_confirmado', 'verifications.documento_status',
    ])
    .where('professional_profiles.user_id', '=', req.user!.sub)
    .executeTakeFirst();
  if (!perfil) {
    res.status(404).json({ erro: 'Perfil não encontrado para esta conta.' });
    return;
  }
  // Ao contrario da galeria publica, aqui mostra qualquer status - e'
  // a propria dona vendo o que ja enviou, incluindo o que ainda esta
  // em fila ou foi reprovado.
  const media = await db
    .selectFrom('media')
    .select(['id', 'url', 'status'])
    .where('profile_id', '=', perfil.id)
    .orderBy('position', 'asc')
    .execute();

  const { languages, services, locations, ...resto } = perfil;
  res.json({
    perfil: {
      ...resto,
      languages: parseJsonArray(languages),
      services: parseJsonArray(services),
      locations: parseJsonArray(locations),
      gallery: media,
    },
  });
});

const edicaoSchema = z.object({
  tagline: z.string().max(255).optional(),
  bio: z.string().max(4000).optional(),
  hourly_rate: z.string().max(40).optional(),
});

profilesRouter.patch('/me', autenticar, exigirPapel('profissional'), async (req, res) => {
  const parsed = edicaoSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ erro: 'Dados inválidos.', detalhes: parsed.error.flatten() });
    return;
  }
  if (Object.keys(parsed.data).length === 0) {
    res.status(400).json({ erro: 'Nada para atualizar.' });
    return;
  }
  await db.updateTable('professional_profiles').set(parsed.data).where('user_id', '=', req.user!.sub).execute();
  res.json({ ok: true });
});

// Rascunho/reprovado -> pendente: e' o unico jeito de entrar na fila do
// gerente. Um perfil aprovado que volta a editar dados sensiveis nao
// perde o selo aqui - so a Fase 2 decide se re-analise e' automatica.
profilesRouter.post('/me/submit', autenticar, exigirPapel('profissional'), async (req, res) => {
  const perfil = await db
    .selectFrom('professional_profiles')
    .select(['id', 'status'])
    .where('user_id', '=', req.user!.sub)
    .executeTakeFirst();

  if (!perfil) {
    res.status(404).json({ erro: 'Perfil não encontrado para esta conta.' });
    return;
  }
  if (perfil.status === 'pendente' || perfil.status === 'aprovado') {
    res.status(409).json({ erro: `Perfil já está com status "${perfil.status}".` });
    return;
  }

  await db
    .updateTable('professional_profiles')
    .set({ status: 'pendente', submitted_at: new Date() })
    .where('id', '=', perfil.id)
    .execute();
  res.json({ ok: true });
});

// Foto nova entra como 'pendente' - mesma logica de moderacao do
// perfil, aplicada por foto: nada aparece na galeria publica sem
// passar pelo gerente primeiro.
profilesRouter.post('/me/media', autenticar, exigirPapel('profissional'), (req, res) => {
  uploadFoto(req, res, async (err: unknown) => {
    if (err) {
      const mensagem = err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE'
        ? 'Arquivo muito grande. Máximo de 5MB.'
        : err instanceof Error ? err.message : 'Não foi possível processar a imagem.';
      res.status(400).json({ erro: mensagem });
      return;
    }
    if (!req.file) {
      res.status(400).json({ erro: 'Nenhuma imagem enviada.' });
      return;
    }

    const perfil = await db
      .selectFrom('professional_profiles')
      .select('id')
      .where('user_id', '=', req.user!.sub)
      .executeTakeFirst();
    if (!perfil) {
      res.status(404).json({ erro: 'Perfil não encontrado para esta conta.' });
      return;
    }

    const { count } = await db
      .selectFrom('media')
      .select(db.fn.countAll<number>().as('count'))
      .where('profile_id', '=', perfil.id)
      .executeTakeFirstOrThrow();
    if (Number(count) >= MAX_FOTOS_POR_PERFIL) {
      removerArquivoPelaUrl(req.file.filename);
      res.status(400).json({ erro: `Limite de ${MAX_FOTOS_POR_PERFIL} fotos por perfil atingido.` });
      return;
    }

    const url = urlPublicaUpload(req.file.filename);
    const inserted = await db
      .insertInto('media')
      .values({ profile_id: perfil.id, url, position: Number(count) })
      .executeTakeFirstOrThrow();

    res.status(201).json({ foto: { id: Number(inserted.insertId), url, status: 'pendente' } });
  });
});

profilesRouter.delete('/me/media/:id', autenticar, exigirPapel('profissional'), async (req, res) => {
  const foto = await db
    .selectFrom('media')
    .innerJoin('professional_profiles', 'professional_profiles.id', 'media.profile_id')
    .select(['media.id', 'media.url'])
    .where('media.id', '=', Number(req.params.id))
    .where('professional_profiles.user_id', '=', req.user!.sub)
    .executeTakeFirst();
  if (!foto) {
    res.status(404).json({ erro: 'Foto não encontrada.' });
    return;
  }

  await db.deleteFrom('media').where('id', '=', foto.id).execute();
  removerArquivoPelaUrl(foto.url);
  res.json({ ok: true });
});

// Fica depois da rota /me de proposito: caso contrario "/me" seria
// interpretado como um valor de :slug.
profilesRouter.get('/:slug', async (req, res) => {
  const row = await comVerificacao().where('professional_profiles.slug', '=', req.params.slug).executeTakeFirst();
  if (!row) {
    res.status(404).json({ erro: 'Perfil não encontrado.' });
    return;
  }

  // So fotos ja aprovadas pelo gerente aparecem na galeria publica -
  // mesma logica de moderacao do perfil, aplicada por foto.
  const media = await db
    .selectFrom('media')
    .select('url')
    .where('profile_id', '=', row.id)
    .where('status', '=', 'aprovado')
    .orderBy('position', 'asc')
    .execute();

  res.json({ perfil: { ...paraPerfilPublico(row), gallery: media.map((m) => m.url) } });
});
