import { Router } from 'express';
import { z } from 'zod';
import { db } from '../lib/db';
import { hashSenha, conferirSenha, emitirToken } from '../lib/auth';
import { slugUnico } from '../lib/slug';
import { autenticar, exigirPapel } from '../middleware/auth';
import { loginLimiter, registerLimiter, emailCodeLimiter, codeCheckLimiter } from '../lib/rateLimit';
import { enviarCodigo, conferirCodigo } from '../lib/email';
import { cpfValido, hashCpf, mascararCpf } from '../lib/cpf';
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
    // Opcional so' pra nao quebrar o front antigo durante o deploy.
    uf: z.string().trim().length(2).toUpperCase().default('MG'),
    category: z.enum(['Mulheres', 'Trans']),
    age: z.number().int().min(18).max(99),
    whatsapp: z.string().trim().min(10).max(20),
    cpf: z.string().trim().min(11).max(14),
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
    // Um cadastro de anunciante por pessoa.
    if (!cpfValido(dados.cpf)) {
      res.status(400).json({ erro: 'CPF inválido. Confira os números.' });
      return;
    }
    const cpfEmUso = await db.selectFrom('professional_profiles').select('id').where('cpf_hash', '=', hashCpf(dados.cpf)).executeTakeFirst();
    if (cpfEmUso) {
      res.status(409).json({ erro: 'Já existe uma conta de anunciante com este CPF. Use "Esqueci minha senha" na tela de login para recuperar o acesso.' });
      return;
    }
    const cidade = await db
      .selectFrom('cities')
      .select('id')
      .where('name', '=', dados.city)
      .where('uf', '=', dados.uf)
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
          uf: dados.uf,
          category: dados.category,
          whatsapp: dados.whatsapp.replace(/\D/g, ''),
          cpf_hash: hashCpf(dados.cpf),
          cpf_mascara: mascararCpf(dados.cpf),
          status: 'rascunho',
        })
        .execute();
    }

    return userId;
  });

  // Falha no envio nao derruba o cadastro - da' pra pedir outro codigo
  // pelo painel.
  enviarCodigo(resultado, dados.email, 'confirmacao').catch((err) => console.error('Falha ao enviar codigo de confirmacao:', err));

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

// ---- confirmacao de e-mail ----

authRouter.post('/email/codigo', autenticar, emailCodeLimiter, async (req, res) => {
  const user = await db.selectFrom('users').select(['id', 'email']).where('id', '=', req.user!.sub).executeTakeFirstOrThrow();
  try {
    await enviarCodigo(user.id, user.email, 'confirmacao');
  } catch (err) {
    console.error('Falha ao enviar codigo de confirmacao:', err);
    res.status(502).json({ erro: 'Não foi possível enviar o e-mail agora. Tente de novo em alguns minutos.' });
    return;
  }
  res.json({ ok: true, email: user.email });
});

authRouter.post('/email/confirmar', autenticar, codeCheckLimiter, async (req, res) => {
  const codigo = typeof req.body?.codigo === 'string' ? req.body.codigo : '';
  if (!(await conferirCodigo(req.user!.sub, 'confirmacao', codigo))) {
    res.status(400).json({ erro: 'Código inválido ou expirado. Confira o e-mail ou peça um novo código.' });
    return;
  }
  await db.updateTable('verifications').set({ email_confirmado: 1 }).where('user_id', '=', req.user!.sub).execute();
  res.json({ ok: true });
});

// ---- esqueci a senha ----

const esqueciSchema = z.object({ email: z.string().trim().toLowerCase().email() });

// Responde igual exista ou nao a conta, pra nao revelar quais e-mails
// estao cadastrados.
authRouter.post('/senha/esqueci', emailCodeLimiter, async (req, res) => {
  const parsed = esqueciSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ erro: 'Informe um e-mail válido.' });
    return;
  }
  const user = await db.selectFrom('users').select(['id', 'email']).where('email', '=', parsed.data.email).executeTakeFirst();
  if (user) {
    enviarCodigo(user.id, user.email, 'senha').catch((err) => console.error('Falha ao enviar codigo de senha:', err));
  }
  res.json({ ok: true });
});

const redefinirSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  codigo: z.string().trim().min(1),
  nova_senha: z.string().min(8, 'A nova senha precisa ter ao menos 8 caracteres.'),
});

