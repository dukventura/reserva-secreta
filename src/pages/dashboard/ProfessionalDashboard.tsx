import React, { useState } from 'react';
import {
  LayoutDashboard, UserRound, Images, ShieldCheck, BarChart3, CreditCard,
  Eye, MessageCircle, Heart, CheckCircle2, Circle, Clock, Upload, Check,
} from 'lucide-react';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { RequireRole } from '../../components/RequireRole';
import { mockProfiles } from '../../data/mockProfiles';
import { mockPlans } from '../../data/mockModeration';

const NAV = [
  { key: 'painel', label: 'Painel', icon: <LayoutDashboard className="w-4 h-4" /> },
  { key: 'perfil', label: 'Meu Perfil', icon: <UserRound className="w-4 h-4" /> },
  { key: 'galeria', label: 'Galeria', icon: <Images className="w-4 h-4" /> },
  { key: 'verificacao', label: 'Verificação', icon: <ShieldCheck className="w-4 h-4" /> },
  { key: 'estatisticas', label: 'Estatísticas', icon: <BarChart3 className="w-4 h-4" /> },
  { key: 'plano', label: 'Plano', icon: <CreditCard className="w-4 h-4" /> },
];

const MEU_PERFIL = mockProfiles[0]; // Valentina Rossi - conta de demonstração

