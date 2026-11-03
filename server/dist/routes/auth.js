"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
const express_1 = require("express");
const zod_1 = require("zod");
const db_1 = require("../lib/db");
const auth_1 = require("../lib/auth");
const slug_1 = require("../lib/slug");
const auth_2 = require("../middleware/auth");
const rateLimit_1 = require("../lib/rateLimit");
const email_1 = require("../lib/email");
const cpf_1 = require("../lib/cpf");
const audit_1 = require("../lib/audit");
exports.authRouter = (0, express_1.Router)();
const cadastroBase = zod_1.z.object({
    name: zod_1.z.string().trim().min(2).max(120),
    email: zod_1.z.string().trim().toLowerCase().email(),
    password: zod_1.z.string().min(8, 'A senha precisa ter ao menos 8 caracteres.'),
});
// Cadastro publico so cria profissional ou contratante. Master e
// gerente sao criados a mao pelo master, via rota administrativa - so
// assim ninguem vira admin se autocadastrando.
const cadastroSchema = zod_1.z.discriminatedUnion('role', [
    cadastroBase.extend({
        role: zod_1.z.literal('contratante'),
    }),
    cadastroBase.extend({
        role: zod_1.z.literal('profissional'),
        city: zod_1.z.string().trim().min(1),
        // Opcional so' pra nao quebrar o front antigo durante o deploy.
        uf: zod_1.z.string().trim().length(2).toUpperCase().default('MG'),
        category: zod_1.z.enum(['Mulheres', 'Trans']),
        age: zod_1.z.number().int().min(18).max(99),
        whatsapp: zod_1.z.string().trim().min(10).max(20),
        cpf: zod_1.z.string().trim().min(11).max(14),
    }),
]);
exports.authRouter.post('/register', rateLimit_1.registerLimiter, async (req, res) => {
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
        if (!(0, cpf_1.cpfValido)(dados.cpf)) {
            res.status(400).json({ erro: 'CPF inválido. Confira os números.' });
            return;
        }
        const cpfEmUso = await db_1.db.selectFrom('professional_profiles').select('id').where('cpf_hash', '=', (0, cpf_1.hashCpf)(dados.cpf)).executeTakeFirst();
        if (cpfEmUso) {
            res.status(409).json({ erro: 'Já existe uma conta de anunciante com este CPF. Use "Esqueci minha senha" na tela de login para recuperar o acesso.' });
            return;
        }
        const cidade = await db_1.db
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
    const existente = await db_1.db.selectFrom('users').select('id').where('email', '=', dados.email).executeTakeFirst();
    if (existente) {
        res.status(409).json({ erro: 'Já existe uma conta com este e-mail.' });
        return;
    }
    const passwordHash = await (0, auth_1.hashSenha)(dados.password);
    const resultado = await db_1.db.transaction().execute(async (trx) => {
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
                slug: (0, slug_1.slugUnico)(dados.name),
                stage_name: dados.name,
                age: dados.age,
                city: dados.city,
                uf: dados.uf,
                category: dados.category,
                whatsapp: dados.whatsapp.replace(/\D/g, ''),
                cpf_hash: (0, cpf_1.hashCpf)(dados.cpf),
                cpf_mascara: (0, cpf_1.mascararCpf)(dados.cpf),
                status: 'rascunho',
            })
                .execute();
        }
        return userId;
    });
    // Falha no envio nao derruba o cadastro - da' pra pedir outro codigo
    // pelo painel.
    (0, email_1.enviarCodigo)(resultado, dados.email, 'confirmacao').catch((err) => console.error('Falha ao enviar codigo de confirmacao:', err));
    const token = (0, auth_1.emitirToken)({ sub: resultado, role: dados.role, name: dados.name });
    res.status(201).json({ token, user: { id: resultado, role: dados.role, name: dados.name } });
});
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().trim().toLowerCase().email(),
    password: zod_1.z.string().min(1),
});
exports.authRouter.post('/login', rateLimit_1.loginLimiter, async (req, res) => {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ erro: 'Informe e-mail e senha.' });
        return;
    }
    const usuario = await db_1.db
        .selectFrom('users')
        .select(['id', 'role', 'name', 'password_hash'])
        .where('email', '=', parsed.data.email)
        .executeTakeFirst();
    // Mensagem identica para e-mail inexistente e senha errada: distinguir
    // os dois casos deixa mais facil descobrir quais e-mails tem conta.
    const senhaConfere = usuario ? await (0, auth_1.conferirSenha)(parsed.data.password, usuario.password_hash) : false;
    if (!usuario || !senhaConfere) {
        res.status(401).json({ erro: 'E-mail ou senha incorretos.' });
        return;
    }
    const token = (0, auth_1.emitirToken)({ sub: usuario.id, role: usuario.role, name: usuario.name });
    res.json({ token, user: { id: usuario.id, role: usuario.role, name: usuario.name } });
});
// ---- confirmacao de e-mail ----
exports.authRouter.post('/email/codigo', auth_2.autenticar, rateLimit_1.emailCodeLimiter, async (req, res) => {
    const user = await db_1.db.selectFrom('users').select(['id', 'email']).where('id', '=', req.user.sub).executeTakeFirstOrThrow();
    try {
        await (0, email_1.enviarCodigo)(user.id, user.email, 'confirmacao');
    }
    catch (err) {
        console.error('Falha ao enviar codigo de confirmacao:', err);
        res.status(502).json({ erro: 'Não foi possível enviar o e-mail agora. Tente de novo em alguns minutos.' });
        return;
    }
    res.json({ ok: true, email: user.email });
});
exports.authRouter.post('/email/confirmar', auth_2.autenticar, rateLimit_1.codeCheckLimiter, async (req, res) => {
    const codigo = typeof req.body?.codigo === 'string' ? req.body.codigo : '';
    if (!(await (0, email_1.conferirCodigo)(req.user.sub, 'confirmacao', codigo))) {
        res.status(400).json({ erro: 'Código inválido ou expirado. Confira o e-mail ou peça um novo código.' });
        return;
    }
    await db_1.db.updateTable('verifications').set({ email_confirmado: 1 }).where('user_id', '=', req.user.sub).execute();
    res.json({ ok: true });
});
// ---- esqueci a senha ----
const esqueciSchema = zod_1.z.object({ email: zod_1.z.string().trim().toLowerCase().email() });
// Responde igual exista ou nao a conta, pra nao revelar quais e-mails
// estao cadastrados.
exports.authRouter.post('/senha/esqueci', rateLimit_1.emailCodeLimiter, async (req, res) => {
    const parsed = esqueciSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ erro: 'Informe um e-mail válido.' });
        return;
    }
    const user = await db_1.db.selectFrom('users').select(['id', 'email']).where('email', '=', parsed.data.email).executeTakeFirst();
    if (user) {
        (0, email_1.enviarCodigo)(user.id, user.email, 'senha').catch((err) => console.error('Falha ao enviar codigo de senha:', err));
    }
    res.json({ ok: true });
});
const redefinirSchema = zod_1.z.object({
    email: zod_1.z.string().trim().toLowerCase().email(),
    codigo: zod_1.z.string().trim().min(1),
    nova_senha: zod_1.z.string().min(8, 'A nova senha precisa ter ao menos 8 caracteres.'),
});
exports.authRouter.post('/senha/redefinir', rateLimit_1.codeCheckLimiter, async (req, res) => {
    const parsed = redefinirSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ erro: parsed.error.errors[0]?.message ?? 'Dados inválidos.' });
        return;
    }
    const user = await db_1.db.selectFrom('users').select('id').where('email', '=', parsed.data.email).executeTakeFirst();
    if (!user || !(await (0, email_1.conferirCodigo)(user.id, 'senha', parsed.data.codigo))) {
        res.status(400).json({ erro: 'Código inválido ou expirado. Peça um novo código.' });
        return;
    }
    await db_1.db.updateTable('users').set({ password_hash: await (0, auth_1.hashSenha)(parsed.data.nova_senha) }).where('id', '=', user.id).execute();
    // Quem recebeu o codigo no e-mail provou que e' dona dele.
    await db_1.db.updateTable('verifications').set({ email_confirmado: 1 }).where('user_id', '=', user.id).execute();
    res.json({ ok: true });
});
// Unica forma de virar master/gerente: o master cria a mao. O
// cadastro publico (acima) recusa de proposito essas roles - ninguem
// vira admin se autocadastrando.
const staffSchema = cadastroBase.extend({
    role: zod_1.z.enum(['gerente', 'master']),
});
exports.authRouter.post('/staff', auth_2.autenticar, (0, auth_2.exigirPapel)('master'), async (req, res) => {
    const parsed = staffSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ erro: 'Dados inválidos.', detalhes: parsed.error.flatten() });
        return;
    }
    const dados = parsed.data;
    const existente = await db_1.db.selectFrom('users').select('id').where('email', '=', dados.email).executeTakeFirst();
    if (existente) {
        res.status(409).json({ erro: 'Já existe uma conta com este e-mail.' });
        return;
    }
    const passwordHash = await (0, auth_1.hashSenha)(dados.password);
    const userId = await db_1.db.transaction().execute(async (trx) => {
        const userInsert = await trx
            .insertInto('users')
            .values({ role: dados.role, name: dados.name, email: dados.email, password_hash: passwordHash })
            .executeTakeFirstOrThrow();
        const id = Number(userInsert.insertId);
        await trx.insertInto('verifications').values({ user_id: id }).execute();
        return id;
    });
    await (0, audit_1.registrarAuditoria)(req.user.sub, dados.role === 'master' ? 'Criou conta de master' : 'Criou conta de gerente', dados.name);
    res.status(201).json({ user: { id: userId, role: dados.role, name: dados.name, email: dados.email } });
});
exports.authRouter.get('/staff', auth_2.autenticar, (0, auth_2.exigirPapel)('master'), async (_req, res) => {
    const equipe = await db_1.db
        .selectFrom('users')
        .select(['id', 'name', 'email', 'role', 'created_at'])
        .where('role', 'in', ['master', 'gerente'])
        .orderBy('created_at', 'asc')
        .execute();
    res.json({ equipe });
});
const atualizarStaffSchema = zod_1.z.object({
    role: zod_1.z.enum(['gerente', 'master']).optional(),
    name: zod_1.z.string().trim().min(2).max(120).optional(),
});
exports.authRouter.patch('/staff/:id', auth_2.autenticar, (0, auth_2.exigirPapel)('master'), async (req, res) => {
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
    const membro = await db_1.db
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
        const outrosMasters = await db_1.db
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
    const updateFields = {};
    if (dados.role)
        updateFields.role = dados.role;
    if (dados.name)
        updateFields.name = dados.name;
    await db_1.db.updateTable('users').set(updateFields).where('id', '=', targetId).execute();
    const alteracoes = [];
    if (dados.role && dados.role !== membro.role) {
        alteracoes.push(`papel alterado para ${dados.role === 'master' ? 'Admin Master' : 'Gerente'}`);
    }
    if (dados.name && dados.name !== membro.name) {
        alteracoes.push(`nome alterado para ${dados.name}`);
    }
    await (0, audit_1.registrarAuditoria)(req.user.sub, `Atualizou permissões do membro (${alteracoes.join(', ') || 'dados'})`, membro.name);
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
exports.authRouter.delete('/staff/:id', auth_2.autenticar, (0, auth_2.exigirPapel)('master'), async (req, res) => {
    const targetId = Number(req.params.id);
    if (!Number.isFinite(targetId) || targetId <= 0) {
        res.status(400).json({ erro: 'ID de usuário inválido.' });
        return;
    }
    if (targetId === req.user.sub) {
        res.status(400).json({ erro: 'Você não pode excluir sua própria conta.' });
        return;
    }
    const membro = await db_1.db
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
        const outrosMasters = await db_1.db
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
    await db_1.db.deleteFrom('users').where('id', '=', targetId).where('role', 'in', ['master', 'gerente']).execute();
    await (0, audit_1.registrarAuditoria)(req.user.sub, `Excluiu membro da equipe (${membro.role === 'master' ? 'Admin Master' : 'Gerente'})`, membro.name);
    res.json({ ok: true });
});
exports.authRouter.get('/me', auth_2.autenticar, async (req, res) => {
    const usuario = await db_1.db
        .selectFrom('users')
        .select(['id', 'role', 'name', 'email'])
        .where('id', '=', req.user.sub)
        .executeTakeFirst();
    if (!usuario) {
        res.status(404).json({ erro: 'Usuário não encontrado.' });
        return;
    }
    res.json({ user: usuario });
});
