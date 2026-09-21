import { Router } from 'express';
import { z } from 'zod';
import { db } from '../lib/db';
import { hashSenha, conferirSenha, emitirToken } from '../lib/auth';
import { slugUnico } from '../lib/slug';
import { autenticar, exigirPapel } from '../middleware/auth';
import { loginLimiter, registerLimiter } from '../lib/rateLimit';
import { registrarAuditoria } from '../lib/audit';

export const authRouter = Router();

const cadastroBase = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(8, 'A senha precisa ter ao menos 8 caracteres.'),
});

// Cadastro publico so cria profissional ou contratante. Master e
// gerente sao criados a mao pelo master, via rota administrativa - so
// assim ninguem vira admin se autocadastrando.
const cadastroSchema = z.discriminatedUnion('role', [
  cadastroBase.extend({
    role: z.literal('contratante'),
  }),
  cadastroBase.extend({
    role: z.literal('profissional'),
    city: z.string().trim().min(1),
    category: z.enum(['VIP', 'Mulheres', 'Trans']),
    age: z.number().int().min(18).max(99),
    whatsapp: z.string().trim().min(10).max(20),
  }),
]);

authRouter.post('/register', registerLimiter, async (req, res) => {
  const parsed = cadastroSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ erro: 'Dados inválidos.', detalhes: parsed.error.flatten() });
    return;
  }
  const dados = parsed.data;

  // Cidade valida contra a tabela `cities` em vez de um enum fixo no
  // codigo: atender uma cidade nova passa a ser so uma linha no banco.
  if (dados.role === 'profissional') {
    const cidade = await db
      .selectFrom('cities')
      .select('id')
      .where('name', '=', dados.city)
      .where('active', '=', 1)
      .executeTakeFirst();
    if (!cidade) {
      res.status(400).json({ erro: 'Cidade não atendida.' });
      return;
    }
  }

  const existente = await db.selectFrom('users').select('id').where('email', '=', dados.email).executeTakeFirst();
  if (existente) {
    res.status(409).json({ erro: 'Já existe uma conta com este e-mail.' });
    return;
  }

  const passwordHash = await hashSenha(dados.password);

  const resultado = await db.transaction().execute(async (trx) => {
    const userInsert = await trx
      .insertInto('users')
      .values({ role: dados.role, name: dados.name, email: dados.email, password_hash: passwordHash })
      .executeTakeFirstOrThrow();
    const userId = Number(userInsert.insertId);

    await trx.insertInto('verifications').values({ user_id: userId }).execute();

    if (dados.role === 'profissional') {
      await trx
        .insertInto('professional_profiles')
        .values({
          user_id: userId,
          slug: slugUnico(dados.name),
          stage_name: dados.name,
          age: dados.age,
          city: dados.city,
          category: dados.category,
          whatsapp: dados.whatsapp.replace(/\D/g, ''),
          status: 'rascunho',
        })
        .execute();
    }

    return userId;
  });

  const token = emitirToken({ sub: resultado, role: dados.role, name: dados.name });
  res.status(201).json({ token, user: { id: resultado, role: dados.role, name: dados.name } });
});

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1),
});

authRouter.post('/login', loginLimiter, async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ erro: 'Informe e-mail e senha.' });
    return;
  }

  const usuario = await db
    .selectFrom('users')
    .select(['id', 'role', 'name', 'password_hash'])
    .where('email', '=', parsed.data.email)
    .executeTakeFirst();

  // Mensagem identica para e-mail inexistente e senha errada: distinguir
  // os dois casos deixa mais facil descobrir quais e-mails tem conta.
  const senhaConfere = usuario ? await conferirSenha(parsed.data.password, usuario.password_hash) : false;
  if (!usuario || !senhaConfere) {
    res.status(401).json({ erro: 'E-mail ou senha incorretos.' });
    return;
  }

  const token = emitirToken({ sub: usuario.id, role: usuario.role, name: usuario.name });
  res.json({ token, user: { id: usuario.id, role: usuario.role, name: usuario.name } });
});

// Unica forma de virar master/gerente: o master cria a mao. O
// cadastro publico (acima) recusa de proposito essas roles - ninguem
// vira admin se autocadastrando.
const staffSchema = cadastroBase.extend({
  role: z.enum(['gerente', 'master']),
});

authRouter.post('/staff', autenticar, exigirPapel('master'), async (req, res) => {
  const parsed = staffSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ erro: 'Dados inválidos.', detalhes: parsed.error.flatten() });
    return;
  }
  const dados = parsed.data;

  const existente = await db.selectFrom('users').select('id').where('email', '=', dados.email).executeTakeFirst();
  if (existente) {
    res.status(409).json({ erro: 'Já existe uma conta com este e-mail.' });
    return;
  }

  const passwordHash = await hashSenha(dados.password);
  const userId = await db.transaction().execute(async (trx) => {
    const userInsert = await trx
      .insertInto('users')
      .values({ role: dados.role, name: dados.name, email: dados.email, password_hash: passwordHash })
      .executeTakeFirstOrThrow();
    const id = Number(userInsert.insertId);
    await trx.insertInto('verifications').values({ user_id: id }).execute();
    return id;
  });

  await registrarAuditoria(
    req.user!.sub,
    dados.role === 'master' ? 'Criou conta de master' : 'Criou conta de gerente',
    dados.name,
  );

  res.status(201).json({ user: { id: userId, role: dados.role, name: dados.name, email: dados.email } });
});

authRouter.get('/staff', autenticar, exigirPapel('master'), async (_req, res) => {
  const equipe = await db
    .selectFrom('users')
    .select(['id', 'name', 'email', 'role', 'created_at'])
    .where('role', 'in', ['master', 'gerente'])
    .orderBy('created_at', 'asc')
    .execute();
  res.json({ equipe });
});

authRouter.get('/me', autenticar, async (req, res) => {
  const usuario = await db
    .selectFrom('users')
    .select(['id', 'role', 'name', 'email'])
    .where('id', '=', req.user!.sub)
    .executeTakeFirst();

  if (!usuario) {
    res.status(404).json({ erro: 'Usuário não encontrado.' });
    return;
  }
  res.json({ user: usuario });
});
