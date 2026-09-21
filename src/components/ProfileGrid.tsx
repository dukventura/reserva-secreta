import React from 'react';
import type { FilterState } from '../types';
import type { PublicProfile } from '../lib/api';
import { ProfileCard } from './ProfileCard';
import { SearchX, RotateCcw } from 'lucide-react';

interface ProfileGridProps {
  profiles: PublicProfile[];
  filters: FilterState;
  onResetFilters: () => void;
}

export const ProfileGrid: React.FC<ProfileGridProps> = ({
  profiles,
  filters,
  onResetFilters,
}) => {
  // Cidade e categoria ja vem filtradas pela API (query params) - o
  // que resta filtrar no cliente e' a busca textual livre, que a API
  // ainda nao suporta.
  const filteredProfiles = profiles.filter((p) => {
    if (filters.searchQuery.trim()) {
      const q = filters.searchQuery.toLowerCase();
      const matchName = p.stage_name.toLowerCase().includes(q);
      const matchBio = (p.bio ?? '').toLowerCase().includes(q);
      const matchHair = (p.hair ?? '').toLowerCase().includes(q);
      const matchServices = p.services.some((s) => s.toLowerCase().includes(q));
      if (!matchName && !matchBio && !matchHair && !matchServices) {
        return false;
      }
    }
    return true;
  });

  return (
    <section id="grid" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">

      {/* Header section with count */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <h2 className="text-xl sm:text-2xl font-display font-normal text-marfim tracking-tight flex items-center space-x-2">
            <span>Acompanhantes em Destaque</span>
            {filters.city !== 'Todas' && (
              <span className="text-ouro font-normal">em {filters.city}</span>
            )}
          </h2>
          <p className="text-xs sm:text-sm text-nevoa mt-1">
            Selecione uma acompanhante para ver fotos, ficha técnica completa e contato WhatsApp.
          </p>
        </div>

        {/* Applied filters info */}
        <div className="flex items-center space-x-2 text-xs text-nevoa">
          <span>Exibindo <strong className="text-marfim">{filteredProfiles.length}</strong> de {profiles.length} perfis</span>
        </div>
      </div>

      {/* Grid or Empty State */}
      {filteredProfiles.length > 0 ? (
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProfiles.map((profile) => (
            <ProfileCard key={profile.slug} profile={profile} />
          ))}
        </div>
      ) : (
        <div className="mt-12 p-8 sm:p-12 text-center glass-panel rounded-none border border-white/10 max-w-md mx-auto space-y-4">
          <div className="w-16 h-16 rounded-campo bg-ouro/10 border border-ouro/20 flex items-center justify-center mx-auto text-ouro">
            <SearchX className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-display font-normal text-marfim">Nenhum perfil encontrado</h3>
          <p className="text-xs sm:text-sm text-nevoa">
            Não encontramos acompanhantes com os filtros selecionados no momento. Tente alterar a cidade ou a categoria.
          </p>
          <button
            onClick={onResetFilters}
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-campo bg-ouro hover:bg-ouro text-black font-bold text-xs transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Limpar todos os filtros</span>
          </button>
        </div>
      )}

    </section>
  );
};
