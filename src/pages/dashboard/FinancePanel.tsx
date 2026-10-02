import React, { useState, useEffect, useCallback } from 'react';
import {
  AlertCircle, CheckCircle2, XCircle, Clock, Zap, Plus, Pencil, History, Search, Power,
} from 'lucide-react';
import {
  listarAssinaturas, listarPlanos, criarPlano, editarPlano, ativarPlano, cancelarAssinatura,
  ativarImpulso, encerrarImpulso, listarPagamentos, buscarResumoFinanceiro,
  listarPedidosPlano, atenderPedidoPlano, recusarPedidoPlano, ApiError,
  type SubscriptionRow, type Plan, type PlanInput, type PaymentRow, type FinanceSummary, type PlanRequestRow,
} from '../../lib/api';

function fmtReais(centavos: number) {
  return (centavos / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// Aceita "89", "89,90", "89.90" ou "R$ 1.234,50".
function paraCentavos(texto: string): number | null {
  const limpo = texto.replace(/[^\d,.-]/g, '');
  if (!limpo) return null;
  const normalizado = limpo.includes(',') ? limpo.replace(/\./g, '').replace(',', '.') : limpo;
  const valor = Number(normalizado);
  return Number.isFinite(valor) && valor >= 0 ? Math.round(valor * 100) : null;
}

function centavosParaTexto(centavos: number) {
  return (centavos / 100).toFixed(2).replace('.', ',');
}

function fmtData(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function fmtDataHora(iso: string) {
  return new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' });
}

function diasRestantes(iso: string): number {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const alvo = new Date(iso);
  alvo.setHours(0, 0, 0, 0);
  return Math.round((alvo.getTime() - hoje.getTime()) / 86400000);
}

type Situacao = 'em_dia' | 'vencendo' | 'vencido' | 'cancelado' | 'sem_plano';

function situacaoDe(a: SubscriptionRow): Situacao {
  if (!a.status) return 'sem_plano';
  if (a.status === 'cancelado') return 'cancelado';
  if (a.status === 'vencido' || (a.vence_em && diasRestantes(a.vence_em) < 0)) return 'vencido';
  if (a.vence_em && diasRestantes(a.vence_em) <= 7) return 'vencendo';
  return 'em_dia';
}

const FILTROS: { key: 'todas' | Situacao; label: string }[] = [
  { key: 'todas', label: 'Todas' },
  { key: 'em_dia', label: 'Em dia' },
  { key: 'vencendo', label: 'Vencendo' },
  { key: 'vencido', label: 'Vencidas' },
  { key: 'cancelado', label: 'Canceladas' },
  { key: 'sem_plano', label: 'Sem plano' },
];

const inputCls = 'w-full bg-onix text-marfim text-sm rounded-campo px-3 py-2 border border-white/15 focus:border-ouro outline-none';
const btnPrimario = 'flex items-center justify-center space-x-1.5 px-3 py-1.5 rounded-campo bg-verificado hover:opacity-90 text-marfim text-xs font-bold transition-opacity disabled:opacity-50';
const btnSecundario = 'flex items-center justify-center space-x-1.5 px-3 py-1.5 rounded-campo bg-white/5 border border-white/15 text-nevoa hover:text-marfim text-xs font-bold transition-colors disabled:opacity-50';
const btnPerigo = 'flex items-center justify-center space-x-1.5 px-3 py-1.5 rounded-campo bg-white/5 border border-white/15 hover:border-red-400/40 text-nevoa hover:text-red-300 text-xs font-bold transition-colors disabled:opacity-50';

function Erro({ texto }: { texto: string }) {
  if (!texto) return null;
  return (
    <div className="flex items-start space-x-2 bg-red-500/10 border border-red-500/30 p-3 text-xs text-red-300">
      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
      <span>{texto}</span>
    </div>
  );
}

// ---------- Assinaturas ----------

function FormAtivar({ assinatura, planos, onFeito, onCancelar }: {
  assinatura: SubscriptionRow;
  planos: Plan[];
  onFeito: () => void;
  onCancelar: () => void;
}) {
  const ativos = planos.filter((p) => p.ativo === 1);
  const inicial = ativos.find((p) => p.id === assinatura.plan_id) ?? ativos[0];
  const [planId, setPlanId] = useState(inicial?.id ?? 0);
  const [dias, setDias] = useState(String(inicial?.duracao_dias ?? 30));
  const [valor, setValor] = useState(inicial ? centavosParaTexto(inicial.preco_centavos) : '');
  const [observacao, setObservacao] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');

  const trocarPlano = (id: number) => {
    setPlanId(id);
    const p = ativos.find((x) => x.id === id);
    if (p) {
      setDias(String(p.duracao_dias));
      setValor(centavosParaTexto(p.preco_centavos));
    }
  };

  const renovacao = assinatura.status === 'ativo' && assinatura.plan_id === planId && !!assinatura.vence_em && diasRestantes(assinatura.vence_em) >= 0;

  const salvar = async (e: React.FormEvent) => {
    e.preventDefault();
    const centavos = paraCentavos(valor);
    if (centavos === null) {
      setErro('Valor inválido.');
      return;
    }
    setSalvando(true);
    setErro('');
    try {
      await ativarPlano(assinatura.user_id, { plan_id: planId, dias: Number(dias), valor_centavos: centavos, observacao: observacao || undefined });
      onFeito();
    } catch (err) {
      setErro(err instanceof ApiError ? err.message : 'Não foi possível registrar.');
    } finally {
      setSalvando(false);
    }
  };

  if (ativos.length === 0) {
    return <p className="text-xs text-nevoa">Nenhum plano ativo. Crie um plano na aba "Planos" primeiro.</p>;
  }

  return (
    <form onSubmit={salvar} className="bg-onix border border-white/10 p-3 space-y-3">
      <Erro texto={erro} />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-[11px] font-semibold text-nevoa mb-1">Plano</label>
          <select value={planId} onChange={(e) => trocarPlano(Number(e.target.value))} className={inputCls}>
            {ativos.map((p) => <option key={p.id} value={p.id}>{p.nome} — {fmtReais(p.preco_centavos)}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-[11px] font-semibold text-nevoa mb-1">Dias</label>
          <input type="number" min={1} max={365} required value={dias} onChange={(e) => setDias(e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className="block text-[11px] font-semibold text-nevoa mb-1">Valor recebido (R$)</label>
          <input required value={valor} onChange={(e) => setValor(e.target.value)} className={inputCls} />
        </div>
      </div>
      <div>
        <label className="block text-[11px] font-semibold text-nevoa mb-1">Observação (opcional)</label>
        <input value={observacao} onChange={(e) => setObservacao(e.target.value)} placeholder="Ex: PIX recebido dia 05, comprovante no WhatsApp" className={inputCls} />
      </div>
      <p className="text-[11px] text-nevoa">
        {renovacao
          ? `Renovação: os ${dias} dias serão somados ao vencimento atual (${fmtData(assinatura.vence_em!)}).`
          : `Começa a contar hoje e vence em ${dias} dias.`}
      </p>
      <div className="flex gap-2">
        <button type="submit" disabled={salvando} className={btnPrimario}>
          <CheckCircle2 className="w-3.5 h-3.5" /><span>{salvando ? 'Salvando...' : 'Confirmar pagamento'}</span>
        </button>
        <button type="button" onClick={onCancelar} className={btnSecundario}>Cancelar</button>
      </div>
    </form>
  );
}

function FormImpulso({ assinatura, onFeito, onCancelar }: { assinatura: SubscriptionRow; onFeito: () => void; onCancelar: () => void }) {
  const [dias, setDias] = useState('7');
  const [valor, setValor] = useState('25,00');
  const [observacao, setObservacao] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');

  const salvar = async (e: React.FormEvent) => {
    e.preventDefault();
    const centavos = paraCentavos(valor);
    if (centavos === null) {
      setErro('Valor inválido.');
      return;
    }
    setSalvando(true);
    setErro('');
    try {
      await ativarImpulso(assinatura.user_id, { dias: Number(dias), valor_centavos: centavos, observacao: observacao || undefined });
      onFeito();
    } catch (err) {
      setErro(err instanceof ApiError ? err.message : 'Não foi possível registrar.');
    } finally {
      setSalvando(false);
    }
  };

  const vigente = assinatura.boost_ate && new Date(assinatura.boost_ate) > new Date();

  return (
    <form onSubmit={salvar} className="bg-onix border border-white/10 p-3 space-y-3">
      <Erro texto={erro} />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-[11px] font-semibold text-nevoa mb-1">Dias de destaque</label>
          <input type="number" min={1} max={90} required value={dias} onChange={(e) => setDias(e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className="block text-[11px] font-semibold text-nevoa mb-1">Valor recebido (R$)</label>
          <input required value={valor} onChange={(e) => setValor(e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className="block text-[11px] font-semibold text-nevoa mb-1">Observação (opcional)</label>
          <input value={observacao} onChange={(e) => setObservacao(e.target.value)} className={inputCls} />
        </div>
      </div>
      <p className="text-[11px] text-nevoa">
        {vigente
          ? `Já tem impulso até ${fmtDataHora(assinatura.boost_ate!)} — os dias serão somados.`
          : 'O perfil vai pro topo da listagem da cidade a partir de agora.'}
      </p>
      <div className="flex gap-2">
        <button type="submit" disabled={salvando} className={btnPrimario}>
          <Zap className="w-3.5 h-3.5" /><span>{salvando ? 'Salvando...' : 'Confirmar impulso'}</span>
        </button>
        <button type="button" onClick={onCancelar} className={btnSecundario}>Cancelar</button>
      </div>
    </form>
  );
}

function HistoricoProfissional({ userId }: { userId: number }) {
  const [pagamentos, setPagamentos] = useState<PaymentRow[] | null>(null);
  const [erro, setErro] = useState('');

  useEffect(() => {
    listarPagamentos(userId)
      .then(({ pagamentos }) => setPagamentos(pagamentos))
      .catch((err) => setErro(err instanceof ApiError ? err.message : 'Não foi possível carregar o histórico.'));
  }, [userId]);

  if (erro) return <Erro texto={erro} />;
  if (!pagamentos) return <p className="text-xs text-nevoa">Carregando...</p>;
  if (pagamentos.length === 0) return <p className="text-xs text-nevoa">Nenhum pagamento registrado.</p>;

  return (
    <div className="bg-onix border border-white/10 divide-y divide-white/5">
      {pagamentos.map((p) => (
        <div key={p.id} className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 text-xs">
          <span className="text-nevoa font-mono">{fmtDataHora(p.created_at)}</span>
          <span className="text-marfim">{p.tipo === 'impulso' ? 'Impulso' : `Plano ${p.plano_nome ?? '—'}`} · {p.dias} dias</span>
          <span className="text-ouro font-semibold">{fmtReais(p.valor_centavos)}</span>
          {p.observacao && <span className="w-full text-nevoa italic">{p.observacao}</span>}
        </div>
      ))}
    </div>
  );
}

function LinhaAssinatura({ a, planos, onAtualizar }: { a: SubscriptionRow; planos: Plan[]; onAtualizar: () => void }) {
  const [painel, setPainel] = useState<'nenhum' | 'ativar' | 'impulso' | 'historico'>('nenhum');
  const [confirmandoCancelar, setConfirmandoCancelar] = useState(false);
  const [processando, setProcessando] = useState(false);
  const [erro, setErro] = useState('');

  const situacao = situacaoDe(a);
  const dias = a.vence_em ? diasRestantes(a.vence_em) : null;
  const impulsoVigente = !!a.boost_ate && new Date(a.boost_ate) > new Date();

  const executar = async (fn: () => Promise<unknown>) => {
    setProcessando(true);
    setErro('');
    try {
      await fn();
      setConfirmandoCancelar(false);
      onAtualizar();
    } catch (err) {
      setErro(err instanceof ApiError ? err.message : 'Não foi possível concluir.');
    } finally {
      setProcessando(false);
    }
  };

  const rotuloAtivar = situacao === 'sem_plano' ? 'Ativar plano' : situacao === 'vencido' || situacao === 'cancelado' ? 'Reativar' : 'Renovar / trocar';

  return (
    <div className="p-3.5 space-y-3">
      <div className="flex flex-col lg:flex-row lg:items-center gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-marfim">{a.stage_name}</span>
            {a.plano_nome && situacao !== 'sem_plano' && (
              <span className={`text-[10px] px-2 py-0.5 rounded-campo font-bold uppercase ${situacao === 'em_dia' || situacao === 'vencendo' ? 'bg-ouro/15 border border-ouro/30 text-ouro' : 'bg-white/5 border border-white/10 text-nevoa line-through'}`}>
                {a.plano_nome}
              </span>
            )}
            {situacao === 'sem_plano' && <span className="text-[10px] px-2 py-0.5 rounded-campo bg-white/5 border border-white/10 text-nevoa uppercase">Grátis</span>}
            {impulsoVigente && (
              <span className="text-[10px] px-2 py-0.5 rounded-campo bg-amber-500/15 border border-amber-500/30 text-amber-300 font-bold uppercase flex items-center gap-1">
                <Zap className="w-3 h-3" />Impulso até {fmtDataHora(a.boost_ate!)}
              </span>
            )}
          </div>
          <div className="text-xs text-nevoa">{a.email}</div>
          <div className="text-[11px] mt-0.5 flex items-center gap-1.5">
            {situacao === 'sem_plano' && <span className="text-nevoa">Nunca assinou</span>}
            {situacao === 'em_dia' && <span className="text-verificado-texto flex items-center gap-1"><CheckCircle2 className="w-3 h-3" />Em dia até {fmtData(a.vence_em!)} ({dias} dias)</span>}
            {situacao === 'vencendo' && <span className="text-amber-400 font-semibold flex items-center gap-1"><Clock className="w-3 h-3" />{dias === 0 ? 'Vence hoje' : `Vence em ${dias} dia(s)`} — {fmtData(a.vence_em!)}</span>}
            {situacao === 'vencido' && <span className="text-red-400 font-semibold flex items-center gap-1"><XCircle className="w-3 h-3" />Vencido em {fmtData(a.vence_em!)}</span>}
            {situacao === 'cancelado' && <span className="text-nevoa flex items-center gap-1"><XCircle className="w-3 h-3" />Cancelado</span>}
          </div>
        </div>
        <div className="flex flex-wrap gap-2 shrink-0">
          <button onClick={() => setPainel(painel === 'ativar' ? 'nenhum' : 'ativar')} className={btnPrimario}>
            <CheckCircle2 className="w-3.5 h-3.5" /><span>{rotuloAtivar}</span>
          </button>
          <button onClick={() => setPainel(painel === 'impulso' ? 'nenhum' : 'impulso')} className={btnSecundario}>
            <Zap className="w-3.5 h-3.5" /><span>Impulso</span>
          </button>
          <button onClick={() => setPainel(painel === 'historico' ? 'nenhum' : 'historico')} className={btnSecundario}>
            <History className="w-3.5 h-3.5" /><span>Histórico</span>
          </button>
          {impulsoVigente && (
            <button onClick={() => executar(() => encerrarImpulso(a.user_id))} disabled={processando} className={btnPerigo}>
              <span>Encerrar impulso</span>
            </button>
          )}
          {(situacao === 'em_dia' || situacao === 'vencendo') && (
            confirmandoCancelar ? (
              <>
                <button onClick={() => executar(() => cancelarAssinatura(a.user_id))} disabled={processando} className="flex items-center space-x-1.5 px-3 py-1.5 rounded-campo bg-red-500/20 border border-red-500/40 text-red-200 text-xs font-bold disabled:opacity-50">
                  <span>Confirmar cancelamento</span>
                </button>
                <button onClick={() => setConfirmandoCancelar(false)} className={btnSecundario}>Voltar</button>
              </>
            ) : (
              <button onClick={() => setConfirmandoCancelar(true)} className={btnPerigo}>
                <XCircle className="w-3.5 h-3.5" /><span>Cancelar plano</span>
              </button>
            )
          )}
        </div>
      </div>

      <Erro texto={erro} />
      {painel === 'ativar' && (
        <FormAtivar assinatura={a} planos={planos} onCancelar={() => setPainel('nenhum')} onFeito={() => { setPainel('nenhum'); onAtualizar(); }} />
      )}
      {painel === 'impulso' && (
        <FormImpulso assinatura={a} onCancelar={() => setPainel('nenhum')} onFeito={() => { setPainel('nenhum'); onAtualizar(); }} />
      )}
      {painel === 'historico' && <HistoricoProfissional userId={a.user_id} />}
    </div>
  );
}

// ---------- Planos ----------

const PLANO_VAZIO = { nome: '', preco: '', duracao_dias: '30', max_fotos: '12', prioridade: '10', selo_vip: true };

function FormPlano({ inicial, onSalvar, onCancelar }: {
  inicial: typeof PLANO_VAZIO;
  onSalvar: (dados: PlanInput) => Promise<void>;
  onCancelar: () => void;
}) {
  const [f, setF] = useState(inicial);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');

  const salvar = async (e: React.FormEvent) => {
    e.preventDefault();
    const centavos = paraCentavos(f.preco);
    if (centavos === null) {
      setErro('Preço inválido.');
      return;
    }
    setSalvando(true);
    setErro('');
    try {
      await onSalvar({
        nome: f.nome,
        preco_centavos: centavos,
        duracao_dias: Number(f.duracao_dias),
        max_fotos: Number(f.max_fotos),
        prioridade: Number(f.prioridade),
        selo_vip: f.selo_vip,
      });
    } catch (err) {
      setErro(err instanceof ApiError ? err.message : 'Não foi possível salvar o plano.');
      setSalvando(false);
    }
  };

  return (
    <form onSubmit={salvar} className="bg-onix border border-ouro/30 p-4 space-y-3">
      <Erro texto={erro} />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-[11px] font-semibold text-nevoa mb-1">Nome</label>
          <input required minLength={2} value={f.nome} onChange={(e) => setF({ ...f, nome: e.target.value })} placeholder="Ex: Diamante" className={inputCls} />
        </div>
        <div>
          <label className="block text-[11px] font-semibold text-nevoa mb-1">Preço (R$)</label>
          <input required value={f.preco} onChange={(e) => setF({ ...f, preco: e.target.value })} placeholder="89,90" className={inputCls} />
        </div>
        <div>
          <label className="block text-[11px] font-semibold text-nevoa mb-1">Duração (dias)</label>
          <input type="number" min={1} max={365} required value={f.duracao_dias} onChange={(e) => setF({ ...f, duracao_dias: e.target.value })} className={inputCls} />
        </div>
        <div>
          <label className="block text-[11px] font-semibold text-nevoa mb-1">Limite de fotos</label>
          <input type="number" min={1} max={50} required value={f.max_fotos} onChange={(e) => setF({ ...f, max_fotos: e.target.value })} className={inputCls} />
        </div>
        <div>
          <label className="block text-[11px] font-semibold text-nevoa mb-1">Prioridade na listagem (0–100)</label>
          <input type="number" min={0} max={100} required value={f.prioridade} onChange={(e) => setF({ ...f, prioridade: e.target.value })} className={inputCls} />
        </div>
        <label className="flex items-center gap-2 text-sm text-marfim sm:mt-5">
          <input type="checkbox" checked={f.selo_vip} onChange={(e) => setF({ ...f, selo_vip: e.target.checked })} className="accent-[#C9A24B]" />
          Mostra selo VIP no anúncio
        </label>
      </div>
      <p className="text-[11px] text-nevoa">Quanto maior a prioridade, mais acima o perfil aparece na listagem da cidade. Perfis sem plano têm prioridade 0 e limite de 3 fotos.</p>
      <div className="flex gap-2">
        <button type="submit" disabled={salvando} className={btnPrimario}>
          <CheckCircle2 className="w-3.5 h-3.5" /><span>{salvando ? 'Salvando...' : 'Salvar plano'}</span>
        </button>
        <button type="button" onClick={onCancelar} className={btnSecundario}>Cancelar</button>
      </div>
    </form>
  );
}

function AbaPlanos({ planos, onAtualizar }: { planos: Plan[]; onAtualizar: () => void }) {
  const [criando, setCriando] = useState(false);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [erro, setErro] = useState('');

  const alternarAtivo = async (p: Plan) => {
    setErro('');
    try {
      await editarPlano(p.id, { ativo: p.ativo !== 1 });
      onAtualizar();
    } catch (err) {
      setErro(err instanceof ApiError ? err.message : 'Não foi possível alterar o plano.');
    }
  };

  return (
    <div className="space-y-4">
      <Erro texto={erro} />
      <div className="border border-white/10 divide-y divide-white/10">
        {planos.length === 0 && <p className="text-sm text-nevoa p-4">Nenhum plano cadastrado.</p>}
        {planos.map((p) => (
          <div key={p.id} className="p-3.5 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-semibold ${p.ativo === 1 ? 'text-marfim' : 'text-nevoa line-through'}`}>{p.nome}</span>
                  {p.selo_vip === 1 && <span className="text-[10px] px-2 py-0.5 rounded-campo bg-ouro/15 border border-ouro/30 text-ouro font-bold uppercase">Selo VIP</span>}
                  {p.ativo !== 1 && <span className="text-[10px] px-2 py-0.5 rounded-campo bg-white/5 border border-white/10 text-nevoa uppercase">Desativado</span>}
                </div>
                <div className="text-xs text-nevoa">
                  <span className="text-ouro font-semibold">{fmtReais(p.preco_centavos)}</span> por {p.duracao_dias} dias · até {p.max_fotos} fotos · prioridade {p.prioridade}
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => setEditandoId(editandoId === p.id ? null : p.id)} className={btnSecundario}>
                  <Pencil className="w-3.5 h-3.5" /><span>Editar</span>
                </button>
                <button onClick={() => alternarAtivo(p)} className={p.ativo === 1 ? btnPerigo : btnPrimario}>
                  <Power className="w-3.5 h-3.5" /><span>{p.ativo === 1 ? 'Desativar' : 'Reativar'}</span>
                </button>
              </div>
            </div>
            {editandoId === p.id && (
              <FormPlano
                inicial={{
                  nome: p.nome,
                  preco: centavosParaTexto(p.preco_centavos),
                  duracao_dias: String(p.duracao_dias),
                  max_fotos: String(p.max_fotos),
                  prioridade: String(p.prioridade),
                  selo_vip: p.selo_vip === 1,
                }}
                onCancelar={() => setEditandoId(null)}
                onSalvar={async (dados) => {
                  await editarPlano(p.id, dados);
                  setEditandoId(null);
                  onAtualizar();
                }}
              />
            )}
          </div>
        ))}
      </div>

      {criando ? (
        <FormPlano
          inicial={PLANO_VAZIO}
          onCancelar={() => setCriando(false)}
          onSalvar={async (dados) => {
            await criarPlano(dados);
            setCriando(false);
            onAtualizar();
          }}
        />
      ) : (
        <button onClick={() => setCriando(true)} className="flex items-center space-x-2 px-4 py-2.5 rounded-campo bg-ouro hover:bg-champanhe text-black font-bold text-sm transition-colors">
          <Plus className="w-4 h-4" /><span>Novo plano</span>
        </button>
      )}
      <p className="text-xs text-nevoa">Editar ou desativar um plano não muda quem já pagou — vale a partir do próximo pagamento registrado. Plano desativado some da lista de opções, mas o histórico continua.</p>
    </div>
  );
}

// ---------- Pagamentos ----------

function AbaPagamentos() {
  const [pagamentos, setPagamentos] = useState<PaymentRow[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    listarPagamentos()
      .then(({ pagamentos }) => setPagamentos(pagamentos))
      .catch((err) => setErro(err instanceof ApiError ? err.message : 'Não foi possível carregar os pagamentos.'))
      .finally(() => setCarregando(false));
  }, []);

  return (
    <div className="space-y-3">
      <Erro texto={erro} />
      <div className="border border-white/10 divide-y divide-white/10">
        {!carregando && pagamentos.length === 0 && <p className="text-sm text-nevoa p-4">Nenhum pagamento registrado ainda.</p>}
        {pagamentos.map((p) => (
          <div key={p.id} className="grid grid-cols-2 sm:grid-cols-6 gap-2 p-3 text-xs items-center">
            <span className="text-nevoa font-mono">{fmtDataHora(p.created_at)}</span>
            <span className="text-marfim font-semibold truncate">{p.stage_name ?? p.email}</span>
            <span className="text-nevoa">{p.tipo === 'impulso' ? 'Impulso' : `Plano ${p.plano_nome ?? '—'}`}</span>
            <span className="text-nevoa">{p.dias} dias</span>
            <span className="text-ouro font-semibold">{fmtReais(p.valor_centavos)}</span>
            <span className="text-nevoa truncate">por {p.registrado_por_nome ?? '—'}</span>
            {p.observacao && <span className="col-span-2 sm:col-span-6 text-nevoa italic">{p.observacao}</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------- Pedidos ----------

function AbaPedidos({ pedidos, onAtualizar }: { pedidos: PlanRequestRow[]; onAtualizar: () => void }) {
  const [processandoId, setProcessandoId] = useState<number | null>(null);
  const [erro, setErro] = useState('');

  const executar = async (id: number, fn: () => Promise<unknown>) => {
    setProcessandoId(id);
    setErro('');
    try {
      await fn();
      onAtualizar();
    } catch (err) {
      setErro(err instanceof ApiError ? err.message : 'Não foi possível concluir.');
    } finally {
      setProcessandoId(null);
    }
  };

  return (
    <div className="space-y-3">
      <p className="text-xs text-nevoa">Pedidos feitos pela própria profissional na aba "Plano" do painel dela. Confirme o PIX fora do site antes de atender.</p>
      <Erro texto={erro} />
      <div className="border border-white/10 divide-y divide-white/10">
        {pedidos.length === 0 && <p className="text-sm text-nevoa p-4">Nenhum pedido pendente.</p>}
        {pedidos.map((p) => (
          <div key={p.id} className="flex flex-col sm:flex-row sm:items-center gap-3 p-3.5">
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-marfim">{p.stage_name}</div>
              <div className="text-xs text-nevoa">
                Quer o plano <span className="text-ouro font-semibold">{p.plano_nome}</span> ({fmtReais(p.preco_centavos)}) · pedido em {fmtDataHora(p.created_at)}
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              <button onClick={() => executar(p.id, () => atenderPedidoPlano(p.id))} disabled={processandoId === p.id} className={btnPrimario}>
                <CheckCircle2 className="w-3.5 h-3.5" /><span>Atender</span>
              </button>
              <button onClick={() => executar(p.id, () => recusarPedidoPlano(p.id))} disabled={processandoId === p.id} className={btnPerigo}>
                <XCircle className="w-3.5 h-3.5" /><span>Recusar</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------- Painel ----------

export function FinancePanel() {
  const [aba, setAba] = useState<'assinaturas' | 'planos' | 'pedidos' | 'pagamentos'>('assinaturas');
  const [pedidos, setPedidos] = useState<PlanRequestRow[]>([]);
  const [assinaturas, setAssinaturas] = useState<SubscriptionRow[]>([]);
  const [planos, setPlanos] = useState<Plan[]>([]);
  const [resumo, setResumo] = useState<FinanceSummary | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [filtro, setFiltro] = useState<'todas' | Situacao>('todas');
  const [busca, setBusca] = useState('');
  const [versaoPagamentos, setVersaoPagamentos] = useState(0);

  const carregar = useCallback(() => {
    setErro('');
    Promise.all([listarAssinaturas(), listarPlanos(), buscarResumoFinanceiro(), listarPedidosPlano()])
      .then(([a, p, r, pd]) => {
        setAssinaturas(a.assinaturas);
        setPlanos(p.planos);
        setResumo(r);
        setPedidos(pd.pedidos);
        setVersaoPagamentos((v) => v + 1);
      })
      .catch((err) => setErro(err instanceof ApiError ? err.message : 'Não foi possível carregar o financeiro.'))
      .finally(() => setCarregando(false));
  }, []);

  useEffect(carregar, [carregar]);

  const contagem = (s: Situacao) => assinaturas.filter((a) => situacaoDe(a) === s).length;
  const termo = busca.trim().toLowerCase();
  const visiveis = assinaturas
    .filter((a) => filtro === 'todas' || situacaoDe(a) === filtro)
    .filter((a) => !termo || a.stage_name.toLowerCase().includes(termo) || a.email.toLowerCase().includes(termo));

  return (
    <div className="max-w-5xl space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-grafite border border-white/10 p-4 space-y-1.5">
          <span className="text-[11px] text-nevoa uppercase tracking-wider">Recebido no mês</span>
          <div className="text-2xl font-display text-ouro">{resumo ? fmtReais(resumo.receita_mes_centavos) : '...'}</div>
          <span className="text-[11px] text-nevoa">pagamentos registrados</span>
        </div>
        <div className="bg-grafite border border-white/10 p-4 space-y-1.5">
          <span className="text-[11px] text-nevoa uppercase tracking-wider">Planos ativos</span>
          <div className="text-2xl font-display text-marfim">{resumo ? resumo.assinantes_ativos : '...'}</div>
          <span className="text-[11px] text-nevoa">de {assinaturas.length} profissionais</span>
        </div>
        <div className={`border p-4 space-y-1.5 ${resumo && resumo.vencendo_7_dias > 0 ? 'bg-amber-500/10 border-amber-500/30' : 'bg-grafite border-white/10'}`}>
          <span className="text-[11px] text-nevoa uppercase tracking-wider">Vencendo em 7 dias</span>
          <div className={`text-2xl font-display ${resumo && resumo.vencendo_7_dias > 0 ? 'text-amber-300' : 'text-marfim'}`}>{resumo ? resumo.vencendo_7_dias : '...'}</div>
          <span className="text-[11px] text-nevoa">cobrar renovação</span>
        </div>
        <div className="bg-grafite border border-white/10 p-4 space-y-1.5">
          <span className="text-[11px] text-nevoa uppercase tracking-wider">Impulsos ativos</span>
          <div className="text-2xl font-display text-marfim">{resumo ? resumo.impulsos_ativos : '...'}</div>
          <span className="text-[11px] text-nevoa">no topo agora</span>
        </div>
        <div className={`border p-4 space-y-1.5 ${resumo && resumo.pedidos_pendentes > 0 ? 'bg-ouro/10 border-ouro/30' : 'bg-grafite border-white/10'}`}>
          <span className="text-[11px] text-nevoa uppercase tracking-wider">Pedidos de plano</span>
          <div className={`text-2xl font-display ${resumo && resumo.pedidos_pendentes > 0 ? 'text-ouro' : 'text-marfim'}`}>{resumo ? resumo.pedidos_pendentes : '...'}</div>
          <span className="text-[11px] text-nevoa">aguardando atendimento</span>
        </div>
      </div>

      <div className="flex gap-1 border-b border-white/10">
        {([['assinaturas', 'Assinaturas'], ['planos', 'Planos'], ['pedidos', `Pedidos${pedidos.length > 0 ? ` (${pedidos.length})` : ''}`], ['pagamentos', 'Pagamentos']] as const).map(([k, l]) => (
          <button
            key={k}
            onClick={() => setAba(k)}
            className={`px-4 py-2 text-sm font-semibold border-b-2 -mb-px transition-colors ${aba === k ? 'border-ouro text-ouro' : 'border-transparent text-nevoa hover:text-marfim'}`}
          >
            {l}
          </button>
        ))}
      </div>

      <Erro texto={erro} />

      {aba === 'assinaturas' && (
        <div className="space-y-3">
          <p className="text-xs text-nevoa">Pagamento é recebido via PIX fora do site. Registre aqui quando receber — o plano vence sozinho na data e o perfil volta pro gratuito.</p>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex flex-wrap gap-1.5">
              {FILTROS.map((f) => (
                <button
                  key={f.key}
                  onClick={() => setFiltro(f.key)}
                  className={`px-2.5 py-1 rounded-campo text-[11px] font-semibold border transition-colors ${filtro === f.key ? 'bg-ouro/20 border-ouro text-marfim' : 'bg-white/5 border-white/10 text-nevoa hover:text-marfim'}`}
                >
                  {f.label}{f.key !== 'todas' && ` (${contagem(f.key)})`}
                </button>
              ))}
            </div>
            <div className="relative sm:ml-auto sm:w-64">
              <Search className="w-3.5 h-3.5 text-nevoa absolute left-3 top-1/2 -translate-y-1/2" />
              <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar nome ou e-mail" className={`${inputCls} pl-8`} />
            </div>
          </div>
          <div className="border border-white/10 divide-y divide-white/10">
            {!carregando && visiveis.length === 0 && <p className="text-sm text-nevoa p-4">Nenhuma profissional nesse filtro.</p>}
            {visiveis.map((a) => <LinhaAssinatura key={a.user_id} a={a} planos={planos} onAtualizar={carregar} />)}
          </div>
        </div>
      )}

      {aba === 'planos' && <AbaPlanos planos={planos} onAtualizar={carregar} />}
      {aba === 'pedidos' && <AbaPedidos pedidos={pedidos} onAtualizar={carregar} />}
      {aba === 'pagamentos' && <AbaPagamentos key={versaoPagamentos} />}
    </div>
  );
}
