import React, { useState } from 'react';
import {
  LayoutDashboard, ClipboardCheck, Flag, History, CheckCircle2, XCircle,
  Clock, MapPin, ShieldAlert,
} from 'lucide-react';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { RequireRole } from '../../components/RequireRole';
import { useModeration } from '../../context/ModerationContext';
import { useSession } from '../../context/SessionContext';

const NAV = [
  { key: 'painel', label: 'Painel', icon: <LayoutDashboard className="w-4 h-4" /> },
  { key: 'aprovacoes', label: 'Aprovações', icon: <ClipboardCheck className="w-4 h-4" /> },
  { key: 'denuncias', label: 'Denúncias', icon: <Flag className="w-4 h-4" /> },
  { key: 'historico', label: 'Histórico', icon: <History className="w-4 h-4" /> },
];

function fmtData(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

function ManagerDashboardContent() {
  const [tab, setTab] = useState('painel');
  const { pendingProfiles, reports, auditLog, decideProfile, decideReport } = useModeration();
  const { session } = useSession();
  const ator = session?.name ?? 'Gerente';

  const pendentes = pendingProfiles.filter((p) => p.status === 'pendente');
  const denunciasPendentes = reports.filter((r) => r.status === 'pendente');

  return (
    <DashboardLayout title="Painel do Gerente" navItems={NAV} activeKey={tab} onSelect={setTab}>

      {tab === 'painel' && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Anúncios pendentes', value: pendentes.length, icon: <ClipboardCheck className="w-4 h-4 text-ouro" /> },
            { label: 'Denúncias abertas', value: denunciasPendentes.length, icon: <Flag className="w-4 h-4 text-ouro" /> },
            { label: 'Aprovados (total)', value: pendingProfiles.filter((p) => p.status === 'aprovado').length, icon: <CheckCircle2 className="w-4 h-4 text-verificado-texto" /> },
            { label: 'Ações registradas', value: auditLog.length, icon: <History className="w-4 h-4 text-ouro" /> },
          ].map((s) => (
            <div key={s.label} className="bg-grafite border border-white/10 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-nevoa uppercase tracking-wider">{s.label}</span>
                {s.icon}
              </div>
              <div className="text-xl font-display text-marfim">{s.value}</div>
            </div>
          ))}
        </div>
      )}

      {tab === 'aprovacoes' && (
        <div className="space-y-3 max-w-3xl">
          {pendentes.length === 0 && <p className="text-sm text-nevoa">Nenhum anúncio pendente no momento.</p>}
          {pendentes.map((p) => (
            <div key={p.id} className="flex flex-col sm:flex-row sm:items-center gap-4 bg-grafite border border-white/10 p-4">
              <img src={p.coverImage} alt="" className="w-16 h-20 object-cover shrink-0" />
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-marfim">{p.name}, {p.age}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-campo bg-white/5 border border-white/10 text-nevoa uppercase">{p.category}</span>
                </div>
                <div className="flex items-center space-x-1.5 text-xs text-nevoa"><MapPin className="w-3 h-3 text-ouro" /><span>{p.city}</span></div>
                <div className="flex flex-wrap gap-2 text-[11px] text-nevoa pt-1">
                  <span className={`flex items-center space-x-1 ${p.verificationStatus.email ? 'text-verificado-texto' : ''}`}>{p.verificationStatus.email ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}<span>E-mail</span></span>
                  <span className={`flex items-center space-x-1 ${p.verificationStatus.telefone ? 'text-verificado-texto' : ''}`}>{p.verificationStatus.telefone ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}<span>Telefone</span></span>
                  <span className="flex items-center space-x-1"><Clock className="w-3.5 h-3.5" /><span>Documento: {p.verificationStatus.documento}</span></span>
                </div>
                <div className="text-[11px] text-nevoa">Enviado em {fmtData(p.submittedAt)}</div>
              </div>
              <div className="flex sm:flex-col gap-2 shrink-0">
                <button
                  onClick={() => decideProfile(p.id, 'aprovado', ator)}
                  className="flex-1 sm:flex-none flex items-center justify-center space-x-1.5 px-4 py-2 rounded-campo bg-verificado hover:opacity-90 text-marfim text-xs font-bold transition-opacity"
                >
                  <CheckCircle2 className="w-4 h-4" /><span>Aprovar</span>
                </button>
                <button
                  onClick={() => decideProfile(p.id, 'reprovado', ator)}
                  className="flex-1 sm:flex-none flex items-center justify-center space-x-1.5 px-4 py-2 rounded-campo bg-white/5 border border-white/15 hover:border-red-400/40 text-nevoa hover:text-red-300 text-xs font-bold transition-colors"
                >
                  <XCircle className="w-4 h-4" /><span>Reprovar</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'denuncias' && (
        <div className="space-y-3 max-w-3xl">
          {denunciasPendentes.length === 0 && <p className="text-sm text-nevoa">Nenhuma denúncia em aberto.</p>}
          {denunciasPendentes.map((r) => (
            <div key={r.id} className="bg-grafite border border-white/10 p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-ouro shrink-0" />
                    <span className="text-sm font-semibold text-marfim">{r.reason}</span>
                    {r.anonymous && <span className="text-[10px] px-2 py-0.5 rounded-campo bg-white/5 border border-white/10 text-nevoa">Anônima</span>}
                  </div>
                  <p className="text-xs text-nevoa mt-1">Sobre: <strong className="text-marfim">{r.targetName}</strong> · {fmtData(r.reportedAt)}</p>
                </div>
              </div>
              <p className="text-xs text-nevoa bg-white/5 border border-white/10 p-3">{r.details}</p>
              <div className="flex gap-2">
                <button
                  onClick={() => decideReport(r.id, 'aprovado', ator)}
                  className="flex items-center space-x-1.5 px-4 py-2 rounded-campo bg-red-500/15 border border-red-500/30 hover:bg-red-500/25 text-red-300 text-xs font-bold transition-colors"
                >
                  <CheckCircle2 className="w-4 h-4" /><span>Procede — suspender anúncio</span>
                </button>
                <button
                  onClick={() => decideReport(r.id, 'reprovado', ator)}
                  className="flex items-center space-x-1.5 px-4 py-2 rounded-campo bg-white/5 border border-white/15 text-nevoa hover:text-marfim text-xs font-bold transition-colors"
                >
                  <XCircle className="w-4 h-4" /><span>Arquivar</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'historico' && (
        <div className="max-w-3xl">
          <p className="text-xs text-nevoa mb-3">O gerente vê o histórico das próprias ações de moderação. O log completo, com acesso de qualquer membro da equipe, fica no painel do Admin Master.</p>
          <div className="border border-white/10 divide-y divide-white/10">
            {auditLog.map((a) => (
              <div key={a.id} className="flex items-center justify-between gap-3 p-3 text-xs">
                <div>
                  <span className="text-marfim font-medium">{a.action}</span>
                  <span className="text-nevoa"> — {a.target}</span>
                </div>
                <div className="text-nevoa shrink-0 font-mono">{fmtData(a.timestamp)}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

export const ManagerDashboard: React.FC = () => (
  <RequireRole allow={['gerente', 'master']}>
    <ManagerDashboardContent />
  </RequireRole>
);
