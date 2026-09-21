import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard, Users, Wallet, History, ShieldCheck, ArrowRight,
  UserPlus, CircleDot, AlertCircle,
} from 'lucide-react';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { RequireRole } from '../../components/RequireRole';
import { useModeration } from '../../context/ModerationContext';
import { mockTeam, mockPlans } from '../../data/mockModeration';

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

function AdminDashboardContent() {
  const [tab, setTab] = useState('painel');
  const { pendingProfiles, reports, pendingMedia, auditLog, carregando, erro, refresh } = useModeration();

  useEffect(() => {
    refresh();
  }, [refresh]);

  const receitaEstimada = mockPlans.find((p) => p.id === 'plano-vip');

  return (
    <DashboardLayout title="Painel do Admin Master" navItems={NAV} activeKey={tab} onSelect={setTab}>

      {erro && (
        <div className="flex items-start space-x-2 bg-red-500/10 border border-red-500/30 p-3 text-xs text-red-300 mb-4">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{erro}</span>
        </div>
      )}

      {tab === 'painel' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            {[
              { label: 'Membros da equipe', value: mockTeam.length },
              { label: 'Anúncios pendentes', value: carregando ? '...' : pendingProfiles.length },
              { label: 'Fotos pendentes', value: carregando ? '...' : pendingMedia.length },
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
          <div className="border border-white/10 divide-y divide-white/10">
            {mockTeam.map((m) => (
              <div key={m.id} className="flex items-center justify-between gap-3 p-4">
                <div>
                  <div className="text-sm font-semibold text-marfim">{m.name}</div>
                  <div className="text-xs text-nevoa">{m.email}</div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-[11px] px-2.5 py-1 rounded-campo bg-ouro/10 border border-ouro/20 text-ouro font-semibold uppercase">{ROTULO_PAPEL[m.role]}</span>
                  <span className={`flex items-center space-x-1 text-[11px] ${m.active ? 'text-verificado-texto' : 'text-nevoa'}`}>
                    <CircleDot className="w-3 h-3" /><span>{m.active ? 'Ativo' : 'Inativo'}</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
          <button className="flex items-center space-x-2 px-4 py-2.5 rounded-campo bg-ouro hover:bg-champanhe text-black font-bold text-sm transition-colors">
            <UserPlus className="w-4 h-4" /><span>Convidar novo gerente</span>
          </button>
        </div>
      )}

      {tab === 'financeiro' && (
        <div className="max-w-3xl space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-grafite border border-white/10 p-4 space-y-1.5">
              <span className="text-[11px] text-nevoa uppercase tracking-wider">Assinantes VIP</span>
              <div className="text-2xl font-display text-ouro">18</div>
              <span className="text-[11px] text-nevoa">de {mockTeam.length + pendingProfiles.length} anúncios cadastrados</span>
            </div>
            <div className="bg-grafite border border-white/10 p-4 space-y-1.5">
              <span className="text-[11px] text-nevoa uppercase tracking-wider">Receita mensal estimada</span>
              <div className="text-2xl font-display text-ouro">R$ 1.602</div>
              <span className="text-[11px] text-nevoa">18 × {receitaEstimada?.price}</span>
            </div>
            <div className="bg-grafite border border-white/10 p-4 space-y-1.5">
              <span className="text-[11px] text-nevoa uppercase tracking-wider">Custo de infraestrutura</span>
              <div className="text-2xl font-display text-marfim">R$ 180</div>
              <span className="text-[11px] text-nevoa">VPS + domínio + backup</span>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-marfim mb-2">Planos ativos</h3>
            <div className="border border-white/10 divide-y divide-white/10">
              {mockPlans.map((p) => (
                <div key={p.id} className="flex items-center justify-between p-3.5 text-sm">
                  <span className="text-marfim">{p.name}</span>
                  <span className="text-ouro font-mono">{p.price}{p.period}</span>
                </div>
              ))}
            </div>
          </div>
          <p className="text-xs text-nevoa">Pagamentos são conciliados manualmente via PIX nesta fase — sem gateway automatizado, como descrito no plano estratégico.</p>
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
