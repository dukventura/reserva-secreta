import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPinOff } from 'lucide-react';
import { Hero } from '../components/Hero';
import { ProfileGrid } from '../components/ProfileGrid';
import { mockProfiles } from '../data/mockProfiles';
import { useProfileFilters } from '../hooks/useProfileFilters';
import { cidadePorSlug } from '../data/cities';

export const CityPage: React.FC = () => {
  const { cidade: cidadeSlug } = useParams<{ cidade: string }>();
  const cidade = cidadePorSlug(cidadeSlug);
  const { filters, handleFilterChange, handleResetFilters } = useProfileFilters(cidade);

  if (!cidade) {
    return (
      <div className="max-w-lg mx-auto px-4 py-24 text-center space-y-4">
        <MapPinOff className="w-10 h-10 text-ouro mx-auto" />
        <h1 className="text-2xl font-display text-marfim">Cidade não encontrada</h1>
        <p className="text-sm text-nevoa">Ainda não atendemos essa região. Veja o catálogo completo.</p>
        <Link to="/" className="inline-block px-5 py-2.5 rounded-campo bg-ouro hover:bg-champanhe text-black font-bold text-sm transition-colors">
          Voltar para a home
        </Link>
      </div>
    );
  }

  return (
    <>
      <Hero filters={filters} onFilterChange={handleFilterChange} totalProfiles={mockProfiles.filter((p) => p.city === cidade).length} />
      <ProfileGrid profiles={mockProfiles} filters={filters} onResetFilters={handleResetFilters} />
    </>
  );
};
