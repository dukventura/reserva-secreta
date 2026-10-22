import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard, ClipboardCheck, Flag, History, CheckCircle2, XCircle,
  MapPin, ShieldAlert, AlertCircle, Images, FileText, Eye, Radio, PauseCircle, PlayCircle, Users, Wallet,
} from 'lucide-react';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { RequireRole } from '../../components/RequireRole';
import { useModeration } from '../../context/ModerationContext';
import {
  buscarArquivoDocumento, buscarArquivoSelfie, listarAssinaturas, listarClientes, ApiError,
  type PendingMedia, type PendingDocument, type PendingSelfie, type PendingModerationProfile, type SubscriptionRow, type ClienteRow,
} from '../../lib/api';
import { FinancePanel } from './FinancePanel';

const NAV = [
  { key: 'painel', label: 'Painel', icon: <LayoutDashboard className="w-4 h-4" /> },
  { key: 'aprovacoes', label: 'Aprovações', icon: <ClipboardCheck className="w-4 h-4" /> },
  { key: 'ativos', label: 'Anúncios no ar', icon: <Radio className="w-4 h-4" /> },
  { key: 'cadastros', label: 'Cadastros', icon: <Users className="w-4 h-4" /> },
  { key: 'financeiro', label: 'Financeiro', icon: <Wallet className="w-4 h-4" /> },
  { key: 'denuncias', label: 'Denúncias', icon: <Flag className="w-4 h-4" /> },
  { key: 'historico', label: 'Histórico', icon: <History className="w-4 h-4" /> },
];

const ROTULO_PERFIL_STATUS: Record<SubscriptionRow['perfil_status'], { label: string; cls: string }> = {
  rascunho: { label: 'Cadastro incompleto', cls: 'bg-white/5 border-white/15 text-nevoa' },
  pendente: { label: 'Aguardando aprovação', cls: 'bg-amber-500/15 border-amber-500/30 text-amber-300' },
  aprovado: { label: 'Aprovado', cls: 'bg-verificado/15 border-verificado/30 text-verificado-texto' },
  reprovado: { label: 'Reprovado', cls: 'bg-red-500/15 border-red-500/30 text-red-300' },
  suspenso: { label: 'Suspenso', cls: 'bg-red-500/15 border-red-500/30 text-red-300' },
};

interface GrupoVerificacao {
  userId: number;
  nome: string;
  fotos: PendingMedia[];
  documento: PendingDocument | null;
  selfie: PendingSelfie | null;
}

function agruparPorProfissional(fotos: PendingMedia[], documentos: PendingDocument[], selfies: PendingSelfie[]): GrupoVerificacao[] {
  const grupos = new Map<number, GrupoVerificacao>();

  const obter = (userId: number, nome: string) => {
    let g = grupos.get(userId);
    if (!g) {
      g = { userId, nome, fotos: [], documento: null, selfie: null };
      grupos.set(userId, g);
    }
    return g;
  };

  fotos.forEach((f) => obter(f.user_id, f.profile_name).fotos.push(f));
  documentos.forEach((d) => { obter(d.user_id, d.profile_name ?? d.user_name).documento = d; });
  selfies.forEach((s) => { obter(s.user_id, s.profile_name ?? s.user_name).selfie = s; });

  return Array.from(grupos.values()).sort((a, b) => a.nome.localeCompare(b.nome));
}

