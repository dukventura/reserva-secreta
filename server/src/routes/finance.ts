import { Router } from 'express';
import { z } from 'zod';
import { sql } from 'kysely';
import { db } from '../lib/db';
import { autenticar, exigirPapel } from '../middleware/auth';
import { registrarAuditoria } from '../lib/audit';
import { ativarPlanoParaUsuario, somarDias } from '../lib/plans';
import { removerArquivoPelaUrl } from '../lib/uploads';
import { removerDocumento } from '../lib/documentUploads';
import { removerSelfie } from '../lib/selfieUploads';
import { caminhoComprovante, removerComprovante } from '../lib/comprovanteUploads';

// Catalogo publico (so planos ativos) - a profissional ve no proprio
// painel o que cada plano oferece.
export const plansPublicRouter = Router();

plansPublicRouter.get('/', async (_req, res) => {
  const planos = await db
    .selectFrom('plans')
    .select(['id', 'nome', 'preco_centavos', 'duracao_dias', 'max_fotos', 'prioridade', 'selo_vip'])
    .where('ativo', '=', 1)
    .orderBy('preco_centavos', 'asc')
    .execute();
  res.json({ planos });
});

// Leitura de cadastros (quem se inscreveu, em que status) - gerente
// tambem usa isso pra moderacao, so' nao mexe em plano/pagamento/
// exclusao de conta, que fica exclusivo do financeRouter abaixo
// (master). Fica num router separado, montado antes do financeRouter
// em index.ts, pra essas duas rotas responderem pro gerente sem abrir
// o resto do financeiro pra esse papel.
export const cadastrosRouter = Router();
cadastrosRouter.use(autenticar, exigirPapel('master', 'gerente'));

cadastrosRouter.get('/subscriptions', async (_req, res) => {
  const assinaturas = await db
    .selectFrom('professional_profiles')
    .innerJoin('users', 'users.id', 'professional_profiles.user_id')
    .leftJoin('subscriptions', 'subscriptions.user_id', 'professional_profiles.user_id')
    .leftJoin('plans', 'plans.id', 'subscriptions.plan_id')
    .select([
      'professional_profiles.user_id', 'professional_profiles.stage_name', 'professional_profiles.is_vip',
      'professional_profiles.boost_ate', 'professional_profiles.status as perfil_status', 'users.email',
      'subscriptions.status', 'subscriptions.vence_em', 'subscriptions.ultimo_pagamento_em', 'subscriptions.plan_id',
      'plans.nome as plano_nome',
    ])
    .orderBy('professional_profiles.stage_name', 'asc')
    .execute();
  res.json({ assinaturas });
});

// Contas de contratante (cliente) nao aparecem em mais nenhum lugar do
// painel - esta rota existe so' pra dar visibilidade de quem se cadastrou.
cadastrosRouter.get('/clientes', async (_req, res) => {
  const clientes = await db
    .selectFrom('users')
    .select(['id', 'name', 'email', 'created_at'])
    .where('role', '=', 'contratante')
    .orderBy('created_at', 'desc')
    .execute();
  res.json({ clientes });
});

// Pagamento ainda e' conciliado fora do site (PIX manual) - estas rotas
// registram o que ja foi recebido. Tudo restrito ao Admin Master.
export const financeRouter = Router();
financeRouter.use(autenticar, exigirPapel('master'));

const planoSchema = z.object({
  nome: z.string().trim().min(2).max(60),
  preco_centavos: z.number().int().min(0),
  duracao_dias: z.number().int().min(1).max(365),
  max_fotos: z.number().int().min(1).max(50),
  prioridade: z.number().int().min(0).max(100),
  selo_vip: z.boolean(),
});

financeRouter.get('/plans', async (_req, res) => {
  const planos = await db.selectFrom('plans').selectAll().orderBy('preco_centavos', 'asc').execute();
  res.json({ planos });
});

financeRouter.post('/plans', async (req, res) => {
  const parsed = planoSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ erro: 'Dados do plano inválidos.', detalhes: parsed.error.flatten() });
    return;
  }
  const d = parsed.data;
  await db.insertInto('plans').values({ ...d, selo_vip: d.selo_vip ? 1 : 0 }).execute();
  await registrarAuditoria(req.user!.sub, 'Criou plano', d.nome);
  res.status(201).json({ ok: true });
});

