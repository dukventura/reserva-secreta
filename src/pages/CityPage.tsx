import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPinOff } from 'lucide-react';
import { Hero } from '../components/Hero';
import { ProfileGrid } from '../components/ProfileGrid';
import { useProfileFilters } from '../hooks/useProfileFilters';
import { cidadePorSlug } from '../data/cities';
import { listarPerfis, ApiError, type PublicProfile } from '../lib/api';

export const CityPage: React.FC = () => {
  const { cidade: cidadeSlug } = useParams<{ cidade: string }>();
  const cidade = cidadePorSlug(cidadeSlug);
  const { filters, handleFilterChange, handleResetFilters } = useProfileFilters(cidade);
  const [profiles, setProfiles] = useState<PublicProfile[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    if (!cidade) return;
    setCarregando(true);
    setErro('');
    listarPerfis({ city: filters.city, category: filters.category })
      .then(({ perfis }) => setProfiles(perfis))
      .catch((err) => setErro(err instanceof ApiError ? err.message : 'Não foi possível carregar os perfis.'))
      .finally(() => setCarregando(false));
  }, [cidade, filters.city, filters.category]);

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
      <Hero filters={filters} onFilterChange={handleFilterChange} totalProfiles={profiles.length} />
      {erro ? (
        <p className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center text-sm text-red-300">{erro}</p>
      ) : carregando ? (
        <p className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center text-sm text-nevoa">Carregando perfis...</p>
      ) : (
        <ProfileGrid profiles={profiles} filters={filters} onResetFilters={handleResetFilters} />
      )}
    </>
  );
};
