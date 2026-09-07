import { Router } from 'express';
import { z } from 'zod';
import { db } from '../lib/db';
import { autenticar, exigirPapel } from '../middleware/auth';

export const profilesRouter = Router();

const CAMPOS_PUBLICOS = [
  'slug', 'stage_name', 'age', 'city', 'neighborhood', 'category',
  'tagline', 'bio', 'hourly_rate', 'whatsapp', 'is_vip', 'cover_image',
] as const;

// Diretorio publico: only 'aprovado' aparece. E' o portao central do
// produto - nada entra aqui sem passar pela fila do gerente.
profilesRouter.get('/', async (req, res) => {
  const { city, category } = req.query;
  let query = db.selectFrom('professional_profiles').select(CAMPOS_PUBLICOS).where('status', '=', 'aprovado');
  if (typeof city === 'string' && city !== 'Todas') query = query.where('city', '=', city);
  if (typeof category === 'string' && category !== 'Todas') query = query.where('category', '=', category as any);
  const perfis = await query.orderBy('is_vip', 'desc').orderBy('created_at', 'desc').execute();
  res.json({ perfis });
});

profilesRouter.get('/me', autenticar, exigirPapel('profissional'), async (req, res) => {
  const perfil = await db
    .selectFrom('professional_profiles')
    .selectAll()
    .where('user_id', '=', req.user!.sub)
    .executeTakeFirst();
  if (!perfil) {
    res.status(404).json({ erro: 'Perfil não encontrado para esta conta.' });
    return;
  }
  res.json({ perfil });
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

// Fica depois da rota /me de proposito: caso contrario "/me" seria
// interpretado como um valor de :slug.
profilesRouter.get('/:slug', async (req, res) => {
  const perfil = await db
    .selectFrom('professional_profiles')
    .select(CAMPOS_PUBLICOS)
    .where('slug', '=', req.params.slug)
    .where('status', '=', 'aprovado')
    .executeTakeFirst();
  if (!perfil) {
    res.status(404).json({ erro: 'Perfil não encontrado.' });
    return;
  }
  res.json({ perfil });
});