financeRouter.patch('/plans/:id', async (req, res) => {
  const parsed = planoSchema.extend({ ativo: z.boolean() }).partial().safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ erro: 'Dados do plano inválidos.', detalhes: parsed.error.flatten() });
    return;
  }
  const id = Number(req.params.id);
  const plano = await db.selectFrom('plans').select('nome').where('id', '=', id).executeTakeFirst();
  if (!plano) {
    res.status(404).json({ erro: 'Plano não encontrado.' });
    return;
  }
  const { selo_vip, ativo, ...resto } = parsed.data;
  // Mudar o plano nao altera quem ja assinou ate a proxima ativacao -
  // o selo/prioridade ficam gravados no perfil no momento do pagamento.
  await db
    .updateTable('plans')
    .set({
      ...resto,
      ...(selo_vip !== undefined && { selo_vip: selo_vip ? 1 : 0 }),
      ...(ativo !== undefined && { ativo: ativo ? 1 : 0 }),
    })
    .where('id', '=', id)
    .execute();
  await registrarAuditoria(
    req.user!.sub,
    ativo === false ? 'Desativou plano' : ativo === true ? 'Reativou plano' : 'Editou plano',
    resto.nome ?? plano.nome,
  );
  res.json({ ok: true });
});

// Exclusao definitiva so' e' permitida se o plano nunca foi usado de
// verdade (nenhuma assinatura, pagamento ou pedido referencia ele) -
// senao o historico fica com um plan_id orfao. Planos com uso real
// devem ser desativados, nao excluidos.
financeRouter.delete('/plans/:id', async (req, res) => {
  const id = Number(req.params.id);
  const plano = await db.selectFrom('plans').select('nome').where('id', '=', id).executeTakeFirst();
  if (!plano) {
    res.status(404).json({ erro: 'Plano não encontrado.' });
    return;
  }

  const [assinaturas, pagamentos, pedidos] = await Promise.all([
    db.selectFrom('subscriptions').select(db.fn.countAll<number>().as('c')).where('plan_id', '=', id).executeTakeFirstOrThrow(),
    db.selectFrom('payments').select(db.fn.countAll<number>().as('c')).where('plan_id', '=', id).executeTakeFirstOrThrow(),
    db.selectFrom('plan_requests').select(db.fn.countAll<number>().as('c')).where('plan_id', '=', id).executeTakeFirstOrThrow(),
  ]);
  if (Number(assinaturas.c) > 0 || Number(pagamentos.c) > 0 || Number(pedidos.c) > 0) {
    res.status(400).json({ erro: 'Este plano já tem assinaturas, pagamentos ou pedidos no histórico. Desative em vez de excluir, pra não perder esse histórico.' });
    return;
  }

  await db.deleteFrom('plans').where('id', '=', id).execute();
  await registrarAuditoria(req.user!.sub, 'Excluiu plano', plano.nome);
  res.json({ ok: true });
});

const ativarSchema = z.object({
  plan_id: z.number().int(),
  dias: z.number().int().min(1).max(365).optional(),
  valor_centavos: z.number().int().min(0).optional(),
  observacao: z.string().trim().max(500).optional(),
});

// Serve pra ativar, renovar, trocar de plano e reativar.
financeRouter.post('/subscriptions/:userId/ativar', async (req, res) => {
  const parsed = ativarSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ erro: 'Dados inválidos.' });
    return;
  }
  const userId = Number(req.params.userId);
  const perfil = await db.selectFrom('professional_profiles').select('stage_name').where('user_id', '=', userId).executeTakeFirst();
  if (!perfil) {
    res.status(404).json({ erro: 'Profissional não encontrada.' });
    return;
  }
  const plano = await db.selectFrom('plans').selectAll().where('id', '=', parsed.data.plan_id).executeTakeFirst();
  if (!plano || !plano.ativo) {
    res.status(400).json({ erro: 'Plano inexistente ou desativado.' });
    return;
  }

  const atualAntes = await db.selectFrom('subscriptions').select('status').where('user_id', '=', userId).executeTakeFirst();
  const { venceEm, renovacao } = await ativarPlanoParaUsuario({
    userId, plano, dias: parsed.data.dias, valorCentavos: parsed.data.valor_centavos,
    observacao: parsed.data.observacao, registradoPor: req.user!.sub,
  });

  const acao = renovacao ? 'Renovou' : atualAntes ? 'Ativou/reativou' : 'Ativou';
  await registrarAuditoria(req.user!.sub, `${acao} plano ${plano.nome} (${parsed.data.dias ?? plano.duracao_dias} dias)`, perfil.stage_name);
  res.json({ ok: true, vence_em: venceEm.toISOString().slice(0, 10), renovacao });
});

