import React from 'react';
import { Search, MapPin, Sparkles, Filter, CheckCircle2, ShieldCheck, HeartHandshake } from 'lucide-react';
import type { City, Category, FilterState } from '../types';

interface HeroProps {
  filters: FilterState;
  onFilterChange: (updated: Partial<FilterState>) => void;
  totalProfiles: number;
}

export const Hero: React.FC<HeroProps> = ({ filters, onFilterChange, totalProfiles }) => {
  return (
    <section className="relative overflow-hidden pt-8 pb-12 sm:pt-14 sm:pb-16 bg-gradient-to-b from-grafite to-onix">
      {/* Ambient background glow */}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          
          {/* Badge indicator */}
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-campo bg-ouro/10 border border-ouro/30 backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-ouro animate-pulse" />
            <span className="text-xs font-semibold text-champanhe tracking-wide uppercase">
              O Guia Mais Exclusivo do Sul de Minas
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-display font-normal text-marfim tracking-tight leading-tight">
            As melhores acompanhantes <br className="hidden sm:inline" />
            <span className="text-ouro">da região</span>
          </h1>

          <p className="text-sm sm:text-lg text-nevoa max-w-2xl mx-auto font-normal">
            Acompanhantes VIP de alto nível em <strong className="text-ouro font-semibold">Ilicínea</strong>, <strong className="text-ouro font-semibold">Boa Esperança</strong> e cidades vizinhas. Perfis 100% verificados com contato direto.
          </p>

          {/* Key trust badges */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs sm:text-sm text-nevoa">
            <div className="flex items-center space-x-1.5 bg-white/5 px-3 py-1.5 rounded-campo border border-white/10">
              <ShieldCheck className="w-4 h-4 text-ouro" />
              <span>Fotos Reais Verificadas</span>
            </div>
            <div className="flex items-center space-x-1.5 bg-white/5 px-3 py-1.5 rounded-campo border border-white/10">
              <HeartHandshake className="w-4 h-4 text-ouro" />
              <span>Discrição & Sigilo Absoluto</span>
            </div>
            <div className="flex items-center space-x-1.5 bg-white/5 px-3 py-1.5 rounded-campo border border-white/10">
              <CheckCircle2 className="w-4 h-4 text-verificado-texto" />
              <span>WhatsApp Direto</span>
            </div>
          </div>
        </div>

        {/* Filter and Search Bar Container */}
        <div className="mt-8 sm:mt-12 max-w-4xl mx-auto">
          <div className="glass-panel p-4 sm:p-6 rounded-none sm:rounded-none border border-ouro/20 shadow-2xl shadow-black/80 space-y-4">
            
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center space-x-2 text-marfim font-semibold text-sm sm:text-base">
                <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-ouro" />
                <span>Encontre sua acompanhante ideal</span>
              </div>
              <span className="text-xs text-ouro font-medium px-2.5 py-1 rounded-campo bg-ouro/10 border border-ouro/20">
                {totalProfiles} {totalProfiles === 1 ? 'perfil disponível' : 'perfis disponíveis'}
              </span>
            </div>

            {/* Filter Controls Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 sm:gap-4">
              
              {/* Dropdown 1: Cidade */}
              <div className="lg:col-span-4 space-y-1.5">
                <label className="block text-xs font-semibold text-nevoa uppercase tracking-wider flex items-center space-x-1">
                  <MapPin className="w-3.5 h-3.5 text-ouro" />
                  <span>Cidade</span>
                </label>
                <div className="relative">
                  <select
                    value={filters.city}
                    onChange={(e) => onFilterChange({ city: e.target.value as City })}
                    className="w-full bg-grafite text-marfim text-sm font-medium rounded-campo px-4 py-3 border border-white/15 focus:border-ouro focus:ring-2 focus:ring-ouro/20 outline-none appearance-none transition-all cursor-pointer"
                  >
                    <option value="Todas">Todas as Cidades</option>
                    <option value="Ilicínea">Ilicínea</option>
                    <option value="Boa Esperança">Boa Esperança</option>
                  </select>
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-nevoa">
                    ▼
                  </div>
                </div>
              </div>

              {/* Dropdown 2: Categoria */}
              <div className="lg:col-span-4 space-y-1.5">
                <label className="block text-xs font-semibold text-nevoa uppercase tracking-wider flex items-center space-x-1">
                  <Sparkles className="w-3.5 h-3.5 text-ouro" />
                  <span>Categoria</span>
                </label>
                <div className="relative">
                  <select
                    value={filters.category}
                    onChange={(e) => onFilterChange({ category: e.target.value as Category })}
                    className="w-full bg-grafite text-marfim text-sm font-medium rounded-campo px-4 py-3 border border-white/15 focus:border-ouro focus:ring-2 focus:ring-ouro/20 outline-none appearance-none transition-all cursor-pointer"
                  >
                    <option value="Todas">Todas as Categorias</option>
                    <option value="VIP">VIP</option>
                    <option value="Mulheres">Mulheres</option>
                    <option value="Trans">Trans</option>
                  </select>
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-nevoa">
                    ▼
                  </div>
                </div>
              </div>

              {/* Text Search Input */}
              <div className="lg:col-span-4 space-y-1.5">
                <label className="block text-xs font-semibold text-nevoa uppercase tracking-wider flex items-center space-x-1">
                  <Search className="w-3.5 h-3.5 text-ouro" />
                  <span>Buscar</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={filters.searchQuery}
                    onChange={(e) => onFilterChange({ searchQuery: e.target.value })}
                    placeholder="Nome, olhos, loira, etc..."
                    className="w-full bg-grafite text-marfim placeholder-nevoa text-sm font-medium rounded-campo px-4 py-3 border border-white/15 focus:border-ouro focus:ring-2 focus:ring-ouro/20 outline-none transition-all"
                  />
                  {filters.searchQuery && (
                    <button
                      onClick={() => onFilterChange({ searchQuery: '' })}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-nevoa hover:text-marfim bg-white/10 rounded-full w-5 h-5 flex items-center justify-center"
                    >
                                          </button>
                  )}
                </div>
              </div>

            </div>

            {/* Quick Pills Filter Shortcuts */}
            <div className="pt-2 flex flex-wrap items-center gap-2 text-xs">
              <span className="text-nevoa font-medium mr-1">Filtros rápidos:</span>
              
              <button
                onClick={() => onFilterChange({ city: 'Todas', category: 'Todas', searchQuery: '' })}
                className={`px-3 py-1 rounded-campo border transition-all ${
                  filters.city === 'Todas' && filters.category === 'Todas' && !filters.searchQuery
                    ? 'bg-ouro/20 border-ouro text-champanhe font-semibold'
                    : 'bg-white/5 border-white/10 text-nevoa hover:border-white/30'
                }`}
              >
                Todos Perfis
              </button>

              <button
                onClick={() => onFilterChange({ city: 'Ilicínea' })}
                className={`px-3 py-1 rounded-campo border transition-all ${
                  filters.city === 'Ilicínea'
                    ? 'bg-ouro/20 border-ouro text-champanhe font-semibold'
                    : 'bg-white/5 border-white/10 text-nevoa hover:border-white/30'
                }`}
              >
                Ilicínea
              </button>

              <button
                onClick={() => onFilterChange({ city: 'Boa Esperança' })}
                className={`px-3 py-1 rounded-campo border transition-all ${
                  filters.city === 'Boa Esperança'
                    ? 'bg-ouro/20 border-ouro text-champanhe font-semibold'
                    : 'bg-white/5 border-white/10 text-nevoa hover:border-white/30'
                }`}
              >
                Boa Esperança
              </button>

              <button
                onClick={() => onFilterChange({ category: 'VIP' })}
                className={`px-3 py-1 rounded-campo border transition-all ${
                  filters.category === 'VIP'
                    ? 'bg-ouro/20 border-ouro text-champanhe font-semibold'
                    : 'bg-white/5 border-white/10 text-nevoa hover:border-white/30'
                }`}
              >
                Somente VIP
              </button>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};
