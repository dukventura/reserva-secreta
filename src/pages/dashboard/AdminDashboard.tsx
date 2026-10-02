import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard, Users, Wallet, History, ShieldCheck, ArrowRight,
  UserPlus, AlertCircle, CheckCircle2, XCircle, Clock,
} from 'lucide-react';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { RequireRole } from '../../components/RequireRole';
import { useModeration } from '../../context/ModerationContext';
import { mockPlans } from '../../data/mockModeration';
import {
  listarEquipe, criarMembroEquipe, listarAssinaturas, registrarPagamento, cancelarAssinatura,
  ApiError, type StaffMember, type SubscriptionRow,
} from '../../lib/api';

const NAV = [
  { key: 'painel', label: 'Painel', icon: <LayoutDashboard className="w-4 h-4" /> },
  { key: 'equipe', label: 'Equipe', icon: <Users className="w-4 h-4" /> },
  { key: 'financeiro', label: 'Financeiro', icon: <Wallet className="w-4 h-4" /> },
  { key: 'auditoria', label: 'Log de Auditoria', icon: <History className="w-4 h-4" /> },
];

const ROTULO_PAPEL: Record<string, string> = { master: 'Admin Master', gerente: 'Gerente', profissional: 'Profissional', contratante: 'Contratante' };

