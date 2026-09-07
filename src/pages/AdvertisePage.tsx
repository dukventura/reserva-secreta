import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, CheckCircle2, Phone, KeyRound, PartyPopper, Info } from 'lucide-react';
import { useModeration } from '../context/ModerationContext';
import { Monograma } from '../components/Logo';

/* Cadastro da profissional. A porta de entrada e telefone + codigo,
   como no concorrente analisado no plano estrategico: registro rapido
   e gratuito, verificacao pesada (documento) so na hora de publicar -
   nao na entrada. Sem back-end, o SMS e simulado e dito como tal na
   tela; nada aqui finge ser uma integracao real. */

type Etapa = 'telefone' | 'codigo' | 'dados' | 'sucesso';

const CODIGO_DEMO = '1234';

export const AdvertisePage: React.FC = () => {
  const { submitProfile } = useModeration();
  const [etapa, setEtapa] = useState<Etapa>('telefone');
  const [whatsapp, setWhatsapp] = useState('');
  const [codigo, setCodigo] = useState('');
  const [erroCodigo, setErroCodigo] = useState(false);
  const [formData, setFormData] = useState({ name: '', city: 'Ilicínea' as 'Ilicínea' | 'Boa Esperança', category: 'VIP' as 'VIP' | 'Mulheres' | 'Trans' });

  const handleEnviarCodigo = (e: React.FormEvent) => {
    e.preventDefault();
    if (whatsapp.replace(/\D/g, '').length < 10) return;
    setEtapa('codigo');
  };

  const handleConfirmarCodigo = (e: React.FormEvent) => {
    e.preventDefault();
    if (codigo !== CODIGO_DEMO) {
      setErroCodigo(true);
      return;
    }
    setErroCodigo(false);
    setEtapa('dados');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitProfile({
      name: formData.name,
      age: 18,
      city: formData.city,
      category: formData.category,
      whatsapp: whatsapp.replace(/\D/g, ''),
      coverImage: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=400&q=80',
    });
    setEtapa('sucesso');
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-10 sm:py-16">
      <div className="bg-grafite border border-ouro/30 shadow-2xl p-6 sm:p-8 space-y-6">

        <div className="text-center space-y-2">
          <Monograma size={48} className="mx-auto" />
          <h1 className="text-2xl font-display font-normal text-marfim">
            Anuncie no <span className="text-ouro">Reserva Secreta</span>
          </h1>
          <p className="text-xs text-nevoa">
            Cadastro grátis em 2 minutos. A verificação de documento acontece depois, só na hora de publicar seu anúncio.
          </p>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-1.5">
          {(['telefone', 'codigo', 'dados'] as Etapa[]).map((s, i) => (
            <div key={s} className={`h-1 flex-1 ${
              etapa === 'sucesso' || (['telefone', 'codigo', 'dados'] as Etapa[]).indexOf(etapa) >= i ? 'bg-ouro' : 'bg-white/10'
            }`} />
          ))}
        </div>

        {etapa === 'telefone' && (
          <form onSubmit={handleEnviarCodigo} className="space-y-4">
            <div className="space-y-2 bg-white/5 p-3.5 border border-white/10 text-xs text-nevoa">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-verificado-texto shrink-0" />
                <span>Perfil com fotos e galeria própria</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-verificado-texto shrink-0" />
                <span>Botão direto para o seu WhatsApp, sem intermediários</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-verificado-texto shrink-0" />
                <span>Selo de verificado após análise de documento</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-nevoa mb-1.5">Seu WhatsApp profissional</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-ouro absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  required
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="(35) 99999-9999"
                  className="w-full bg-onix text-marfim text-sm rounded-campo pl-10 pr-4 py-3 border border-white/15 focus:border-ouro outline-none"
                />
              </div>
              <p className="mt-1.5 text-[11px] text-nevoa">Essa informação fica visível no seu anúncio publicado.</p>
            </div>

            <button type="submit" className="w-full flex items-center justify-center space-x-2 py-3.5 rounded-campo bg-ouro hover:bg-champanhe text-black font-extrabold text-sm transition-all">
              <span>Enviar código de confirmação</span>
            </button>

            <p className="text-center text-xs text-nevoa">
              Já tem conta? <Link to="/entrar" className="text-ouro hover:text-champanhe">Entrar</Link>
            </p>
          </form>
        )}

        {etapa === 'codigo' && (
          <form onSubmit={handleConfirmarCodigo} className="space-y-4">
            <div className="flex items-start space-x-2 bg-ouro/10 border border-ouro/20 p-3 text-xs text-champanhe">
              <Info className="w-4 h-4 shrink-0 mt-0.5" />
              <span>Nesta demonstração não há envio real de SMS. Use o código <strong className="font-mono">{CODIGO_DEMO}</strong> para continuar.</span>
            </div>
            <div>
              <label className="block text-xs font-semibold text-nevoa mb-1.5">Código enviado para {whatsapp}</label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-ouro absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  inputMode="numeric"
                  required
                  value={codigo}
                  onChange={(e) => { setCodigo(e.target.value); setErroCodigo(false); }}
                  placeholder="0000"
                  className={`w-full bg-onix text-marfim text-sm tracking-[0.3em] rounded-campo pl-10 pr-4 py-3 border outline-none ${erroCodigo ? 'border-red-500/60' : 'border-white/15 focus:border-ouro'}`}
                />
              </div>
              {erroCodigo && <p className="mt-1.5 text-[11px] text-red-400">Código incorreto. Tente {CODIGO_DEMO}.</p>}
            </div>
            <button type="submit" className="w-full py-3.5 rounded-campo bg-ouro hover:bg-champanhe text-black font-extrabold text-sm transition-all">
              Confirmar código
            </button>
            <button type="button" onClick={() => setEtapa('telefone')} className="w-full text-center text-xs text-nevoa hover:text-marfim">
              Corrigir número
            </button>
          </form>
        )}

        {etapa === 'dados' && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-nevoa mb-1">Seu Nome / Nome Artístico</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Amanda Santos"
                className="w-full bg-onix text-marfim text-sm rounded-campo px-4 py-2.5 border border-white/15 focus:border-ouro outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-nevoa mb-1">Cidade</label>
                <select
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value as typeof formData.city })}
                  className="w-full bg-onix text-marfim text-sm rounded-campo px-3 py-2.5 border border-white/15 focus:border-ouro outline-none"
                >
                  <option value="Ilicínea">Ilicínea</option>
                  <option value="Boa Esperança">Boa Esperança</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-nevoa mb-1">Categoria</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as typeof formData.category })}
                  className="w-full bg-onix text-marfim text-sm rounded-campo px-3 py-2.5 border border-white/15 focus:border-ouro outline-none"
                >
                  <option value="VIP">VIP</option>
                  <option value="Mulheres">Mulheres</option>
                  <option value="Trans">Trans</option>
                </select>
              </div>
            </div>
            <button type="submit" className="w-full flex items-center justify-center space-x-2 py-3.5 rounded-campo bg-whatsapp hover:bg-whatsapp-hover text-marfim font-extrabold text-sm shadow-xl transition-all">
              <MessageCircle className="w-5 h-5 fill-white" />
              <span>Enviar para análise</span>
            </button>
          </form>
        )}

        {etapa === 'sucesso' && (
          <div className="text-center space-y-4 py-4">
            <PartyPopper className="w-10 h-10 text-ouro mx-auto" />
            <h2 className="text-xl font-display text-marfim">Cadastro recebido!</h2>
            <p className="text-sm text-nevoa">
              Seu anúncio entrou na fila de análise da nossa equipe. Assim que o documento for verificado, ele fica visível no catálogo — normalmente em até 24h úteis.
            </p>
            <Link to="/" className="inline-block px-5 py-2.5 rounded-campo bg-ouro hover:bg-champanhe text-black font-bold text-sm transition-colors">
              Voltar para o site
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
