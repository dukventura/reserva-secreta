import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MessageCircle, CheckCircle2, Mail, KeyRound, PartyPopper, AlertCircle } from 'lucide-react';
import { useSession } from '../context/SessionContext';
import { ApiError, enviarPerfilParaAprovacao, listarCidades, type CityOption } from '../lib/api';
import { Monograma } from '../components/Logo';

type Etapa = 'dados' | 'sucesso';
type Categoria = 'VIP' | 'Mulheres' | 'Trans';

export const AdvertisePage: React.FC = () => {
  const { registrarProfissional } = useSession();
  const navigate = useNavigate();
  const [etapa, setEtapa] = useState<Etapa>('dados');
  const [cidades, setCidades] = useState<CityOption[]>([]);
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    age: '',
    city: '',
    category: 'VIP' as Categoria,
    whatsapp: '',
  });

  useEffect(() => {
    listarCidades()
      .then(({ cidades }) => {
        setCidades(cidades);
        setFormData((prev) => (prev.city ? prev : { ...prev, city: cidades[0]?.name ?? '' }));
      })
      .catch(() => setErro('Não foi possível carregar a lista de cidades. Recarregue a página.'));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    setEnviando(true);
    try {
      await registrarProfissional({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        city: formData.city,
        category: formData.category,
        age: Number(formData.age),
        whatsapp: formData.whatsapp.replace(/\D/g, ''),
      });
      // Registro cria o perfil como rascunho; enviar para a fila do
      // gerente e' um passo separado, e e' o que a mensagem de sucesso
      // abaixo promete ("entrou na fila de analise").
      await enviarPerfilParaAprovacao();
      setEtapa('sucesso');
    } catch (err) {
      setErro(err instanceof ApiError ? err.message : 'Não foi possível concluir o cadastro. Tente novamente.');
    } finally {
      setEnviando(false);
    }
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

        {etapa === 'dados' && (
          <form onSubmit={handleSubmit} className="space-y-4">
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

            {erro && (
              <div className="flex items-start space-x-2 bg-red-500/10 border border-red-500/30 p-3 text-xs text-red-300">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{erro}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-nevoa mb-1">Seu Nome / Nome Artístico</label>
              <input
                type="text"
                required
                minLength={2}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Amanda Santos"
                className="w-full bg-onix text-marfim text-sm rounded-campo px-4 py-2.5 border border-white/15 focus:border-ouro outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-nevoa mb-1.5">E-mail</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-ouro absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="seu@email.com"
                  className="w-full bg-onix text-marfim text-sm rounded-campo pl-10 pr-4 py-3 border border-white/15 focus:border-ouro outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-nevoa mb-1.5">Senha</label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-ouro absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  minLength={8}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Mínimo 8 caracteres"
                  className="w-full bg-onix text-marfim text-sm rounded-campo pl-10 pr-4 py-3 border border-white/15 focus:border-ouro outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-nevoa mb-1">Idade</label>
                <input
                  type="number"
                  required
                  min={18}
                  max={99}
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  placeholder="18"
                  className="w-full bg-onix text-marfim text-sm rounded-campo px-3 py-2.5 border border-white/15 focus:border-ouro outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-nevoa mb-1">Categoria</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as Categoria })}
                  className="w-full bg-onix text-marfim text-sm rounded-campo px-3 py-2.5 border border-white/15 focus:border-ouro outline-none"
                >
                  <option value="VIP">VIP</option>
                  <option value="Mulheres">Mulheres</option>
                  <option value="Trans">Trans</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-nevoa mb-1">Cidade</label>
              <select
                required
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full bg-onix text-marfim text-sm rounded-campo px-3 py-2.5 border border-white/15 focus:border-ouro outline-none"
              >
                {cidades.length === 0 && <option value="">Carregando cidades...</option>}
                {cidades.map((c) => (
                  <option key={c.slug} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-nevoa mb-1.5">Seu WhatsApp profissional</label>
              <input
                type="tel"
                required
                value={formData.whatsapp}
                onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                placeholder="(35) 99999-9999"
                className="w-full bg-onix text-marfim text-sm rounded-campo px-4 py-3 border border-white/15 focus:border-ouro outline-none"
              />
              <p className="mt-1.5 text-[11px] text-nevoa">Essa informação fica visível no seu anúncio publicado.</p>
            </div>

            <button
              type="submit"
              disabled={enviando}
              className="w-full flex items-center justify-center space-x-2 py-3.5 rounded-campo bg-whatsapp hover:bg-whatsapp-hover text-marfim font-extrabold text-sm shadow-xl transition-all disabled:opacity-60"
            >
              <MessageCircle className="w-5 h-5 fill-white" />
              <span>{enviando ? 'Enviando...' : 'Criar conta e enviar para análise'}</span>
            </button>

            <p className="text-center text-xs text-nevoa">
              Já tem conta? <Link to="/entrar" className="text-ouro hover:text-champanhe">Entrar</Link>
            </p>
          </form>
        )}

        {etapa === 'sucesso' && (
          <div className="text-center space-y-4 py-4">
            <PartyPopper className="w-10 h-10 text-ouro mx-auto" />
            <h2 className="text-xl font-display text-marfim">Cadastro recebido!</h2>
            <p className="text-sm text-nevoa">
              Seu anúncio entrou na fila de análise da nossa equipe. Assim que o documento for verificado, ele fica visível no catálogo — normalmente em até 24h úteis.
            </p>
            <button
              onClick={() => navigate('/')}
              className="inline-block px-5 py-2.5 rounded-campo bg-ouro hover:bg-champanhe text-black font-bold text-sm transition-colors"
            >
              Voltar para o site
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
