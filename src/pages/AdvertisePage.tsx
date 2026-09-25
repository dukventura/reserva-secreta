import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MessageCircle, CheckCircle2, Mail, KeyRound, PartyPopper, AlertCircle, MapPin } from 'lucide-react';
import { useSession } from '../context/SessionContext';
import { ApiError, enviarPerfilParaAprovacao, listarCidades, type CityOption } from '../lib/api';
import { Monograma } from '../components/Logo';

type Etapa = 'dados' | 'sucesso';
type Categoria = 'VIP' | 'Mulheres' | 'Trans';
const MAX_SUGESTOES = 8;

export const AdvertisePage: React.FC = () => {
  const { registrarProfissional } = useSession();
  const navigate = useNavigate();
  const [etapa, setEtapa] = useState<Etapa>('dados');
  const [cidades, setCidades] = useState<CityOption[]>([]);
  const [cityQuery, setCityQuery] = useState('');
  const [cityDropdownAberto, setCityDropdownAberto] = useState(false);
  const cityDropdownRef = useRef<HTMLDivElement>(null);
  const [erro, setErro] = useState('');
  const [erroCidade, setErroCidade] = useState('');
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
    // Lista completa dos 853 municipios de MG (nao so as 2 cidades que
    // ja tinham anuncio) - o autocomplete filtra conforme digita, em
    // vez de um <select> gigante ou travado numa lista curta.
    listarCidades()
      .then(({ cidades }) => setCidades(cidades))
      .catch(() => setErro('Não foi possível carregar a lista de cidades. Recarregue a página.'));
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (cityDropdownRef.current && !cityDropdownRef.current.contains(event.target as Node)) {
        setCityDropdownAberto(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const cidadesFiltradas = cityQuery.trim()
    ? cidades.filter((c) => c.name.toLowerCase().includes(cityQuery.trim().toLowerCase())).slice(0, MAX_SUGESTOES)
    : [];

  const handleSelecionarCidade = (cidade: CityOption) => {
    setFormData((prev) => ({ ...prev, city: cidade.name }));
    setCityQuery(cidade.name);
    setCityDropdownAberto(false);
    setErroCidade('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    setErroCidade('');
    // Cidade so' e' valida se veio de um clique na sugestao (garante
    // que bate com uma cidade real da lista, nao texto livre digitado
    // e nunca selecionado).
    if (!formData.city || formData.city !== cityQuery) {
      setErroCidade('Digite o nome da sua cidade e selecione uma opção da lista.');
      return;
    }
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

            <div className="relative" ref={cityDropdownRef}>
              <label className="block text-xs font-semibold text-nevoa mb-1">Cidade</label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-ouro absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={cityQuery}
                  onChange={(e) => {
                    setCityQuery(e.target.value);
                    setCityDropdownAberto(true);
                    if (formData.city) setFormData((prev) => ({ ...prev, city: '' }));
                  }}
                  onFocus={() => setCityDropdownAberto(true)}
                  placeholder={cidades.length === 0 ? 'Carregando cidades...' : 'Digite o nome da sua cidade'}
                  disabled={cidades.length === 0}
                  className={`w-full bg-onix text-marfim text-sm rounded-campo pl-10 pr-4 py-2.5 border outline-none disabled:opacity-60 ${
                    erroCidade ? 'border-red-500' : 'border-white/15 focus:border-ouro'
                  }`}
                />
              </div>

              {cityDropdownAberto && cityQuery.trim() && (
                <div className="absolute left-0 right-0 top-full mt-1.5 bg-onix border border-ouro/30 rounded-campo shadow-2xl z-20 overflow-hidden max-h-56 overflow-y-auto">
                  {cidadesFiltradas.length > 0 ? (
                    cidadesFiltradas.map((c) => (
                      <button
                        key={c.slug}
                        type="button"
                        onClick={() => handleSelecionarCidade(c)}
                        className="w-full text-left px-4 py-2.5 text-sm text-marfim hover:bg-ouro/15 transition-colors border-b border-white/5 last:border-b-0"
                      >
                        {c.name}
                      </button>
                    ))
                  ) : (
                    <div className="p-3 text-xs text-nevoa text-center">Nenhuma cidade encontrada</div>
                  )}
                </div>
              )}

              {erroCidade && <p className="mt-1.5 text-[11px] text-red-400">{erroCidade}</p>}
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