function fmtData(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

function VerArquivoButton({ userId, buscar, rotulo }: { userId: number; buscar: (userId: number) => Promise<string>; rotulo: string }) {
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');

  const abrir = async () => {
    setCarregando(true);
    setErro('');
    try {
      const url = await buscar(userId);
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (err) {
      setErro(err instanceof ApiError ? err.message : `Não foi possível abrir ${rotulo.toLowerCase()}.`);
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
        <Eye className="w-3.5 h-3.5" /><span>{carregando ? 'Abrindo...' : rotulo}</span>
      </button>
      {erro && <span className="text-[10px] text-red-400">{erro}</span>}
    </div>
  );
}

interface AcoesVerificacao {
  decideMedia: (id: number, status: 'aprovado' | 'reprovado') => Promise<void>;
  decideDocument: (userId: number, status: 'aprovado' | 'reprovado') => Promise<void>;
  decideSelfie: (userId: number, status: 'aprovado' | 'reprovado') => Promise<void>;
}

const btnAprovarMini = 'flex items-center justify-center space-x-1 px-3 py-1.5 rounded-campo bg-verificado hover:opacity-90 text-marfim text-xs font-bold transition-opacity';
const btnReprovarMini = 'flex items-center justify-center space-x-1 px-3 py-1.5 rounded-campo bg-white/5 border border-white/15 hover:border-red-400/40 text-nevoa hover:text-red-300 text-xs font-bold transition-colors';

function ItensPendentes({ fotos, documento, selfie, acoes }: {
  fotos: PendingMedia[];
  documento: PendingDocument | null;
  selfie: PendingSelfie | null;
  acoes: AcoesVerificacao;
}) {
  return (
    <div className="space-y-3">
      {fotos.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {fotos.map((m) => (
            <div key={m.id} className="bg-black/30 border border-white/10 p-2 space-y-1.5">
              <img src={m.url} alt="" className="w-full aspect-[3/4] object-cover rounded-campo" />
              <div className="flex gap-1">
                <button onClick={() => acoes.decideMedia(m.id, 'aprovado')} title="Aprovar foto" className="flex-1 flex items-center justify-center py-1 rounded-campo bg-verificado text-marfim"><CheckCircle2 className="w-3.5 h-3.5" /></button>
                <button onClick={() => acoes.decideMedia(m.id, 'reprovado')} title="Reprovar foto" className="flex-1 flex items-center justify-center py-1 rounded-campo bg-white/5 border border-white/15 text-nevoa hover:text-red-300"><XCircle className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
      {documento && (
        <div className="flex flex-wrap items-center gap-2">
          <VerArquivoButton userId={documento.user_id} buscar={buscarArquivoDocumento} rotulo="Ver documento" />
          <button onClick={() => acoes.decideDocument(documento.user_id, 'aprovado')} className={btnAprovarMini}><CheckCircle2 className="w-3.5 h-3.5" /><span>Aprovar documento</span></button>
          <button onClick={() => acoes.decideDocument(documento.user_id, 'reprovado')} className={btnReprovarMini}><XCircle className="w-3.5 h-3.5" /><span>Reprovar</span></button>
        </div>
      )}
      {selfie && (
        <div className="flex flex-wrap items-center gap-2">
          <VerArquivoButton userId={selfie.user_id} buscar={buscarArquivoSelfie} rotulo="Ver selfie" />
          <button onClick={() => acoes.decideSelfie(selfie.user_id, 'aprovado')} className={btnAprovarMini}><CheckCircle2 className="w-3.5 h-3.5" /><span>Aprovar selfie</span></button>
          <button onClick={() => acoes.decideSelfie(selfie.user_id, 'reprovado')} className={btnReprovarMini}><XCircle className="w-3.5 h-3.5" /><span>Reprovar</span></button>
        </div>
      )}
    </div>
  );
}

type EstadoEtapa = 'ok' | 'conferir' | 'aguardando';

function Etapa({ numero, titulo, estado, descricao, children }: {
  numero: number;
  titulo: string;
  estado: EstadoEtapa;
  descricao: string;
  children?: React.ReactNode;
}) {
  const estilo = {
    ok: { borda: 'border-verificado/30', badge: 'bg-verificado/15 border-verificado/30 text-verificado-texto', rotulo: 'Concluído' },
    conferir: { borda: 'border-ouro/40', badge: 'bg-ouro/15 border-ouro/40 text-ouro', rotulo: 'Você precisa conferir' },
    aguardando: { borda: 'border-white/10', badge: 'bg-white/5 border-white/15 text-nevoa', rotulo: 'Aguardando a profissional' },
  }[estado];
  return (
    <div className={`border ${estilo.borda} bg-black/20 p-3 space-y-2`}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold ${estado === 'ok' ? 'bg-verificado text-marfim' : 'bg-white/10 text-marfim'}`}>
            {estado === 'ok' ? <CheckCircle2 className="w-3.5 h-3.5" /> : numero}
          </span>
          <span className="text-sm font-semibold text-marfim">{titulo}</span>
        </div>
        <span className={`text-[10px] px-2 py-0.5 rounded-campo border font-bold uppercase ${estilo.badge}`}>{estilo.rotulo}</span>
      </div>
      <p className="text-xs text-nevoa">{descricao}</p>
      {children}
    </div>
  );
}

function CardAprovacao({ perfil: p, fotos, documento, selfie, acoes, onPublicar, onReprovar }: {
  perfil: PendingModerationProfile;
  fotos: PendingMedia[];
  documento: PendingDocument | null;
  selfie: PendingSelfie | null;
  acoes: AcoesVerificacao;
  onPublicar: () => void;
  onReprovar: () => void;
}) {
  const estadoFotos: EstadoEtapa = p.approved_photos > 0 ? 'ok' : fotos.length > 0 ? 'conferir' : 'aguardando';
  const descFotos = p.approved_photos > 0
    ? `${p.approved_photos} foto(s) aprovada(s).${fotos.length > 0 ? ` Ainda há ${fotos.length} nova(s) pra conferir.` : ''}`
    : fotos.length > 0
      ? `${fotos.length} foto(s) enviada(s) — aprove pelo menos 1.`
      : 'Ela ainda não enviou nenhuma foto (ou todas foram reprovadas).';

  const estadoDoc = (status: PendingModerationProfile['documento_status'], item: unknown): EstadoEtapa =>
    status === 'aprovado' ? 'ok' : item ? 'conferir' : 'aguardando';
  const descDoc = (status: PendingModerationProfile['documento_status'], enviado: boolean, nome: string) =>
    status === 'aprovado' ? `${nome} aprovado.`
      : status === 'reprovado' ? `${nome} reprovado — aguardando ela enviar outro.`
      : enviado ? `${nome} enviado — confira e aprove.`
      : `Ela ainda não enviou ${nome.toLowerCase()}.`;

  const estDocumento = estadoDoc(p.documento_status, documento);
  const estSelfie = estadoDoc(p.selfie_status, selfie);

  const faltando = [
    estadoFotos !== 'ok' && 'pelo menos 1 foto aprovada',
    estDocumento !== 'ok' && 'documento aprovado',
    estSelfie !== 'ok' && 'selfie aprovada',
  ].filter(Boolean) as string[];
  const pronto = faltando.length === 0;

  return (
    <div className={`bg-grafite border ${pronto ? 'border-verificado/50' : 'border-white/10'} p-4 space-y-4`}>
      <div className="flex items-start gap-4">
        {p.thumbnail_url ? (
          <img src={p.thumbnail_url} alt="" className="w-16 h-20 object-cover shrink-0" />
        ) : (
          <div className="w-16 h-20 shrink-0 bg-white/5 border border-white/10 flex items-center justify-center text-[10px] text-nevoa text-center px-1">Sem foto</div>
        )}
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-base font-semibold text-marfim">{p.stage_name}, {p.age}</span>
            <span className="text-[10px] px-2 py-0.5 rounded-campo bg-white/5 border border-white/10 text-nevoa uppercase">{p.category}</span>
          </div>
          <div className="flex items-center space-x-1.5 text-xs text-nevoa"><MapPin className="w-3 h-3 text-ouro" /><span>{p.city}</span></div>
          <div className="text-[11px] text-nevoa">WhatsApp: {p.whatsapp} · Enviado em {fmtData(p.submitted_at)}</div>
        </div>
      </div>

      <div className="space-y-2">
        <Etapa numero={1} titulo="Fotos" estado={estadoFotos} descricao={descFotos}>
          {fotos.length > 0 && <ItensPendentes fotos={fotos} documento={null} selfie={null} acoes={acoes} />}
        </Etapa>
        <Etapa numero={2} titulo="Documento (RG/CNH)" estado={estDocumento} descricao={descDoc(p.documento_status, p.documento_enviado, 'Documento')}>
          {documento && <ItensPendentes fotos={[]} documento={documento} selfie={null} acoes={acoes} />}
        </Etapa>
        <Etapa numero={3} titulo="Selfie de verificação" estado={estSelfie} descricao={descDoc(p.selfie_status, p.selfie_enviada, 'Selfie')}>
          {selfie && <ItensPendentes fotos={[]} documento={null} selfie={selfie} acoes={acoes} />}
        </Etapa>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-3 border-t border-white/10 pt-3">
        <div className="flex-1 text-xs">
          {pronto
            ? <span className="text-verificado-texto font-semibold">Tudo conferido — pode publicar o anúncio.</span>
            : <span className="text-amber-300">Falta: {faltando.join(', ')}.</span>}
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={onPublicar}
            disabled={!pronto}
            className="flex items-center justify-center space-x-1.5 px-4 py-2 rounded-campo bg-verificado hover:opacity-90 text-marfim text-xs font-bold transition-opacity disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <CheckCircle2 className="w-4 h-4" /><span>Publicar anúncio</span>
          </button>
          <button onClick={onReprovar} className={btnReprovarMini}>
            <XCircle className="w-4 h-4" /><span>Reprovar anúncio</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function ManagerDashboardContent() {
  const [tab, setTab] = useState('painel');
  const { pendingProfiles, activeProfiles, reports, pendingMedia, pendingDocuments, pendingSelfies, auditLog, carregando, erro, refresh, decideProfile, setProfileStatus, decideReport, decideMedia, decideDocument, decideSelfie } = useModeration();

  const [assinaturas, setAssinaturas] = useState<SubscriptionRow[]>([]);
  const [clientes, setClientes] = useState<ClienteRow[]>([]);
  const [carregandoCadastros, setCarregandoCadastros] = useState(true);
  const [erroCadastros, setErroCadastros] = useState('');
  const [subAbaCadastros, setSubAbaCadastros] = useState<'profissionais' | 'clientes'>('profissionais');

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    Promise.all([listarAssinaturas(), listarClientes()])
      .then(([a, c]) => { setAssinaturas(a.assinaturas); setClientes(c.clientes); })
      .catch((err) => setErroCadastros(err instanceof ApiError ? err.message : 'Não foi possível carregar os cadastros.'))
      .finally(() => setCarregandoCadastros(false));
  }, []);

  return (
    <DashboardLayout title="Painel do Gerente" navItems={NAV} activeKey={tab} onSelect={setTab} manualHref="/manual/administrativo">

      {erro && (
        <div className="flex items-start space-x-2 bg-red-500/10 border border-red-500/30 p-3 text-xs text-red-300 mb-4">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{erro}</span>
        </div>
      )}

      {tab === 'painel' && (
        <div className="grid grid-cols-2 sm:grid-cols-7 gap-4">
          {[
            { label: 'Anúncios pendentes', value: pendingProfiles.length, icon: <ClipboardCheck className="w-4 h-4 text-ouro" />, irPara: 'aprovacoes' },
            { label: 'Fotos pendentes', value: pendingMedia.length, icon: <Images className="w-4 h-4 text-ouro" />, irPara: 'aprovacoes' },
            { label: 'Documentos pendentes', value: pendingDocuments.length, icon: <FileText className="w-4 h-4 text-ouro" />, irPara: 'aprovacoes' },
            { label: 'Selfies pendentes', value: pendingSelfies.length, icon: <Eye className="w-4 h-4 text-ouro" />, irPara: 'aprovacoes' },
            { label: 'Cadastros', value: carregandoCadastros ? '...' : assinaturas.length + clientes.length, icon: <Users className="w-4 h-4 text-ouro" />, irPara: 'cadastros' },
            { label: 'Denúncias abertas', value: reports.length, icon: <Flag className="w-4 h-4 text-ouro" />, irPara: 'denuncias' },
            { label: 'Ações registradas', value: auditLog.length, icon: <History className="w-4 h-4 text-ouro" />, irPara: 'historico' },
          ].map((s) => (
            <button
              key={s.label}
              onClick={() => setTab(s.irPara)}
              className="text-left bg-grafite border border-white/10 hover:border-ouro/40 p-4 space-y-2 transition-colors cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-nevoa uppercase tracking-wider">{s.label}</span>
                {s.icon}
              </div>
              <div className="text-xl font-display text-marfim">{carregando ? '...' : s.value}</div>
            </button>
          ))}
        </div>
      )}

      {tab === 'aprovacoes' && (() => {
        const idsPendentes = new Set(pendingProfiles.map((p) => p.user_id));
        const avulsos = agruparPorProfissional(pendingMedia, pendingDocuments, pendingSelfies).filter((g) => !idsPendentes.has(g.userId));
        const acoes = { decideMedia, decideDocument, decideSelfie };
        return (
          <div className="space-y-4 max-w-3xl">
            <p className="text-xs text-nevoa">Cada anúncio mostra tudo o que precisa ser conferido. Aprove os itens de cada etapa — o botão de publicar libera sozinho quando as 3 etapas estiverem completas.</p>
            {!carregando && pendingProfiles.length === 0 && avulsos.length === 0 && (
              <p className="text-sm text-nevoa">Nada pendente no momento.</p>
            )}
            {pendingProfiles.map((p) => (
              <CardAprovacao
                key={p.id}
                perfil={p}
                fotos={pendingMedia.filter((m) => m.user_id === p.user_id)}
                documento={pendingDocuments.find((d) => d.user_id === p.user_id) ?? null}
                selfie={pendingSelfies.find((s) => s.user_id === p.user_id) ?? null}
                acoes={acoes}
                onPublicar={() => decideProfile(p.id, 'aprovado')}
                onReprovar={() => decideProfile(p.id, 'reprovado')}
              />
            ))}
            {avulsos.length > 0 && (
              <div className="space-y-3 pt-2">
                <h3 className="text-xs font-bold text-nevoa uppercase tracking-wider">Outros itens enviados (anúncio já no ar ou cadastro ainda não finalizado)</h3>
                {avulsos.map((g) => (
                  <div key={g.userId} className="bg-grafite border border-white/10 p-4 space-y-3">
                    <div className="text-sm font-semibold text-marfim">{g.nome}</div>
                    <ItensPendentes fotos={g.fotos} documento={g.documento} selfie={g.selfie} acoes={acoes} />
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })()}

      {tab === 'ativos' && (
        <div className="space-y-3 max-w-3xl">
          {!carregando && activeProfiles.length === 0 && <p className="text-sm text-nevoa">Nenhum anúncio publicado no momento.</p>}
          {activeProfiles.map((p) => {
            const suspenso = p.status === 'suspenso';
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
                    <span className={`text-[10px] px-2 py-0.5 rounded-campo uppercase font-bold ${suspenso ? 'bg-red-500/15 border border-red-500/30 text-red-300' : 'bg-verificado/15 border border-verificado/30 text-verificado-texto'}`}>
                      {suspenso ? 'Fora do ar' : 'No ar'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1.5 text-xs text-nevoa"><MapPin className="w-3 h-3 text-ouro" /><span>{p.city}</span></div>
                  <div className="text-[11px] text-nevoa">WhatsApp: {p.whatsapp}</div>
                </div>
                <div className="flex sm:flex-col gap-2 shrink-0">
                  {suspenso ? (
                    <button
                      onClick={() => setProfileStatus(p.id, 'aprovado')}
                      className="flex-1 sm:flex-none flex items-center justify-center space-x-1.5 px-4 py-2 rounded-campo bg-verificado hover:opacity-90 text-marfim text-xs font-bold transition-opacity"
                    >
                      <PlayCircle className="w-4 h-4" /><span>Reativar</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => setProfileStatus(p.id, 'suspenso')}
                      className="flex-1 sm:flex-none flex items-center justify-center space-x-1.5 px-4 py-2 rounded-campo bg-white/5 border border-red-400/30 hover:bg-red-500/15 text-red-300 text-xs font-bold transition-colors"
                    >
                      <PauseCircle className="w-4 h-4" /><span>Tirar do ar</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {tab === 'cadastros' && (
        <div className="space-y-4 max-w-3xl">
          {erroCadastros && (
            <div className="flex items-start space-x-2 bg-red-500/10 border border-red-500/30 p-3 text-xs text-red-300">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{erroCadastros}</span>
            </div>
          )}
          <div className="flex gap-1 border-b border-white/10">
            {([['profissionais', `Profissionais (${assinaturas.length})`], ['clientes', `Clientes (${clientes.length})`]] as const).map(([k, l]) => (
              <button
                key={k}
                onClick={() => setSubAbaCadastros(k)}
                className={`px-4 py-2 text-sm font-semibold border-b-2 -mb-px transition-colors ${subAbaCadastros === k ? 'border-ouro text-ouro' : 'border-transparent text-nevoa hover:text-marfim'}`}
              >
                {l}
              </button>
            ))}
          </div>

          {subAbaCadastros === 'profissionais' && (
            <div className="border border-white/10 divide-y divide-white/10">
              {!carregandoCadastros && assinaturas.length === 0 && <p className="text-sm text-nevoa p-4">Nenhum cadastro de profissional.</p>}
              {assinaturas.map((a) => (
                <div key={a.user_id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3.5">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-marfim">{a.stage_name}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-campo font-bold uppercase border ${ROTULO_PERFIL_STATUS[a.perfil_status].cls}`}>
                        {ROTULO_PERFIL_STATUS[a.perfil_status].label}
                      </span>
                    </div>
                    <div className="text-xs text-nevoa">{a.email}</div>
                  </div>
                  {a.plano_nome && <span className="text-[11px] text-nevoa">Plano: <span className="text-ouro font-semibold">{a.plano_nome}</span></span>}
                </div>
              ))}
            </div>
          )}

          {subAbaCadastros === 'clientes' && (
            <div className="border border-white/10 divide-y divide-white/10">
              {!carregandoCadastros && clientes.length === 0 && <p className="text-sm text-nevoa p-4">Nenhum cliente cadastrado.</p>}
              {clientes.map((c) => (
                <div key={c.id} className="flex items-center justify-between gap-3 p-3.5">
                  <div>
                    <div className="text-sm font-semibold text-marfim">{c.name}</div>
                    <div className="text-xs text-nevoa">{c.email}</div>
                  </div>
                  <div className="text-[11px] text-nevoa shrink-0 font-mono">Cadastrado em {fmtData(c.created_at)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'financeiro' && <FinancePanel />}

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
