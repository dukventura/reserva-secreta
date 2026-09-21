import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard, UserRound, Images, ShieldCheck, BarChart3, CreditCard,
  Heart, CheckCircle2, Circle, Clock, Upload, Check, AlertCircle, Send, XCircle,
} from 'lucide-react';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { RequireRole } from '../../components/RequireRole';
import { mockPlans } from '../../data/mockModeration';
import { buscarMeuPerfil, atualizarMeuPerfil, enviarPerfilParaAprovacao, ApiError, type MyProfile } from '../../lib/api';

const NAV = [
  { key: 'painel', label: 'Painel', icon: <LayoutDashboard className="w-4 h-4" /> },
  { key: 'perfil', label: 'Meu Perfil', icon: <UserRound className="w-4 h-4" /> },
  { key: 'galeria', label: 'Galeria', icon: <Images className="w-4 h-4" /> },
  { key: 'verificacao', label: 'Verificação', icon: <ShieldCheck className="w-4 h-4" /> },
  { key: 'estatisticas', label: 'Estatísticas', icon: <BarChart3 className="w-4 h-4" /> },
  { key: 'plano', label: 'Plano', icon: <CreditCard className="w-4 h-4" /> },
];

const ROTULO_STATUS: Record<MyProfile['status'], string> = {
  rascunho: 'Rascunho — ainda não enviado',
  pendente: 'Em análise pelo gerente',
  aprovado: 'Publicado no catálogo',
  reprovado: 'Reprovado — ajuste e reenvie',
  suspenso: 'Suspenso por denúncia',
};

