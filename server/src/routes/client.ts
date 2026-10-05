import { Router } from 'express';
import { z } from 'zod';
import { db } from '../lib/db';
import { autenticar, exigirPapel } from '../middleware/auth';
import { hashSenha, conferirSenha } from '../lib/auth';
import { comVerificacao, paraPerfilPublico } from '../lib/publicProfile';

/* Painel do contratante (cliente): a conta nao tinha nenhuma
   funcionalidade depois do login - clicar no nome so' levava pra
   home, sem nada acontecer. Favoritos da' um motivo real pra ter
   conta em vez de so navegar anonimo. */
export const clientRouter = Router();
clientRouter.use(autenticar, exigirPapel('contratante'));

const atualizarSchema = z
  .object({
    name: z.string().trim().min(2).max(120).optional(),
    senha_atual: z.string().min(1).optional(),
    nova_senha: z.string().min(8, 'A nova senha precisa ter ao menos 8 caracteres.').optional(),
  })
  .refine((d) => !d.nova_senha || !!d.senha_atual, { message: 'Informe a senha atual pra trocar de senha.' });

clientRouter.patch('/me', async (req, res) => {
  const parsed = atualizarSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ erro: parsed.error.errors[0]?.message ?? 'Dados inválidos.' });
    return;
  }
  const { name, senha_atual, nova_senha } = parsed.data;

  const update: { name?: string; password_hash?: string } = {};
  if (name) update.name = name;

  if (nova_senha) {
    const user = await db.selectFrom('users').select('password_hash').where('id', '=', req.user!.sub).executeTakeFirstOrThrow();
    const confere = await conferirSenha(senha_atual!, user.password_hash);
    if (!confere) {
      res.status(400).json({ erro: 'Senha atual incorreta.' });
      return;
    }
    update.password_hash = await hashSenha(nova_senha);
  }

  if (Object.keys(update).length > 0) {
    await db.updateTable('users').set(update).where('id', '=', req.user!.sub).execute();
  }
  res.json({ ok: true });
});

clientRouter.get('/favorites', async (req, res) => {
  const linhas = await comVerificacao()
    .innerJoin('favorites', 'favorites.profile_id', 'professional_profiles.id')
    .where('favorites.user_id', '=', req.user!.sub)
    .orderBy('favorites.created_at', 'desc')
    .execute();
  res.json({ favoritos: linhas.map(paraPerfilPublico) });
});

clientRouter.post('/favorites/:slug', async (req, res) => {
  const perfil = await db
    .selectFrom('professional_profiles')
    .select('id')
    .where('slug', '=', req.params.slug)
    .where('status', '=', 'aprovado')
    .executeTakeFirst();
  if (!perfil) {
    res.status(404).json({ erro: 'Perfil não encontrado.' });
    return;
  }
  await db
    .insertInto('favorites')
    .values({ user_id: req.user!.sub, profile_id: perfil.id })
    .onDuplicateKeyUpdate({ user_id: req.user!.sub })
    .execute();
  res.status(201).json({ ok: true });
});

clientRouter.delete('/favorites/:slug', async (req, res) => {
  const perfil = await db.selectFrom('professional_profiles').select('id').where('slug', '=', req.params.slug).executeTakeFirst();
  if (!perfil) {
    res.status(404).json({ erro: 'Perfil não encontrado.' });
    return;
  }
  await db.deleteFrom('favorites').where('user_id', '=', req.user!.sub).where('profile_id', '=', perfil.id).execute();
  res.json({ ok: true });
});

clientRouter.get('/reports', async (req, res) => {
  const denuncias = await db
    .selectFrom('reports')
    .innerJoin('professional_profiles', 'professional_profiles.id', 'reports.target_profile_id')
    .select([
      'reports.id', 'reports.reason', 'reports.status', 'reports.created_at',
      'professional_profiles.stage_name as target_name', 'professional_profiles.slug as target_slug',
    ])
    .where('reports.reporter_user_id', '=', req.user!.sub)
    .orderBy('reports.created_at', 'desc')
    .execute();
  res.json({ denuncias });
});
