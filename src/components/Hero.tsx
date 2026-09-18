import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Sparkles, Filter, CheckCircle2, ShieldCheck, HeartHandshake, UserPlus, Crown, ChevronDown } from 'lucide-react';
import type { City, Category, FilterState } from '../types';
import { CIDADES, slugDaCidade } from '../data/cities';

interface HeroProps {
  filters: FilterState;
  onFilterChange: (updated: Partial<FilterState>) => void;
  totalProfiles: number;
}

export const Hero: React.FC<HeroProps> = ({ filters, onFilterChange, totalProfiles }) => {
  // Autocomplete state for city search
  const [cityInput, setCityInput] = useState(filters.city === 'Todas' ? '' : filters.city);
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);
  const cityDropdownRef = useRef<HTMLDivElement>(null);

  // Available cities list including "Todas as Cidades"
  const allCityOptions = ['Todas as Cidades', ...CIDADES.map(c => c.nome)];

  const filteredCities = allCityOptions.filter(cidade =>
    cidade.toLowerCase().includes(cityInput.toLowerCase())
  );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (cityDropdownRef.current && !cityDropdownRef.current.contains(event.target as Node)) {
        setIsCityDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectCity = (cityName: string) => {
    const selectedCity = cityName === 'Todas as Cidades' ? 'Todas' : (cityName as City);
    onFilterChange({ city: selectedCity });
    setCityInput(selectedCity === 'Todas' ? '' : selectedCity);
    setIsCityDropdownOpen(false);
  };

  return (
    <section className="relative overflow-hidden pt-8 pb-14 sm:pt-16 sm:pb-20 bg-gradient-to-b from-[#1E080D] via-[#16070B] to-[#120508]">
      {/* Glow de iluminação de fundo */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-ouro/10 blur-3xl pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Top Header Badge & Text */}
        <div className="text-center max-w-3xl mx-auto space-y-6">
          
          {/* Badge de Destaque */}
          <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-ouro/15 border border-ouro/40 backdrop-blur-md shadow-lg shadow-black/40">
            <Sparkles className="w-4 h-4 text-ouro animate-pulse" />
            <span className="text-xs sm:text-sm font-semibold text-white tracking-wide uppercase">
              O Guia Mais Exclusivo do Sul de Minas
            </span>
          </div>

          {/* Headline Principal */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-display font-normal text-white tracking-tight leading-tight">
            As melhores acompanhantes <br className="hidden sm:inline" />
            <span className="text-ouro font-serif">da região</span>
          </h1>

          <p className="text-base sm:text-xl text-gray-200 max-w-2xl mx-auto font-normal leading-relaxed">
            Acompanhantes VIP de alto nível no <strong className="text-ouro font-semibold">Sul de Minas</strong>. Perfis 100% verificados com contato direto.
          </p>

          {/* Badges de Confiança */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs sm:text-sm text-gray-300">
            <div className="flex items-center space-x-2 bg-white/5 px-3.5 py-2 rounded-lg border border-white/10 backdrop-blur-sm">
              <ShieldCheck className="w-4 h-4 text-ouro" />
              <span>Fotos Reais Verificadas</span>
            </div>
            <div className="flex items-center space-x-2 bg-white/5 px-3.5 py-2 rounded-lg border border-white/10 backdrop-blur-sm">
              <HeartHandshake className="w-4 h-4 text-ouro" />
              <span>Discrição & Sigilo Absoluto</span>
            </div>
            <div className="flex items-center space-x-2 bg-white/5 px-3.5 py-2 rounded-lg border border-white/10 backdrop-blur-sm">
              <CheckCircle2 className="w-4 h-4 text-verificado-texto" />
              <span>WhatsApp Direto</span>
            </div>
          </div>
        </div>

        {/* 🚦 DUAS COLUNAS: CAMINHO DO CLIENTE x CAMINHO DA ACOMPANHANTE */}
        <div className="mt-10 sm:mt-14 max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-6 items-stretch">

        {/* 🔍 PAINEL DE FILTRO E BUSCA COM AUTOCOMPLETE DE CIDADES (Cliente) */}
        <div className="lg:col-span-3">
          <div className="glass-panel h-full p-5 sm:p-7 rounded-xl border border-ouro/30 shadow-2xl shadow-black/80 space-y-5 bg-[#250D15]/90">

            <div className="flex items-center justify-between border-b border-white/15 pb-4">
              <div className="flex items-center space-x-2.5 text-white font-semibold text-base">
                <Filter className="w-5 h-5 text-ouro" />
                <span>Encontre sua acompanhante ideal</span>
              </div>
              <span className="text-xs sm:text-sm text-ouro font-semibold px-3 py-1 rounded-md bg-ouro/15 border border-ouro/30">
                {totalProfiles} {totalProfiles === 1 ? 'perfil disponível' : 'perfis disponíveis'}
              </span>
            </div>

            {/* Grid de Controles de Filtro */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4">
              
              {/* Autocomplete 1: Campo de Busca Inteligente de Cidades */}
              <div className="lg:col-span-5 space-y-1.5 relative" ref={cityDropdownRef}>
                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center space-x-1.5">
                  <MapPin className="w-4 h-4 text-ouro" />
                  <span>Cidade (Digite para buscar)</span>
                </label>
                
                <div className="relative">
                  <input
                    type="text"
                    value={cityInput}
                    onChange={(e) => {
                      setCityInput(e.target.value);
                      setIsCityDropdownOpen(true);
                    }}
                    onFocus={() => setIsCityDropdownOpen(true)}
                    placeholder="Digite o nome da sua cidade..."
                    className="w-full bg-[#18080C] text-white placeholder-gray-400 text-sm font-medium rounded-lg px-4 py-3 border border-white/20 focus:border-ouro focus:ring-2 focus:ring-ouro/30 outline-none transition-all pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setIsCityDropdownOpen(!isCityDropdownOpen)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    <ChevronDown className="w-4 h-4 text-ouro" />
                  </button>
                </div>

                {/* Dropdown com sugestões filtradas */}
                {isCityDropdownOpen && (
                  <div className="absolute left-0 right-0 top-full mt-1.5 bg-[#250D15] border border-ouro/40 rounded-lg shadow-2xl z-50 overflow-hidden max-h-60 overflow-y-auto">
                    {filteredCities.length > 0 ? (
                      filteredCities.map((cidade) => (
                        <button
                          key={cidade}
                          type="button"
                          onClick={() => handleSelectCity(cidade)}
                          className={`w-full text-left px-4 py-2.5 text-sm transition-colors border-b border-white/5 flex items-center justify-between ${
                            (filters.city === cidade || (cidade === 'Todas as Cidades' && filters.city === 'Todas'))
                              ? 'bg-ouro/20 text-white font-bold'
                              : 'text-gray-200 hover:bg-white/10 hover:text-white'
                          }`}
                        >
                          <span className="flex items-center space-x-2">
                            <MapPin className="w-3.5 h-3.5 text-ouro" />
                            <span>{cidade}</span>
                          </span>
                          {(filters.city === cidade || (cidade === 'Todas as Cidades' && filters.city === 'Todas')) && (
                            <span className="text-xs text-ouro">✓ Selecionada</span>
                          )}
                        </button>
                      ))
                    ) : (
                      <div className="p-3 text-xs text-gray-400 text-center">
                        Nenhuma cidade encontrada
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Select 2: Categoria */}
              <div className="lg:col-span-4 space-y-1.5">
                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center space-x-1.5">
                  <Sparkles className="w-4 h-4 text-ouro" />
                  <span>Categoria</span>
                </label>
                <div className="relative">
                  <select
                    value={filters.category}
                    onChange={(e) => onFilterChange({ category: e.target.value as Category })}
                    className="w-full bg-[#18080C] text-white text-sm font-medium rounded-lg px-4 py-3 border border-white/20 focus:border-ouro focus:ring-2 focus:ring-ouro/30 outline-none appearance-none transition-all cursor-pointer"
                  >
                    <option value="Todas">Todas as Categorias</option>
                    <option value="VIP">VIP</option>
                    <option value="Mulheres">Mulheres</option>
                    <option value="Trans">Trans</option>
                  </select>
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-ouro">
                    ▼
                  </div>
                </div>
              </div>

              {/* Input 3: Busca textual */}
              <div className="lg:col-span-3 space-y-1.5">
                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center space-x-1.5">
                  <Search className="w-4 h-4 text-ouro" />
                  <span>Buscar</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={filters.searchQuery}
                    onChange={(e) => onFilterChange({ searchQuery: e.target.value })}
                    placeholder="Nome, olhos..."
                    className="w-full bg-[#18080C] text-white placeholder-gray-400 text-sm font-medium rounded-lg px-4 py-3 border border-white/20 focus:border-ouro focus:ring-2 focus:ring-ouro/30 outline-none transition-all"
                  />
                  {filters.searchQuery && (
                    <button
                      onClick={() => onFilterChange({ searchQuery: '' })}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-300 hover:text-white bg-white/20 rounded-full w-5 h-5 flex items-center justify-center"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

            </div>

            {/* Atalhos Rápidos */}
            <div className="pt-2 flex flex-wrap items-center gap-2 text-xs">
              <span className="text-gray-300 font-medium mr-1">Filtros rápidos:</span>
              
              <button
                onClick={() => {
                  onFilterChange({ city: 'Todas', category: 'Todas', searchQuery: '' });
                  setCityInput('');
                }}
                className={`px-3 py-1.5 rounded-md border transition-all ${
                  filters.city === 'Todas' && filters.category === 'Todas' && !filters.searchQuery
                    ? 'bg-ouro/25 border-ouro text-white font-bold'
                    : 'bg-white/5 border-white/10 text-gray-300 hover:border-white/30 hover:text-white'
                }`}
              >
                Todos Perfis
              </button>

              <Link
                to={`/cidade/${slugDaCidade('Ilicínea')}`}
                onClick={() => {
                  onFilterChange({ city: 'Ilicínea' });
                  setCityInput('Ilicínea');
                }}
                className={`px-3 py-1.5 rounded-md border transition-all ${
                  filters.city === 'Ilicínea'
                    ? 'bg-ouro/25 border-ouro text-white font-bold'
                    : 'bg-white/5 border-white/10 text-gray-300 hover:border-white/30 hover:text-white'
                }`}
              >
                Ilicínea
              </Link>

              <Link
                to={`/cidade/${slugDaCidade('Boa Esperança')}`}
                onClick={() => {
                  onFilterChange({ city: 'Boa Esperança' });
                  setCityInput('Boa Esperança');
                }}
                className={`px-3 py-1.5 rounded-md border transition-all ${
                  filters.city === 'Boa Esperança'
                    ? 'bg-ouro/25 border-ouro text-white font-bold'
                    : 'bg-white/5 border-white/10 text-gray-300 hover:border-white/30 hover:text-white'
                }`}
              >
                Boa Esperança
              </Link>

              <button
                onClick={() => onFilterChange({ category: 'VIP' })}
                className={`px-3 py-1.5 rounded-md border transition-all ${
                  filters.category === 'VIP'
                    ? 'bg-ouro/25 border-ouro text-white font-bold'
                    : 'bg-white/5 border-white/10 text-gray-300 hover:border-white/30 hover:text-white'
                }`}
              >
                Somente VIP
              </button>
            </div>

            <Link
              to="/cadastro"
              className="w-full flex items-center justify-center space-x-2.5 px-6 py-3.5 rounded-lg bg-gradient-to-r from-ouro to-[#B89243] text-black font-bold text-base hover:brightness-110 transition-all shadow-xl shadow-ouro/20 border border-ouro active:scale-98"
            >
              <UserPlus className="w-5 h-5 text-black" />
              <span>Sou Cliente — Criar Conta</span>
            </Link>

          </div>
        </div>

        {/* 👑 PAINEL DA ACOMPANHANTE */}
        <div className="lg:col-span-2">
          <div className="h-full flex flex-col justify-between p-6 sm:p-7 rounded-xl border-2 border-ouro/50 bg-gradient-to-b from-grafite to-[#1E080D] shadow-2xl shadow-black/80 space-y-6">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-full bg-ouro/15 border border-ouro/40 flex items-center justify-center">
                <Crown className="w-6 h-6 text-ouro" />
              </div>
              <h2 className="text-xl sm:text-2xl font-display font-semibold text-white leading-snug">
                É acompanhante? <span className="text-ouro">Anuncie aqui.</span>
              </h2>
              <ul className="space-y-2.5 text-sm text-gray-200">
                <li className="flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-verificado-texto shrink-0 mt-0.5" />
                  <span>Contato direto pelo WhatsApp, sem intermediários</span>
                </li>
                <li className="flex items-start space-x-2">
                  <ShieldCheck className="w-4 h-4 text-verificado-texto shrink-0 mt-0.5" />
                  <span>Selo de perfil verificado gera mais confiança</span>
                </li>
                <li className="flex items-start space-x-2">
                  <HeartHandshake className="w-4 h-4 text-verificado-texto shrink-0 mt-0.5" />
                  <span>Você controla sua agenda e seu anúncio</span>
                </li>
              </ul>
            </div>

            <Link
              to="/anunciar"
              className="w-full inline-flex items-center justify-center space-x-2.5 px-6 py-3.5 rounded-lg bg-transparent border-2 border-ouro text-white font-bold text-base hover:bg-ouro/15 transition-all shadow-lg active:scale-98"
            >
              <Crown className="w-5 h-5 text-ouro" />
              <span>Quero Anunciar</span>
            </Link>
          </div>
        </div>

        </div>

      </div>
    </section>
  );
};