function ProfessionalDashboardContent() {
  const [tab, setTab] = useState('painel');
  const [perfil, setPerfil] = useState<MyProfile | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [form, setForm] = useState({ tagline: '', bio: '', hourly_rate: '' });
  const [salvando, setSalvando] = useState(false);
  const [salvo, setSalvo] = useState(false);
  const [enviando, setEnviando] = useState(false);

  const carregar = () => {
    setCarregando(true);
    setErro('');
    buscarMeuPerfil()
      .then(({ perfil }) => {
        setPerfil(perfil);
        setForm({ tagline: perfil.tagline ?? '', bio: perfil.bio ?? '', hourly_rate: perfil.hourly_rate ?? '' });
      })
      .catch((err) => setErro(err instanceof ApiError ? err.message : 'Não foi possível carregar seu perfil.'))
      .finally(() => setCarregando(false));
  };

  useEffect(carregar, []);

  const salvar = async (e: React.FormEvent) => {
    e.preventDefault();
    setSalvando(true);
    setErro('');
    try {
      await atualizarMeuPerfil(form);
      setSalvo(true);
      setTimeout(() => setSalvo(false), 2500);
      carregar();
    } catch (err) {
      setErro(err instanceof ApiError ? err.message : 'Não foi possível salvar as alterações.');
    } finally {
      setSalvando(false);
    }
  };

  const enviarParaAprovacao = async () => {
    setEnviando(true);
    setErro('');
    try {
      await enviarPerfilParaAprovacao();
      carregar();
    } catch (err) {
      setErro(err instanceof ApiError ? err.message : 'Não foi possível enviar para análise.');
    } finally {
      setEnviando(false);
    }
  };

  if (carregando) {
    return (
      <DashboardLayout title="Painel da Profissional" navItems={NAV} activeKey={tab} onSelect={setTab}>
        <p className="text-sm text-nevoa">Carregando seu perfil...</p>
      </DashboardLayout>
    );
  }

  if (!perfil) {
    return (
      <DashboardLayout title="Painel da Profissional" navItems={NAV} activeKey={tab} onSelect={setTab}>
        <div className="flex items-start space-x-2 bg-red-500/10 border border-red-500/30 p-3.5 text-sm text-red-300">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{erro || 'Perfil não encontrado.'}</span>
        </div>
      </DashboardLayout>
    );
  }

  const podeEnviar = perfil.status === 'rascunho' || perfil.status === 'reprovado';
  const verificacoes = [perfil.email_confirmado === 1, perfil.telefone_confirmado === 1, perfil.documento_status === 'aprovado'];
  const percentualVerificado = Math.round((verificacoes.filter(Boolean).length / verificacoes.length) * 100);

  return (
    <DashboardLayout title="Painel da Profissional" navItems={NAV} activeKey={tab} onSelect={setTab}>

      {erro && (
        <div className="flex items-start space-x-2 bg-red-500/10 border border-red-500/30 p-3 text-xs text-red-300 mb-4">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{erro}</span>
        </div>
      )}

      {tab === 'painel' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Status do anúncio', value: ROTULO_STATUS[perfil.status], icon: <CheckCircle2 className="w-4 h-4 text-verificado-texto" /> },
              { label: 'Categoria', value: perfil.category, icon: <CreditCard className="w-4 h-4 text-ouro" /> },
              { label: 'Cidade', value: perfil.city, icon: <UserRound className="w-4 h-4 text-ouro" /> },
              { label: 'Verificação', value: `${percentualVerificado}%`, icon: <ShieldCheck className="w-4 h-4 text-ouro" /> },
            ].map((s) => (
              <div key={s.label} className="bg-grafite border border-white/10 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-nevoa uppercase tracking-wider">{s.label}</span>
                  {s.icon}
                </div>
                <div className="text-base font-display text-marfim">{s.value}</div>
              </div>
            ))}
          </div>

          {podeEnviar && (
            <div className="bg-ouro/10 border border-ouro/30 p-5 space-y-3">
              <h3 className="text-sm font-semibold text-marfim">
                {perfil.status === 'reprovado' ? 'Seu anúncio foi reprovado' : 'Seu anúncio ainda não foi enviado'}
              </h3>
              <p className="text-xs text-nevoa">
                {perfil.status === 'reprovado'
                  ? 'Ajuste as informações na aba "Meu Perfil" e envie novamente para uma nova análise.'
                  : 'Preencha seu perfil na aba "Meu Perfil" e envie para a fila de aprovação do gerente.'}
              </p>
              <button
                onClick={enviarParaAprovacao}
                disabled={enviando}
                className="flex items-center space-x-2 px-4 py-2.5 rounded-campo bg-ouro hover:bg-champanhe text-black font-bold text-sm transition-colors disabled:opacity-60"
              >
                <Send className="w-4 h-4" />
                <span>{enviando ? 'Enviando...' : 'Enviar para análise'}</span>
              </button>
            </div>
          )}

          {perfil.status === 'suspenso' && (
            <div className="bg-red-500/10 border border-red-500/30 p-5 space-y-2 flex items-start space-x-3">
              <XCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-semibold text-marfim">Anúncio suspenso</h3>
                <p className="text-xs text-nevoa">Uma denúncia contra seu anúncio foi julgada procedente pela nossa equipe. Entre em contato pelo suporte para entender o motivo.</p>
              </div>
            </div>
          )}

          <div className="bg-grafite border border-white/10 p-5 space-y-3">
            <h3 className="text-sm font-semibold text-marfim">Verificação da conta</h3>
            <div className="h-1.5 bg-white/10 overflow-hidden">
              <div className="h-full bg-ouro" style={{ width: `${percentualVerificado}%` }} />
            </div>
            <div className="flex flex-wrap gap-3 text-xs text-nevoa">
              <span className="flex items-center space-x-1.5">
                {perfil.email_confirmado ? <CheckCircle2 className="w-4 h-4 text-verificado-texto" /> : <Circle className="w-4 h-4 text-nevoa" />}
                <span>E-mail validado</span>
              </span>
              <span className="flex items-center space-x-1.5">
                {perfil.telefone_confirmado ? <CheckCircle2 className="w-4 h-4 text-verificado-texto" /> : <Circle className="w-4 h-4 text-nevoa" />}
                <span>Telefone verificado</span>
              </span>
              <span className="flex items-center space-x-1.5">
                {perfil.documento_status === 'aprovado' ? <CheckCircle2 className="w-4 h-4 text-verificado-texto" /> : <Clock className="w-4 h-4 text-ouro" />}
                <span>Documento {perfil.documento_status === 'aprovado' ? 'aprovado' : perfil.documento_status === 'reprovado' ? 'reprovado' : 'em análise'}</span>
              </span>
            </div>
          </div>
        </div>
      )}

      {tab === 'perfil' && (
        <form onSubmit={salvar} className="max-w-xl space-y-4">
          <div>
            <label className="block text-xs font-semibold text-nevoa mb-1.5">Frase de destaque</label>
            <input
              value={form.tagline}
              onChange={(e) => setForm({ ...form, tagline: e.target.value })}
              maxLength={255}
              className="w-full bg-grafite text-marfim text-sm rounded-campo px-4 py-2.5 border border-white/15 focus:border-ouro outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-nevoa mb-1.5">Sobre mim</label>
            <textarea
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              rows={4}
              maxLength={4000}
              className="w-full bg-grafite text-marfim text-sm rounded-campo px-4 py-2.5 border border-white/15 focus:border-ouro outline-none resize-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-nevoa mb-1.5">Valor / hora</label>
            <input
              value={form.hourly_rate}
              onChange={(e) => setForm({ ...form, hourly_rate: e.target.value })}
              placeholder="Ex: R$ 300 /h"
              maxLength={40}
              className="w-full sm:w-48 bg-grafite text-marfim text-sm rounded-campo px-4 py-2.5 border border-white/15 focus:border-ouro outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={salvando}
            className="px-5 py-2.5 rounded-campo bg-ouro hover:bg-champanhe text-black font-bold text-sm transition-colors disabled:opacity-60"
          >
            {salvando ? 'Salvando...' : 'Salvar alterações'}
          </button>
          {salvo && <span className="ml-3 text-xs text-verificado-texto inline-flex items-center space-x-1"><Check className="w-3.5 h-3.5" /><span>Salvo</span></span>}
          <p className="text-xs text-nevoa pt-2">
            Altura, peso, olhos, cabelo, idiomas, serviços e locais aceitos ainda só podem ser editados pela nossa equipe — a edição desses campos por aqui ainda não existe.
          </p>
        </form>
      )}

      {tab === 'galeria' && (
        <div className="max-w-2xl space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {perfil.gallery.map((foto) => (
              <div key={foto.id} className="relative aspect-[3/4] bg-grafite border border-white/10 overflow-hidden">
                <img src={foto.url} alt="" className="w-full h-full object-cover" />
                {foto.status !== 'aprovado' && (
                  <div className="absolute bottom-0 left-0 right-0 px-2 py-1 text-[10px] text-center font-semibold bg-black/80 text-ouro uppercase">
                    {foto.status === 'pendente' ? 'Em análise' : 'Reprovada'}
                  </div>
                )}
              </div>
            ))}
            <div
              title="Upload de fotos ainda não está disponível"
              className="aspect-[3/4] border-2 border-dashed border-white/10 flex flex-col items-center justify-center space-y-2 text-nevoa/50 cursor-not-allowed"
            >
              <Upload className="w-6 h-6" />
              <span className="text-xs font-medium text-center px-2">Upload ainda não disponível</span>
            </div>
          </div>
          {perfil.gallery.length === 0 && (
            <p className="text-xs text-nevoa">Nenhuma foto enviada ainda. Fale com nossa equipe para adicionar fotos ao seu anúncio enquanto o upload direto não está pronto.</p>
          )}
        </div>
      )}

      {tab === 'verificacao' && (
        <div className="max-w-xl space-y-4">
          <div className="h-1.5 bg-white/10 overflow-hidden">
            <div className="h-full bg-ouro" style={{ width: `${percentualVerificado}%` }} />
          </div>
          {[
            { label: 'E-mail validado', done: perfil.email_confirmado === 1 },
            { label: 'Telefone verificado', done: perfil.telefone_confirmado === 1 },
            { label: 'Documento com foto (RG ou CNH)', done: perfil.documento_status === 'aprovado' },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between bg-grafite border border-white/10 p-4">
              <div className="flex items-center space-x-2.5">
                {item.done ? <CheckCircle2 className="w-5 h-5 text-verificado-texto" /> : <Circle className="w-5 h-5 text-nevoa" />}
                <span className="text-sm text-marfim">{item.label}</span>
              </div>
              {!item.done && (
                <button
                  disabled
                  title="Envio de documento ainda não está disponível"
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-campo bg-white/5 border border-white/10 text-nevoa/50 text-xs font-semibold cursor-not-allowed"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Em breve</span>
                </button>
              )}
            </div>
          ))}
          <p className="text-xs text-nevoa">O documento é revisado por um humano da nossa equipe e usado só para confirmar identidade e maioridade — nunca fica visível no seu anúncio.</p>
        </div>
      )}

      {tab === 'estatisticas' && (
        <div className="max-w-xl space-y-3">
          <p className="text-xs text-nevoa flex items-center space-x-1.5 pt-1"><Heart className="w-3.5 h-3.5 text-ouro" /><span>Estatísticas de visualizações e cliques ainda não são coletadas nesta fase.</span></p>
        </div>
      )}

      {tab === 'plano' && (
        <div className="space-y-4 max-w-3xl">
          <p className="text-xs text-nevoa">Assinatura de planos ainda não é automatizada — pagamentos são combinados diretamente com nossa equipe.</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {mockPlans.map((plano) => (
              <div key={plano.id} className="p-5 space-y-3 border border-white/10 bg-grafite">
                <div className="text-sm font-semibold text-marfim">{plano.name}</div>
                <div className="text-2xl font-display text-ouro">{plano.price}<span className="text-xs text-nevoa ml-1">{plano.period}</span></div>
                <ul className="space-y-1.5 text-xs text-nevoa">
                  {plano.features.map((f) => (
                    <li key={f} className="flex items-start space-x-1.5"><Check className="w-3.5 h-3.5 text-verificado-texto shrink-0 mt-0.5" /><span>{f}</span></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

export const ProfessionalDashboard: React.FC = () => (
  <RequireRole allow={['profissional']}>
    <ProfessionalDashboardContent />
  </RequireRole>
);
