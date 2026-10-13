import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, Wallet, History, ShieldCheck, ArrowRight,
  UserPlus, AlertCircle, Trash2, Check, X, ShieldAlert, Pencil,
} from 'lucide-react';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { RequireRole } from '../../components/RequireRole';
import { useModeration } from '../../context/ModerationContext';
import { useSession } from '../../context/SessionContext';
import {
  listarEquipe, criarMembroEquipe, atualizarMembroEquipe, excluirMembroEquipe,
  ApiError, type StaffMember,
} from '../../lib/api';
import { FinancePanel } from './FinancePanel';

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

function LinhaMembroEquipe({
  membro,
  souEu,
  onAtualizar,
}: {
  membro: StaffMember;
  souEu: boolean;
  onAtualizar: () => void;
}) {
  const [editando, setEditando] = useState(false);
  const [novoNome, setNovoNome] = useState(membro.name);
  const [novoPapel, setNovoPapel] = useState<'gerente' | 'master'>(membro.role);
  const [salvando, setSalvando] = useState(false);
  const [confirmandoExclusao, setConfirmandoExclusao] = useState(false);
  const [excluindo, setExcluindo] = useState(false);
  const [erro, setErro] = useState('');

  const salvarEdicao = async () => {
    const nomeLimpo = novoNome.trim();
    if (!nomeLimpo) {
      setErro('O nome não pode ficar vazio.');
      return;
    }
    if (novoPapel === membro.role && nomeLimpo === membro.name) {
      setEditando(false);
      return;
    }
    setSalvando(true);
    setErro('');
    try {
      await atualizarMembroEquipe(membro.id, {
        name: nomeLimpo !== membro.name ? nomeLimpo : undefined,
        role: novoPapel !== membro.role ? novoPapel : undefined,
      });
      setEditando(false);
      onAtualizar();
    } catch (err) {
      setErro(err instanceof ApiError ? err.message : 'Não foi possível salvar as alterações.');
    } finally {
      setSalvando(false);
    }
  };

  const confirmarExcluir = async () => {
    setExcluindo(true);
    setErro('');
    try {
      await excluirMembroEquipe(membro.id);
      onAtualizar();
    } catch (err) {
      setErro(err instanceof ApiError ? err.message : 'Não foi possível excluir o membro.');
      setExcluindo(false);
      setConfirmandoExclusao(false);
    }
  };

  return (
    <div className="p-4 space-y-3 transition-colors hover:bg-white/[0.02]">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-semibold text-marfim">{membro.name}</span>
            {souEu && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-nevoa font-mono uppercase tracking-wide">
                Você
              </span>
            )}
          </div>
          <div className="text-xs text-nevoa">{membro.email}</div>
        </div>

        <div className="flex items-center flex-wrap gap-2 shrink-0">
          <span
            className={`text-[11px] px-2.5 py-1 rounded-campo font-semibold uppercase ${
              membro.role === 'master'
                ? 'bg-ouro/15 border border-ouro/30 text-ouro'
                : 'bg-white/10 border border-white/20 text-nevoa'
            }`}
          >
            {ROTULO_PAPEL[membro.role]}
          </span>

          {!editando && !confirmandoExclusao && (
            <>
              <button
                type="button"
                onClick={() => {
                  setNovoNome(membro.name);
                  setNovoPapel(membro.role);
                  setEditando(true);
                  setConfirmandoExclusao(false);
                  setErro('');
                }}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-campo bg-white/5 border border-white/15 text-nevoa hover:text-marfim hover:border-ouro/40 text-xs font-semibold transition-colors"
                title="Editar dados e permissões do membro"
              >
                <Pencil className="w-3.5 h-3.5 text-ouro" />
                <span>Editar</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setConfirmandoExclusao(true);
                  setEditando(false);
                  setErro('');
                }}
                disabled={souEu}
                title={souEu ? 'Você não pode excluir sua própria conta' : 'Excluir membro da equipe'}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-campo bg-white/5 border border-white/15 hover:border-red-500/40 text-nevoa hover:text-red-300 text-xs font-semibold transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Excluir</span>
              </button>
            </>
          )}
        </div>
      </div>

      {erro && (
        <div className="flex items-start space-x-2 bg-red-500/10 border border-red-500/30 p-2.5 text-xs text-red-300 rounded-campo">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{erro}</span>
        </div>
      )}

      {/* Painel inline de alteração de permissão */}
      {editando && (
        <div className="bg-grafite border border-ouro/30 p-3.5 rounded-campo space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-ouro uppercase tracking-wider">
              Editar membro: {membro.name}
            </span>
            <button
              type="button"
              onClick={() => {
                setEditando(false);
                setErro('');
              }}
              className="text-nevoa hover:text-marfim text-xs p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-nevoa mb-1">Nome</label>
            <input
              type="text"
              required
              value={novoNome}
              onChange={(e) => setNovoNome(e.target.value)}
              className="w-full bg-onix text-marfim text-xs rounded-campo px-3 py-2 border border-white/15 focus:border-ouro outline-none"
              placeholder="Nome do membro"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-nevoa mb-1">Permissão / Papel</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <label
                className={`flex items-start space-x-2.5 p-2.5 border rounded-campo cursor-pointer transition-colors ${
                  novoPapel === 'gerente'
                    ? 'border-ouro bg-ouro/10 text-marfim'
                    : 'border-white/10 hover:border-white/20 text-nevoa'
                }`}
              >
                <input
                  type="radio"
                  name={`papel-${membro.id}`}
                  value="gerente"
                  checked={novoPapel === 'gerente'}
                  onChange={() => setNovoPapel('gerente')}
                  className="mt-0.5 accent-[#c5a880]"
                />
                <div className="text-xs">
                  <div className="font-bold text-marfim">Gerente</div>
                  <div className="text-[11px] text-nevoa">Moderação de anúncios, fotos, documentos e denúncias.</div>
                </div>
              </label>

              <label
                className={`flex items-start space-x-2.5 p-2.5 border rounded-campo cursor-pointer transition-colors ${
                  novoPapel === 'master'
                    ? 'border-ouro bg-ouro/10 text-marfim'
                    : 'border-white/10 hover:border-white/20 text-nevoa'
                }`}
              >
                <input
                  type="radio"
                  name={`papel-${membro.id}`}
                  value="master"
                  checked={novoPapel === 'master'}
                  onChange={() => setNovoPapel('master')}
                  className="mt-0.5 accent-[#c5a880]"
                />
                <div className="text-xs">
                  <div className="font-bold text-marfim">Admin Master</div>
                  <div className="text-[11px] text-nevoa">Acesso total administrativo, equipe, financeiro e auditoria.</div>
                </div>
              </label>
            </div>
          </div>

          <div className="flex items-center space-x-2 pt-1">
            <button
              type="button"
              onClick={salvarEdicao}
              disabled={salvando || (novoPapel === membro.role && novoNome.trim() === membro.name)}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-campo bg-ouro hover:bg-champanhe text-black font-bold text-xs transition-colors disabled:opacity-50"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{salvando ? 'Salvando...' : 'Salvar alterações'}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setEditando(false);
                setNovoNome(membro.name);
                setNovoPapel(membro.role);
                setErro('');
              }}
              className="px-3.5 py-1.5 rounded-campo bg-white/5 border border-white/10 text-nevoa hover:text-marfim text-xs font-semibold transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Confirmação inline de exclusão */}
      {confirmandoExclusao && (
        <div className="bg-red-500/10 border border-red-500/30 p-3.5 rounded-campo space-y-2.5">
          <div className="flex items-center space-x-2 text-xs text-red-200">
            <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
            <span>
              Tem certeza que deseja excluir o membro <strong>{membro.name}</strong> ({membro.email})? A conta perderá acesso ao painel imediatamente.
            </span>
          </div>
          <div className="flex items-center space-x-2 pt-1">
            <button
              type="button"
              onClick={confirmarExcluir}
              disabled={excluindo}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-campo bg-red-500/20 border border-red-500/40 text-red-200 hover:bg-red-500/30 text-xs font-bold transition-colors disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{excluindo ? 'Excluindo...' : 'Confirmar exclusão'}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setConfirmandoExclusao(false);
                setErro('');
              }}
              className="px-3 py-1.5 rounded-campo bg-white/5 border border-white/15 text-nevoa hover:text-marfim text-xs font-semibold transition-colors"
            >
              Voltar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function AdminDashboardContent() {
  const [tab, setTab] = useState('painel');
  const navigate = useNavigate();
  const { session } = useSession();
  const { pendingProfiles, reports, pendingMedia, pendingDocuments, pendingSelfies, auditLog, carregando, erro, refresh } = useModeration();
  const [equipe, setEquipe] = useState<StaffMember[]>([]);
  const [carregandoEquipe, setCarregandoEquipe] = useState(true);
  const [erroEquipe, setErroEquipe] = useState('');
  const [mostrarForm, setMostrarForm] = useState(false);
  const [novoMembro, setNovoMembro] = useState({ name: '', email: '', password: '', role: 'gerente' as 'gerente' | 'master' });
  const [criando, setCriando] = useState(false);

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

  const criarMembro = async (e: React.FormEvent) => {
    e.preventDefault();
    setCriando(true);
    setErroEquipe('');
    try {
      await criarMembroEquipe(novoMembro);
      setNovoMembro({ name: '', email: '', password: '', role: 'gerente' });
      setMostrarForm(false);
      carregarEquipe();
      refresh();
    } catch (err) {
      setErroEquipe(err instanceof ApiError ? err.message : 'Não foi possível criar a conta.');
    } finally {
      setCriando(false);
    }
  };

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
              { label: 'Membros da equipe', value: carregandoEquipe ? '...' : equipe.length, acao: () => setTab('equipe') },
              { label: 'Anúncios pendentes', value: carregando ? '...' : pendingProfiles.length, acao: () => navigate('/painel/gerente') },
              { label: 'Fotos pendentes', value: carregando ? '...' : pendingMedia.length, acao: () => navigate('/painel/gerente') },
              { label: 'Documentos pendentes', value: carregando ? '...' : pendingDocuments.length, acao: () => navigate('/painel/gerente') },
              { label: 'Selfies pendentes', value: carregando ? '...' : pendingSelfies.length, acao: () => navigate('/painel/gerente') },
              { label: 'Denúncias abertas', value: carregando ? '...' : reports.length, acao: () => navigate('/painel/gerente') },
              { label: 'Ações no log', value: carregando ? '...' : auditLog.length, acao: () => setTab('auditoria') },
            ].map((s) => (
              <button
                key={s.label}
                onClick={s.acao}
                className="text-left bg-grafite border border-white/10 hover:border-ouro/40 p-4 space-y-1.5 transition-colors cursor-pointer"
              >
                <span className="text-[11px] text-nevoa uppercase tracking-wider">{s.label}</span>
                <div className="text-xl font-display text-marfim">{s.value}</div>
              </button>
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
            {equipe.map((m) => {
              const souEu = Boolean((session?.id && session.id === m.id) || (session?.email && session.email === m.email));
              return (
                <LinhaMembroEquipe
                  key={m.id}
                  membro={m}
                  souEu={souEu}
                  onAtualizar={() => {
                    carregarEquipe();
                    refresh();
                  }}
                />
              );
            })}
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

      {tab === 'financeiro' && <FinancePanel />}

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