financeRouter.post('/subscriptions/:userId/cancelar', async (req, res) => {
  const userId = Number(req.params.userId);
  const perfil = await db.selectFrom('professional_profiles').select('stage_name').where('user_id', '=', userId).executeTakeFirst();
  if (!perfil) {
    res.status(404).json({ erro: 'Profissional não encontrada.' });
    return;
  }

  await db.transaction().execute(async (trx) => {
    await trx.updateTable('subscriptions').set({ status: 'cancelado' }).where('user_id', '=', userId).execute();
    await trx.updateTable('professional_profiles').set({ is_vip: 0, prioridade: 0 }).where('user_id', '=', userId).execute();
  });

  await registrarAuditoria(req.user!.sub, 'Cancelou plano', perfil.stage_name);
  res.json({ ok: true });
});

const impulsoSchema = z.object({
  dias: z.number().int().min(1).max(90),
  valor_centavos: z.number().int().min(0),
  observacao: z.string().trim().max(500).optional(),
});

// Impulso e' independente do plano: soma dias a partir do fim do
// impulso atual (se ainda vigente) ou de agora.
financeRouter.post('/subscriptions/:userId/impulso', async (req, res) => {
  const parsed = impulsoSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ erro: 'Dados inválidos.' });
    return;
  }
  const userId = Number(req.params.userId);
  const perfil = await db.selectFrom('professional_profiles').select(['stage_name', 'boost_ate']).where('user_id', '=', userId).executeTakeFirst();
  if (!perfil) {
    res.status(404).json({ erro: 'Profissional não encontrada.' });
    return;
  }

  const agora = new Date();
  const base = perfil.boost_ate && perfil.boost_ate > agora ? perfil.boost_ate : agora;
  const boostAte = somarDias(base, parsed.data.dias);

  await db.transaction().execute(async (trx) => {
    await trx.updateTable('professional_profiles').set({ boost_ate: boostAte }).where('user_id', '=', userId).execute();
    await trx
      .insertInto('payments')
      .values({
        user_id: userId, tipo: 'impulso', plan_id: null, valor_centavos: parsed.data.valor_centavos, dias: parsed.data.dias,
        observacao: parsed.data.observacao || null, registrado_por: req.user!.sub,
      })
      .execute();
  });

  await registrarAuditoria(req.user!.sub, `Ativou impulso (${parsed.data.dias} dias)`, perfil.stage_name);
  res.json({ ok: true, boost_ate: boostAte.toISOString() });
});

financeRouter.post('/subscriptions/:userId/impulso/cancelar', async (req, res) => {
  const userId = Number(req.params.userId);
  const perfil = await db.selectFrom('professional_profiles').select('stage_name').where('user_id', '=', userId).executeTakeFirst();
  if (!perfil) {
    res.status(404).json({ erro: 'Profissional não encontrada.' });
    return;
  }
  await db.updateTable('professional_profiles').set({ boost_ate: null }).where('user_id', '=', userId).execute();
  await registrarAuditoria(req.user!.sub, 'Encerrou impulso', perfil.stage_name);
  res.json({ ok: true });
});