authRouter.post('/senha/redefinir', codeCheckLimiter, async (req, res) => {
  const parsed = redefinirSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ erro: parsed.error.errors[0]?.message ?? 'Dados inválidos.' });
    return;
  }
  const user = await db.selectFrom('users').select('id').where('email', '=', parsed.data.email).executeTakeFirst();
  if (!user || !(await conferirCodigo(user.id, 'senha', parsed.data.codigo))) {
    res.status(400).json({ erro: 'Código inválido ou expirado. Peça um novo código.' });
    return;
  }
  await db.updateTable('users').set({ password_hash: await hashSenha(parsed.data.nova_senha) }).where('id', '=', user.id).execute();
  // Quem recebeu o codigo no e-mail provou que e' dona dele.
  await db.updateTable('verifications').set({ email_confirmado: 1 }).where('user_id', '=', user.id).execute();
  res.json({ ok: true });
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

const atualizarStaffSchema = z.object({
  role: z.enum(['gerente', 'master']).optional(),
  name: z.string().trim().min(2).max(120).optional(),
});

authRouter.patch('/staff/:id', autenticar, exigirPapel('master'), async (req, res) => {
  const targetId = Number(req.params.id);
  if (!Number.isFinite(targetId) || targetId <= 0) {
    res.status(400).json({ erro: 'ID de usuário inválido.' });
    return;
  }

  const parsed = atualizarStaffSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ erro: 'Dados inválidos.', detalhes: parsed.error.flatten() });
    return;
  }
  const dados = parsed.data;
  if (!dados.role && !dados.name) {
    res.status(400).json({ erro: 'Nenhum dado informado para atualização.' });
    return;
  }

  const membro = await db
    .selectFrom('users')
    .select(['id', 'name', 'email', 'role'])
    .where('id', '=', targetId)
    .where('role', 'in', ['master', 'gerente'])
    .executeTakeFirst();

  if (!membro) {
    res.status(404).json({ erro: 'Membro da equipe não encontrado.' });
    return;
  }

  // Se estiver tentando alterar de master para gerente, garante que reste pelo menos 1 outro master
  if (dados.role && dados.role !== 'master' && membro.role === 'master') {
    const outrosMasters = await db
      .selectFrom('users')
      .select('id')
      .where('role', '=', 'master')
      .where('id', '!=', targetId)
      .execute();
    if (outrosMasters.length === 0) {
      res.status(400).json({ erro: 'Não é possível remover a permissão do único Admin Master do sistema.' });
      return;
    }
  }

  const updateFields: { role?: 'gerente' | 'master'; name?: string } = {};
  if (dados.role) updateFields.role = dados.role;
  if (dados.name) updateFields.name = dados.name;

  await db.updateTable('users').set(updateFields).where('id', '=', targetId).execute();

  const alteracoes: string[] = [];
  if (dados.role && dados.role !== membro.role) {
    alteracoes.push(`papel alterado para ${dados.role === 'master' ? 'Admin Master' : 'Gerente'}`);
  }
  if (dados.name && dados.name !== membro.name) {
    alteracoes.push(`nome alterado para ${dados.name}`);
  }

  await registrarAuditoria(
    req.user!.sub,
    `Atualizou permissões do membro (${alteracoes.join(', ') || 'dados'})`,
    membro.name,
  );

  res.json({
    ok: true,
    user: {
      id: membro.id,
      role: dados.role ?? membro.role,
      name: dados.name ?? membro.name,
      email: membro.email,
    },
  });
});

authRouter.delete('/staff/:id', autenticar, exigirPapel('master'), async (req, res) => {
  const targetId = Number(req.params.id);
  if (!Number.isFinite(targetId) || targetId <= 0) {
    res.status(400).json({ erro: 'ID de usuário inválido.' });
    return;
  }

  if (targetId === req.user!.sub) {
    res.status(400).json({ erro: 'Você não pode excluir sua própria conta.' });
    return;
  }

  const membro = await db
    .selectFrom('users')
    .select(['id', 'name', 'email', 'role'])
    .where('id', '=', targetId)
    .where('role', 'in', ['master', 'gerente'])
    .executeTakeFirst();

  if (!membro) {
    res.status(404).json({ erro: 'Membro da equipe não encontrado.' });
    return;
  }

  if (membro.role === 'master') {
    const outrosMasters = await db
      .selectFrom('users')
      .select('id')
      .where('role', '=', 'master')
      .where('id', '!=', targetId)
      .execute();
    if (outrosMasters.length === 0) {
      res.status(400).json({ erro: 'Não é possível excluir o único Admin Master do sistema.' });
      return;
    }
  }

  await db.deleteFrom('users').where('id', '=', targetId).where('role', 'in', ['master', 'gerente']).execute();

  await registrarAuditoria(
    req.user!.sub,
    `Excluiu membro da equipe (${membro.role === 'master' ? 'Admin Master' : 'Gerente'})`,
    membro.name,
  );

  res.json({ ok: true });
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
