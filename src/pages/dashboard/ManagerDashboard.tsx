import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard, ClipboardCheck, Flag, History, CheckCircle2, XCircle,
  MapPin, ShieldAlert, AlertCircle, Images, FileText, Eye,
} from 'lucide-react';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { RequireRole } from '../../components/RequireRole';
import { useModeration } from '../../context/ModerationContext';
import { buscarArquivoDocumento, ApiError, type PendingDocument } from '../../lib/api';

const NAV = [
  { key: 'painel', label: 'Painel', icon: <LayoutDashboard className="w-4 h-4" /> },
  { key: 'aprovacoes', label: 'Aprovações', icon: <ClipboardCheck className="w-4 h-4" /> },
  { key: 'fotos', label: 'Fotos', icon: <Images className="w-4 h-4" /> },
  { key: 'documentos', label: 'Documentos', icon: <FileText className="w-4 h-4" /> },
  { key: 'denuncias', label: 'Denúncias', icon: <Flag className="w-4 h-4" /> },
  { key: 'historico', label: 'Histórico', icon: <History className="w-4 h-4" /> },
];

function fmtData(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

function VerDocumentoButton({ userId }: { userId: number }) {
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');

  const abrir = async () => {
    setCarregando(true);
    setErro('');
    try {
      const url = await buscarArquivoDocumento(userId);
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (err) {
      setErro(err instanceof ApiError ? err.message : 'Não foi possível abrir o documento.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        onClick={abrir}
        disabled={carregando}
        className="flex items-center space-x-1.5 px-3 py-1.5 rounded-campo bg-white/10 border border-white/20 text-marfim text-xs font-bold hover:bg-white/20 transition-colors disabled:opacity-60"
      >
        <Eye className="w-3.5 h-3.5" /><span>{carregando ? 'Abrindo...' : 'Ver documento'}</span>
      </button>
      {erro && <span className="text-[10px] text-red-400">{erro}</span>}
    </div>
  );
}

function ManagerDashboardContent() {
  const [tab, setTab] = useState('painel');
  const { pendingProfiles, reports, pendingMedia, pendingDocuments, auditLog, carregando, erro, refresh, decideProfile, decideReport, decideMedia, decideDocument } = useModeration();

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <DashboardLayout title="Painel do Gerente" navItems={NAV} activeKey={tab} onSelect={setTab} manualHref="/manual/administrativo">

      {erro && (
        <div className="flex items-start space-x-2 bg-red-500/10 border border-red-500/30 p-3 text-xs text-red-300 mb-4">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{erro}</span>
        </div>
      )}

      {tab === 'painel' && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {[
            { label: 'Anúncios pendentes', value: pendingProfiles.length, icon: <ClipboardCheck className="w-4 h-4 text-ouro" /> },
            { label: 'Fotos pendentes', value: pendingMedia.length, icon: <Images className="w-4 h-4 text-ouro" /> },
            { label: 'Documentos pendentes', value: pendingDocuments.length, icon: <FileText className="w-4 h-4 text-ouro" /> },
            { label: 'Denúncias abertas', value: reports.length, icon: <Flag className="w-4 h-4 text-ouro" /> },
            { label: 'Ações registradas', value: auditLog.length, icon: <History className="w-4 h-4 text-ouro" /> },
          ].map((s) => (
            <div key={s.label} className="bg-grafite border border-white/10 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-nevoa uppercase tracking-wider">{s.label}</span>
                {s.icon}
              </div>
              <div className="text-xl font-display text-marfim">{carregando ? '...' : s.value}</div>
            </div>
          ))}
        </div>
      )}

      {tab === 'aprovacoes' && (
        <div className="space-y-3 max-w-3xl">
          {!carregando && pendingProfiles.length === 0 && <p className="text-sm text-nevoa">Nenhum anúncio pendente no momento.</p>}
          {pendingProfiles.map((p) => {
            const semFoto = p.approved_photos === 0;
            return (
              <div key={p.id} className="flex flex-col sm:flex-row sm:items-center gap-4 bg-grafite border border-white/10 p-4">
                {p.thumbnail_url ? (
                  <img src={p.thumbnail_url} alt="" className="w-16 h-20 object-cover shrink-0" />
                ) : (
                  <div className="w-16 h-20 shrink-0 bg-white/5 border border-white/10 flex items-center justify-center text-[10px] text-nevoa text-center px-1">Sem foto</div>
                )}
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-marfim">{p.stage_name}, {p.age}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-campo bg-white/5 border border-white/10 text-nevoa uppercase">{p.category}</span>
                  </div>
                  <div className="flex items-center space-x-1.5 text-xs text-nevoa"><MapPin className="w-3 h-3 text-ouro" /><span>{p.city}</span></div>
                  <div className="text-[11px] text-nevoa">WhatsApp: {p.whatsapp}</div>
                  <div className="text-[11px] text-nevoa">Enviado em {fmtData(p.submitted_at)}</div>
                  <div className={`text-[11px] font-semibold ${semFoto ? 'text-red-400' : 'text-verificado-texto'}`}>
                    {p.approved_photos} foto(s) aprovada(s){semFoto && ' — precisa de pelo menos 1 pra aprovar'}
                  </div>
                </div>
                <div className="flex sm:flex-col gap-2 shrink-0">
                  <button
                    onClick={() => decideProfile(p.id, 'aprovado')}
                    disabled={semFoto}
                    title={semFoto ? 'Aprove pelo menos uma foto deste perfil primeiro' : undefined}
                    className="flex-1 sm:flex-none flex items-center justify-center space-x-1.5 px-4 py-2 rounded-campo bg-verificado hover:opacity-90 text-marfim text-xs font-bold transition-opacity disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <CheckCircle2 className="w-4 h-4" /><span>Aprovar</span>
                  </button>
                  <button
                    onClick={() => decideProfile(p.id, 'reprovado')}
                    className="flex-1 sm:flex-none flex items-center justify-center space-x-1.5 px-4 py-2 rounded-campo bg-white/5 border border-white/15 hover:border-red-400/40 text-nevoa hover:text-red-300 text-xs font-bold transition-colors"
                  >
                    <XCircle className="w-4 h-4" /><span>Reprovar</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {tab === 'fotos' && (
        <div className="space-y-3 max-w-3xl">
          {!carregando && pendingMedia.length === 0 && <p className="text-sm text-nevoa">Nenhuma foto pendente no momento.</p>}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {pendingMedia.map((m) => (
              <div key={m.id} className="bg-grafite border border-white/10 p-3 space-y-2">
                <img src={m.url} alt="" className="w-full aspect-[3/4] object-cover rounded-campo" />
                <div className="text-xs text-marfim font-semibold truncate">{m.profile_name}</div>
                <div className="text-[10px] text-nevoa">Enviada em {fmtData(m.created_at)}</div>
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => decideMedia(m.id, 'aprovado')}
                    className="flex-1 flex items-center justify-center space-x-1 px-2 py-1.5 rounded-campo bg-verificado hover:opacity-90 text-marfim text-[11px] font-bold transition-opacity"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /><span>Aprovar</span>
                  </button>
                  <button
                    onClick={() => decideMedia(m.id, 'reprovado')}
                    className="flex-1 flex items-center justify-center space-x-1 px-2 py-1.5 rounded-campo bg-white/5 border border-white/15 hover:border-red-400/40 text-nevoa hover:text-red-300 text-[11px] font-bold transition-colors"
                  >
                    <XCircle className="w-3.5 h-3.5" /><span>Reprovar</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'documentos' && (
        <div className="space-y-3 max-w-3xl">
          {!carregando && pendingDocuments.length === 0 && <p className="text-sm text-nevoa">Nenhum documento pendente no momento.</p>}
          {pendingDocuments.map((d: PendingDocument) => (
            <div key={d.user_id} className="flex flex-col sm:flex-row sm:items-center gap-4 bg-grafite border border-white/10 p-4">
              <div className="flex-1 min-w-0 space-y-1">
                <div className="text-sm font-semibold text-marfim">{d.profile_name ?? d.user_name}</div>
                <div className="text-[11px] text-nevoa">Enviado em {fmtData(d.updated_at)}</div>
              </div>
              <VerDocumentoButton userId={d.user_id} />
              <div className="flex sm:flex-col gap-2 shrink-0">
                <button
                  onClick={() => decideDocument(d.user_id, 'aprovado')}
                  className="flex-1 sm:flex-none flex items-center justify-center space-x-1.5 px-4 py-2 rounded-campo bg-verificado hover:opacity-90 text-marfim text-xs font-bold transition-opacity"
                >
                  <CheckCircle2 className="w-4 h-4" /><span>Aprovar</span>
                </button>
                <button
                  onClick={() => decideDocument(d.user_id, 'reprovado')}
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
          {!carregando && reports.length === 0 && <p className="text-sm text-nevoa">Nenhuma denúncia em aberto.</p>}
          {reports.map((r) => (
            <div key={r.id} className="bg-grafite border border-white/10 p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-ouro shrink-0" />
                    <span className="text-sm font-semibold text-marfim">{r.reason}</span>
                    {r.reporter_user_id === null && <span className="text-[10px] px-2 py-0.5 rounded-campo bg-white/5 border border-white/10 text-nevoa">Anônima</span>}
                  </div>
                  <p className="text-xs text-nevoa mt-1">Sobre: <strong className="text-marfim">{r.target_name}</strong> · {fmtData(r.created_at)}</p>
                </div>
              </div>
              <p className="text-xs text-nevoa bg-white/5 border border-white/10 p-3">{r.details}</p>
              <div className="flex gap-2">
                <button
                  onClick={() => decideReport(r.id, 'aprovado')}
                  className="flex items-center space-x-1.5 px-4 py-2 rounded-campo bg-red-500/15 border border-red-500/30 hover:bg-red-500/25 text-red-300 text-xs font-bold transition-colors"
                >
                  <CheckCircle2 className="w-4 h-4" /><span>Procede — suspender anúncio</span>
                </button>
                <button
                  onClick={() => decideReport(r.id, 'reprovado')}
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
                <div className="text-nevoa shrink-0 font-mono">{fmtData(a.created_at)}</div>
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