financeRouter.get('/payments', async (req, res) => {
  let query = db
    .selectFrom('payments')
    .innerJoin('users as u', 'u.id', 'payments.user_id')
    .leftJoin('professional_profiles', 'professional_profiles.user_id', 'payments.user_id')
    .leftJoin('plans', 'plans.id', 'payments.plan_id')
    .leftJoin('users as reg', 'reg.id', 'payments.registrado_por')
    .select([
      'payments.id', 'payments.user_id', 'payments.tipo', 'payments.valor_centavos', 'payments.dias',
      'payments.observacao', 'payments.created_at',
      'professional_profiles.stage_name', 'u.email', 'plans.nome as plano_nome', 'reg.name as registrado_por_nome',
    ])
    .orderBy('payments.created_at', 'desc')
    .limit(300);

  const userId = Number(req.query.userId);
  if (userId) query = query.where('payments.user_id', '=', userId);

  const pagamentos = await query.execute();
  res.json({ pagamentos });
});

financeRouter.get('/summary', async (_req, res) => {
  const receita = await db
    .selectFrom('payments')
    .select(sql<number>`COALESCE(SUM(valor_centavos), 0)`.as('total'))
    .where(sql<boolean>`YEAR(created_at) = YEAR(CURDATE()) AND MONTH(created_at) = MONTH(CURDATE())`)
    .executeTakeFirstOrThrow();
  const ativos = await db
    .selectFrom('subscriptions')
    .select(db.fn.countAll<number>().as('c'))
    .where('status', '=', 'ativo')
    .executeTakeFirstOrThrow();
  const vencendo = await db
    .selectFrom('subscriptions')
    .select(db.fn.countAll<number>().as('c'))
    .where('status', '=', 'ativo')
    .where(sql<boolean>`vence_em BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY)`)
    .executeTakeFirstOrThrow();
  const impulsos = await db
    .selectFrom('professional_profiles')
    .select(db.fn.countAll<number>().as('c'))
    .where(sql<boolean>`boost_ate > NOW()`)
    .executeTakeFirstOrThrow();
  const pedidos = await db
    .selectFrom('plan_requests')
    .select(db.fn.countAll<number>().as('c'))
    .where('status', '=', 'pendente')
    .executeTakeFirstOrThrow();
  res.json({
    receita_mes_centavos: Number(receita.total),
    assinantes_ativos: Number(ativos.c),
    vencendo_7_dias: Number(vencendo.c),
    impulsos_ativos: Number(impulsos.c),
    pedidos_pendentes: Number(pedidos.c),
  });
});

financeRouter.get('/plan-requests', async (_req, res) => {
  const pedidos = await db
    .selectFrom('plan_requests')
    .innerJoin('professional_profiles', 'professional_profiles.user_id', 'plan_requests.user_id')
    .innerJoin('plans', 'plans.id', 'plan_requests.plan_id')
    .select([
      'plan_requests.id', 'plan_requests.user_id', 'plan_requests.created_at', 'plan_requests.comprovante_url',
      'professional_profiles.stage_name', 'plans.id as plan_id', 'plans.nome as plano_nome', 'plans.preco_centavos',
    ])
    .where('plan_requests.status', '=', 'pendente')
    .orderBy('plan_requests.created_at', 'asc')
    .execute();
  res.json({ pedidos: pedidos.map(({ comprovante_url, ...p }) => ({ ...p, tem_comprovante: comprovante_url !== null })) });
});

// Nunca serve o comprovante por URL publica - mesma logica do
// documento/selfie, so' essa rota autenticada le do disco privado.
financeRouter.get('/plan-requests/:id/comprovante/file', async (req, res) => {
  const id = Number(req.params.id);
  const pedido = await db.selectFrom('plan_requests').select('comprovante_url').where('id', '=', id).executeTakeFirst();
  if (!pedido?.comprovante_url) {
    res.status(404).json({ erro: 'Comprovante não encontrado.' });
    return;
  }
  res.sendFile(caminhoComprovante(pedido.comprovante_url));
});