function fmtData(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function fmtDataCurta(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function diasRestantes(venceEm: string): number {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const vence = new Date(venceEm);
  vence.setHours(0, 0, 0, 0);
  return Math.round((vence.getTime() - hoje.getTime()) / 86400000);
}

function AdminDashboardContent() {
  const [tab, setTab] = useState('painel');
  const { pendingProfiles, reports, pendingMedia, pendingDocuments, pendingSelfies, auditLog, carregando, erro, refresh } = useModeration();
  const [equipe, setEquipe] = useState<StaffMember[]>([]);
  const [carregandoEquipe, setCarregandoEquipe] = useState(true);
  const [erroEquipe, setErroEquipe] = useState('');
  const [mostrarForm, setMostrarForm] = useState(false);
  const [novoMembro, setNovoMembro] = useState({ name: '', email: '', password: '', role: 'gerente' as 'gerente' | 'master' });
  const [criando, setCriando] = useState(false);
  const [assinaturas, setAssinaturas] = useState<SubscriptionRow[]>([]);
  const [carregandoAssinaturas, setCarregandoAssinaturas] = useState(true);
  const [erroAssinaturas, setErroAssinaturas] = useState('');
  const [processandoId, setProcessandoId] = useState<number | null>(null);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const carregarEquipe = () => {
    setCarregandoEquipe(true);
    setErroEquipe('');
    listarEquipe()
      .then(({ equipe }) => setEquipe(equipe))
      .catch((err) => setErroEquipe(err instanceof ApiError ? err.message : 'Não foi possível carregar a equipe.'))
      .finally(() => setCarregandoEquipe(false));
  };

  useEffect(carregarEquipe, []);

  const carregarAssinaturas = () => {
    setCarregandoAssinaturas(true);
    setErroAssinaturas('');
    listarAssinaturas()
      .then(({ assinaturas }) => setAssinaturas(assinaturas))
      .catch((err) => setErroAssinaturas(err instanceof ApiError ? err.message : 'Não foi possível carregar as assinaturas.'))
      .finally(() => setCarregandoAssinaturas(false));
  };

  useEffect(carregarAssinaturas, []);

  const handleRegistrarPagamento = async (userId: number) => {
    setProcessandoId(userId);
    setErroAssinaturas('');
    try {
      await registrarPagamento(userId);
      carregarAssinaturas();
    } catch (err) {
      setErroAssinaturas(err instanceof ApiError ? err.message : 'Não foi possível registrar o pagamento.');
    } finally {
      setProcessandoId(null);
    }
  };

  const handleCancelarAssinatura = async (userId: number) => {
    setProcessandoId(userId);
    setErroAssinaturas('');
    try {
      await cancelarAssinatura(userId);
      carregarAssinaturas();
    } catch (err) {
      setErroAssinaturas(err instanceof ApiError ? err.message : 'Não foi possível cancelar a assinatura.');
    } finally {
      setProcessandoId(null);
    }
  };

  const criarMembro = async (e: React.FormEvent) => {
    e.preventDefault();
    setCriando(true);
    setErroEquipe('');
    try {
      await criarMembroEquipe(novoMembro);
      setNovoMembro({ name: '', email: '', password: '', role: 'gerente' });
      setMostrarForm(false);
      carregarEquipe();
    } catch (err) {
      setErroEquipe(err instanceof ApiError ? err.message : 'Não foi possível criar a conta.');
    } finally {
      setCriando(false);
    }
  };

  const receitaEstimada = mockPlans.find((p) => p.id === 'plano-vip');
  const vipAtivos = assinaturas.filter((a) => a.is_vip === 1).length;
  const vipVencendoEm7Dias = assinaturas.filter((a) => a.status === 'ativo' && a.vence_em && diasRestantes(a.vence_em) <= 7 && diasRestantes(a.vence_em) >= 0).length;

  return (
    <DashboardLayout title="Painel do Admin Master" navItems={NAV} activeKey={tab} onSelect={setTab} manualHref="/manual/administrativo">

      {erro && (
        <div className="flex items-start space-x-2 bg-red-500/10 border border-red-500/30 p-3 text-xs text-red-300 mb-4">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{erro}</span>
        </div>
      )}

      {tab === 'painel' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-7 gap-4">
            {[
              { label: 'Membros da equipe', value: carregandoEquipe ? '...' : equipe.length },
              { label: 'Anúncios pendentes', value: carregando ? '...' : pendingProfiles.length },
              { label: 'Fotos pendentes', value: carregando ? '...' : pendingMedia.length },
              { label: 'Documentos pendentes', value: carregando ? '...' : pendingDocuments.length },
              { label: 'Selfies pendentes', value: carregando ? '...' : pendingSelfies.length },
              { label: 'Denúncias abertas', value: carregando ? '...' : reports.length },
              { label: 'Ações no log', value: carregando ? '...' : auditLog.length },
            ].map((s) => (
              <div key={s.label} className="bg-grafite border border-white/10 p-4 space-y-1.5">
                <span className="text-[11px] text-nevoa uppercase tracking-wider">{s.label}</span>
                <div className="text-xl font-display text-marfim">{s.value}</div>
              </div>
            ))}
          </div>

          <Link
            to="/painel/gerente"
            className="flex items-center justify-between bg-grafite border border-ouro/20 hover:border-ouro/40 p-5 transition-colors group"
          >
            <div className="flex items-center space-x-3">
              <ShieldCheck className="w-5 h-5 text-ouro" />
              <div>
                <div className="text-sm font-semibold text-marfim">Fila de moderação</div>
                <div className="text-xs text-nevoa">Como Admin Master você também aprova anúncios e denúncias, no painel do gerente.</div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-ouro group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      )}

      {tab === 'equipe' && (
        <div className="max-w-2xl space-y-4">
          {erroEquipe && (
            <div className="flex items-start space-x-2 bg-red-500/10 border border-red-500/30 p-3 text-xs text-red-300">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{erroEquipe}</span>
            </div>
          )}

          <div className="border border-white/10 divide-y divide-white/10">
            {!carregandoEquipe && equipe.length === 0 && (
              <p className="text-sm text-nevoa p-4">Nenhum membro cadastrado.</p>
            )}
            {equipe.map((m) => (
              <div key={m.id} className="flex items-center justify-between gap-3 p-4">
                <div>
                  <div className="text-sm font-semibold text-marfim">{m.name}</div>
                  <div className="text-xs text-nevoa">{m.email}</div>
                </div>
                <span className="text-[11px] px-2.5 py-1 rounded-campo bg-ouro/10 border border-ouro/20 text-ouro font-semibold uppercase">{ROTULO_PAPEL[m.role]}</span>
              </div>
            ))}
          </div>

          {mostrarForm ? (
            <form onSubmit={criarMembro} className="border border-ouro/30 bg-grafite p-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-nevoa mb-1.5">Nome</label>
                <input
                  required
                  value={novoMembro.name}
                  onChange={(e) => setNovoMembro({ ...novoMembro, name: e.target.value })}
                  className="w-full bg-onix text-marfim text-sm rounded-campo px-3 py-2 border border-white/15 focus:border-ouro outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-nevoa mb-1.5">E-mail</label>
                <input
                  type="email"
                  required
                  value={novoMembro.email}
                  onChange={(e) => setNovoMembro({ ...novoMembro, email: e.target.value })}
                  className="w-full bg-onix text-marfim text-sm rounded-campo px-3 py-2 border border-white/15 focus:border-ouro outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-nevoa mb-1.5">Senha provisória</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={novoMembro.password}
                  onChange={(e) => setNovoMembro({ ...novoMembro, password: e.target.value })}
                  className="w-full bg-onix text-marfim text-sm rounded-campo px-3 py-2 border border-white/15 focus:border-ouro outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-nevoa mb-1.5">Papel</label>
                <select
                  value={novoMembro.role}
                  onChange={(e) => setNovoMembro({ ...novoMembro, role: e.target.value as 'gerente' | 'master' })}
                  className="w-full bg-onix text-marfim text-sm rounded-campo px-3 py-2 border border-white/15 focus:border-ouro outline-none"
                >
                  <option value="gerente">Gerente</option>
                  <option value="master">Admin Master</option>
                </select>
              </div>
              <div className="flex items-center space-x-2 pt-1">
                <button
                  type="submit"
                  disabled={criando}
                  className="px-4 py-2 rounded-campo bg-ouro hover:bg-champanhe text-black font-bold text-sm transition-colors disabled:opacity-60"
                >
                  {criando ? 'Criando...' : 'Criar conta'}
                </button>
                <button
                  type="button"
                  onClick={() => setMostrarForm(false)}
                  className="px-4 py-2 rounded-campo bg-white/5 border border-white/10 text-nevoa hover:text-marfim text-sm font-semibold transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setMostrarForm(true)}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-campo bg-ouro hover:bg-champanhe text-black font-bold text-sm transition-colors"
            >
              <UserPlus className="w-4 h-4" /><span>Adicionar membro</span>
            </button>
          )}
        </div>
      )}

      {tab === 'financeiro' && (
        <div className="max-w-4xl space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-grafite border border-white/10 p-4 space-y-1.5">
              <span className="text-[11px] text-nevoa uppercase tracking-wider">Assinantes VIP ativos</span>
              <div className="text-2xl font-display text-ouro">{carregandoAssinaturas ? '...' : vipAtivos}</div>
              <span className="text-[11px] text-nevoa">de {assinaturas.length} profissionais cadastradas</span>
            </div>
            <div className="bg-grafite border border-white/10 p-4 space-y-1.5">
              <span className="text-[11px] text-nevoa uppercase tracking-wider">Receita mensal estimada</span>
              <div className="text-2xl font-display text-ouro">{receitaEstimada ? `R$ ${(vipAtivos * Number(receitaEstimada.price.replace(/\D/g, ''))).toLocaleString('pt-BR')}` : '—'}</div>
              <span className="text-[11px] text-nevoa">{vipAtivos} × {receitaEstimada?.price}</span>
            </div>
            <div className={`border p-4 space-y-1.5 ${vipVencendoEm7Dias > 0 ? 'bg-red-500/10 border-red-500/30' : 'bg-grafite border-white/10'}`}>
              <span className="text-[11px] text-nevoa uppercase tracking-wider">Vencendo em até 7 dias</span>
              <div className={`text-2xl font-display ${vipVencendoEm7Dias > 0 ? 'text-red-300' : 'text-marfim'}`}>{carregandoAssinaturas ? '...' : vipVencendoEm7Dias}</div>
              <span className="text-[11px] text-nevoa">precisa cobrar logo</span>
            </div>
          </div>

          <p className="text-xs text-nevoa">Pagamento é conciliado manualmente via PIX fora do site — registre aqui quando receber, e o selo VIP é removido sozinho se a data de vencimento passar sem renovação.</p>

          {erroAssinaturas && (
            <div className="flex items-start space-x-2 bg-red-500/10 border border-red-500/30 p-3 text-xs text-red-300">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{erroAssinaturas}</span>
            </div>
          )}

          <div className="border border-white/10 divide-y divide-white/10">
            {!carregandoAssinaturas && assinaturas.length === 0 && (
              <p className="text-sm text-nevoa p-4">Nenhuma profissional cadastrada ainda.</p>
            )}
            {assinaturas.map((a) => {
              const dias = a.vence_em ? diasRestantes(a.vence_em) : null;
              const vencendo = dias !== null && dias <= 7 && dias >= 0 && a.status === 'ativo';
              const vencido = a.status === 'vencido' || (dias !== null && dias < 0 && a.status === 'ativo');
              return (
                <div key={a.user_id} className="flex flex-col sm:flex-row sm:items-center gap-3 p-3.5">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-marfim">{a.stage_name}</span>
                      {a.is_vip === 1 ? (
                        <span className="text-[10px] px-2 py-0.5 rounded-campo bg-ouro/15 border border-ouro/30 text-ouro font-bold uppercase">VIP</span>
                      ) : (
                        <span className="text-[10px] px-2 py-0.5 rounded-campo bg-white/5 border border-white/10 text-nevoa uppercase">Sem VIP</span>
                      )}
                    </div>
                    <div className="text-xs text-nevoa">{a.email}</div>
                    <div className="text-[11px] mt-0.5 flex items-center gap-1.5">
                      {!a.vence_em && <span className="text-nevoa">Nunca pagou</span>}
                      {a.vence_em && vencido && (
                        <span className="text-red-400 font-semibold flex items-center gap-1"><XCircle className="w-3 h-3" />Vencido em {fmtDataCurta(a.vence_em)}</span>
                      )}
                      {a.vence_em && !vencido && vencendo && (
                        <span className="text-amber-400 font-semibold flex items-center gap-1"><Clock className="w-3 h-3" />Vence em {dias} dia(s) — {fmtDataCurta(a.vence_em)}</span>
                      )}
                      {a.vence_em && !vencido && !vencendo && a.status === 'ativo' && (
                        <span className="text-verificado-texto flex items-center gap-1"><CheckCircle2 className="w-3 h-3" />Em dia até {fmtDataCurta(a.vence_em)}</span>
                      )}
                      {a.status === 'cancelado' && <span className="text-nevoa">Cancelado</span>}
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => handleRegistrarPagamento(a.user_id)}
                      disabled={processandoId === a.user_id}
                      className="flex items-center space-x-1.5 px-3 py-1.5 rounded-campo bg-verificado hover:opacity-90 text-marfim text-xs font-bold transition-opacity disabled:opacity-60"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /><span>Registrar pagamento</span>
                    </button>
                    {a.is_vip === 1 && (
                      <button
                        onClick={() => handleCancelarAssinatura(a.user_id)}
                        disabled={processandoId === a.user_id}
                        className="flex items-center space-x-1.5 px-3 py-1.5 rounded-campo bg-white/5 border border-white/15 hover:border-red-400/40 text-nevoa hover:text-red-300 text-xs font-bold transition-colors disabled:opacity-60"
                      >
                        <XCircle className="w-3.5 h-3.5" /><span>Cancelar VIP</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div>
            <h3 className="text-sm font-semibold text-marfim mb-2">Planos de referência</h3>
            <div className="border border-white/10 divide-y divide-white/10">
              {mockPlans.map((p) => (
                <div key={p.id} className="flex items-center justify-between p-3.5 text-sm">
                  <span className="text-marfim">{p.name}</span>
                  <span className="text-ouro font-mono">{p.price}{p.period}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'auditoria' && (
        <div className="max-w-3xl">
          <p className="text-xs text-nevoa mb-3">Log completo de ações administrativas — visível apenas ao Admin Master.</p>
          <div className="border border-white/10 divide-y divide-white/10">
            {auditLog.map((a) => (
              <div key={a.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 p-3 text-xs">
                <div>
                  <span className="text-ouro font-mono">{a.actor_role ? ROTULO_PAPEL[a.actor_role] : '—'}</span>
                  <span className="text-nevoa"> · {a.actor_name ?? 'Conta removida'} — </span>
                  <span className="text-marfim">{a.action}</span>
                  <span className="text-nevoa"> · {a.target}</span>
                </div>
                <div className="text-nevoa shrink-0 font-mono">{fmtData(a.created_at)}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

export const AdminDashboard: React.FC = () => (
  <RequireRole allow={['master']}>
    <AdminDashboardContent />
  </RequireRole>
);