function ProfessionalDashboardContent() {
  const [tab, setTab] = useState('painel');
  const [form, setForm] = useState({
    tagline: MEU_PERFIL.tagline,
    bio: MEU_PERFIL.bio,
    hourlyRate: MEU_PERFIL.hourlyRate,
  });
  const [salvo, setSalvo] = useState(false);
  const [planoAtual, setPlanoAtual] = useState('plano-vip');

  const salvar = (e: React.FormEvent) => {
    e.preventDefault();
    setSalvo(true);
    setTimeout(() => setSalvo(false), 2500);
  };

  return (
    <DashboardLayout title="Painel da Profissional" navItems={NAV} activeKey={tab} onSelect={setTab}>

      {tab === 'painel' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Status do anúncio', value: 'Ativo', icon: <CheckCircle2 className="w-4 h-4 text-verificado-texto" /> },
              { label: 'Plano atual', value: 'VIP', icon: <CreditCard className="w-4 h-4 text-ouro" /> },
              { label: 'Views (30 dias)', value: '1.284', icon: <Eye className="w-4 h-4 text-ouro" /> },
              { label: 'Cliques WhatsApp', value: '96', icon: <MessageCircle className="w-4 h-4 text-ouro" /> },
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

          <div className="bg-grafite border border-white/10 p-5 space-y-3">
            <h3 className="text-sm font-semibold text-marfim">Verificação da conta</h3>
            <div className="h-1.5 bg-white/10 overflow-hidden">
              <div className="h-full bg-ouro" style={{ width: '66%' }} />
            </div>
            <div className="flex flex-wrap gap-3 text-xs text-nevoa">
              <span className="flex items-center space-x-1.5"><CheckCircle2 className="w-4 h-4 text-verificado-texto" /><span>E-mail validado</span></span>
              <span className="flex items-center space-x-1.5"><CheckCircle2 className="w-4 h-4 text-verificado-texto" /><span>Telefone verificado</span></span>
              <span className="flex items-center space-x-1.5"><Clock className="w-4 h-4 text-ouro" /><span>Documento em análise</span></span>
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
              className="w-full bg-grafite text-marfim text-sm rounded-campo px-4 py-2.5 border border-white/15 focus:border-ouro outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-nevoa mb-1.5">Sobre mim</label>
            <textarea
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              rows={4}
              className="w-full bg-grafite text-marfim text-sm rounded-campo px-4 py-2.5 border border-white/15 focus:border-ouro outline-none resize-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-nevoa mb-1.5">Valor / hora</label>
            <input
              value={form.hourlyRate}
              onChange={(e) => setForm({ ...form, hourlyRate: e.target.value })}
              className="w-full sm:w-48 bg-grafite text-marfim text-sm rounded-campo px-4 py-2.5 border border-white/15 focus:border-ouro outline-none"
            />
          </div>
          <button type="submit" className="px-5 py-2.5 rounded-campo bg-ouro hover:bg-champanhe text-black font-bold text-sm transition-colors">
            Salvar alterações
          </button>
          {salvo && <span className="ml-3 text-xs text-verificado-texto inline-flex items-center space-x-1"><Check className="w-3.5 h-3.5" /><span>Salvo (apenas nesta sessão de demonstração)</span></span>}
        </form>
      )}

      {tab === 'galeria' && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl">
          {MEU_PERFIL.gallery.map((img, idx) => (
            <div key={idx} className="aspect-[3/4] bg-grafite border border-white/10 overflow-hidden">
              <img src={img} alt="" className="w-full h-full object-cover" />
            </div>
          ))}
          <button className="aspect-[3/4] border-2 border-dashed border-white/15 hover:border-ouro/40 flex flex-col items-center justify-center space-y-2 text-nevoa hover:text-ouro transition-colors">
            <Upload className="w-6 h-6" />
            <span className="text-xs font-medium">Adicionar foto</span>
          </button>
        </div>
      )}

      {tab === 'verificacao' && (
        <div className="max-w-xl space-y-4">
          <div className="h-1.5 bg-white/10 overflow-hidden">
            <div className="h-full bg-ouro" style={{ width: '66%' }} />
          </div>
          {[
            { label: 'E-mail validado', done: true },
            { label: 'Telefone verificado', done: true },
            { label: 'Documento com foto (RG ou CNH)', done: false },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between bg-grafite border border-white/10 p-4">
              <div className="flex items-center space-x-2.5">
                {item.done ? <CheckCircle2 className="w-5 h-5 text-verificado-texto" /> : <Circle className="w-5 h-5 text-nevoa" />}
                <span className="text-sm text-marfim">{item.label}</span>
              </div>
              {!item.done && (
                <button className="flex items-center space-x-1.5 px-3 py-1.5 rounded-campo bg-ouro/10 border border-ouro/30 text-ouro text-xs font-semibold hover:bg-ouro/20 transition-colors">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Enviar documento</span>
                </button>
              )}
            </div>
          ))}
          <p className="text-xs text-nevoa">O documento é revisado por um humano da nossa equipe e usado só para confirmar identidade e maioridade — nunca fica visível no seu anúncio.</p>
        </div>
      )}

      {tab === 'estatisticas' && (
        <div className="max-w-xl space-y-3">
          {[
            { label: 'Visualizações do perfil', value: 1284, max: 1284 },
            { label: 'Cliques no WhatsApp', value: 96, max: 1284 },
            { label: 'Vezes favoritada', value: 41, max: 1284 },
          ].map((s) => (
            <div key={s.label} className="bg-grafite border border-white/10 p-4 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-nevoa">{s.label}</span>
                <span className="text-marfim font-semibold font-mono">{s.value.toLocaleString('pt-BR')}</span>
              </div>
              <div className="h-1.5 bg-white/10 overflow-hidden">
                <div className="h-full bg-ouro" style={{ width: `${Math.max(4, (s.value / s.max) * 100)}%` }} />
              </div>
            </div>
          ))}
          <p className="text-xs text-nevoa flex items-center space-x-1.5 pt-1"><Heart className="w-3.5 h-3.5 text-ouro" /><span>Números dos últimos 30 dias, dados de demonstração.</span></p>
        </div>
      )}

      {tab === 'plano' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl">
          {mockPlans.map((plano) => (
            <div key={plano.id} className={`p-5 space-y-3 border ${plano.id === planoAtual ? 'border-ouro bg-ouro/5' : 'border-white/10 bg-grafite'}`}>
              <div className="text-sm font-semibold text-marfim">{plano.name}</div>
              <div className="text-2xl font-display text-ouro">{plano.price}<span className="text-xs text-nevoa ml-1">{plano.period}</span></div>
              <ul className="space-y-1.5 text-xs text-nevoa">
                {plano.features.map((f) => (
                  <li key={f} className="flex items-start space-x-1.5"><Check className="w-3.5 h-3.5 text-verificado-texto shrink-0 mt-0.5" /><span>{f}</span></li>
                ))}
              </ul>
              <button
                onClick={() => setPlanoAtual(plano.id)}
                disabled={plano.id === planoAtual}
                className="w-full py-2 rounded-campo bg-ouro hover:bg-champanhe disabled:opacity-40 disabled:cursor-default text-black font-bold text-xs transition-colors"
              >
                {plano.id === planoAtual ? 'Plano atual' : 'Assinar'}
              </button>
            </div>
          ))}
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