financeRouter.post('/plan-requests/:id/atender', async (req, res) => {
  const id = Number(req.params.id);
  const pedido = await db
    .selectFrom('plan_requests')
    .innerJoin('professional_profiles', 'professional_profiles.user_id', 'plan_requests.user_id')
    .select(['plan_requests.id', 'plan_requests.user_id', 'plan_requests.plan_id', 'plan_requests.status', 'professional_profiles.stage_name'])
    .where('plan_requests.id', '=', id)
    .executeTakeFirst();
  if (!pedido || pedido.status !== 'pendente') {
    res.status(404).json({ erro: 'Pedido não encontrado ou já resolvido.' });
    return;
  }
  const plano = await db.selectFrom('plans').selectAll().where('id', '=', pedido.plan_id).executeTakeFirst();
  if (!plano || !plano.ativo) {
    res.status(400).json({ erro: 'Este plano não está mais disponível. Recuse o pedido e oriente a profissional a escolher outro.' });
    return;
  }

  const { venceEm } = await ativarPlanoParaUsuario({ userId: pedido.user_id, plano, registradoPor: req.user!.sub });
  await db
    .updateTable('plan_requests')
    .set({ status: 'atendido', resolved_at: new Date(), resolved_by: req.user!.sub })
    .where('id', '=', id)
    .execute();

  await registrarAuditoria(req.user!.sub, `Atendeu pedido de plano ${plano.nome}`, pedido.stage_name);
  res.json({ ok: true, vence_em: venceEm.toISOString().slice(0, 10) });
});

financeRouter.post('/plan-requests/:id/recusar', async (req, res) => {
  const id = Number(req.params.id);
  const pedido = await db
    .selectFrom('plan_requests')
    .innerJoin('professional_profiles', 'professional_profiles.user_id', 'plan_requests.user_id')
    .select(['plan_requests.id', 'plan_requests.status', 'professional_profiles.stage_name'])
    .where('plan_requests.id', '=', id)
    .executeTakeFirst();
  if (!pedido || pedido.status !== 'pendente') {
    res.status(404).json({ erro: 'Pedido não encontrado ou já resolvido.' });
    return;
  }
  await db
    .updateTable('plan_requests')
    .set({ status: 'recusado', resolved_at: new Date(), resolved_by: req.user!.sub })
    .where('id', '=', id)
    .execute();
  await registrarAuditoria(req.user!.sub, 'Recusou pedido de plano', pedido.stage_name);
  res.json({ ok: true });
});

// Exclusao definitiva de conta de profissional - diferente de
// suspender (reversivel, usado na moderacao do dia a dia), isto apaga
// pra sempre: login, perfil, fotos, documento, selfie, assinaturas e
// historico de pagamento. So' Admin Master, e so' alcanca contas com
// role='profissional' (guarda extra pra nunca apagar staff/cliente
// por engano via esta rota). Atende tanto limpeza de dados de teste
// quanto pedido real de exclusao (direito ao esquecimento, LGPD).
financeRouter.delete('/professionals/:userId', async (req, res) => {
  const userId = Number(req.params.userId);
  const usuario = await db
    .selectFrom('users')
    .innerJoin('professional_profiles', 'professional_profiles.user_id', 'users.id')
    .select(['users.id', 'professional_profiles.id as profile_id', 'professional_profiles.stage_name'])
    .where('users.id', '=', userId)
    .where('users.role', '=', 'profissional')
    .executeTakeFirst();
  if (!usuario) {
    res.status(404).json({ erro: 'Profissional não encontrada.' });
    return;
  }

  // Le os caminhos dos arquivos antes de apagar as linhas (o cascade
  // do banco apaga os registros, nao os arquivos no disco).
  const fotos = await db.selectFrom('media').select('url').where('profile_id', '=', usuario.profile_id).execute();
  const verificacao = await db
    .selectFrom('verifications')
    .select(['documento_url', 'selfie_url'])
    .where('user_id', '=', userId)
    .executeTakeFirst();
  const comprovantes = await db
    .selectFrom('plan_requests')
    .select('comprovante_url')
    .where('user_id', '=', userId)
    .where('comprovante_url', 'is not', null)
    .execute();

  await db.deleteFrom('users').where('id', '=', userId).where('role', '=', 'profissional').execute();

  fotos.forEach((f) => removerArquivoPelaUrl(f.url));
  removerDocumento(verificacao?.documento_url);
  removerSelfie(verificacao?.selfie_url);
  comprovantes.forEach((c) => removerComprovante(c.comprovante_url));

  await registrarAuditoria(req.user!.sub, 'Excluiu conta de profissional definitivamente', usuario.stage_name);
  res.json({ ok: true });
});
