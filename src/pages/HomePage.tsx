import React, { useState, useEffect } from 'react';
import { Hero } from '../components/Hero';
import { ProfileGrid } from '../components/ProfileGrid';
import { useProfileFilters } from '../hooks/useProfileFilters';
import { listarPerfis, ApiError, type PublicProfile } from '../lib/api';

export const HomePage: React.FC = () => {
  const { filters, handleFilterChange, handleResetFilters } = useProfileFilters();
  const [profiles, setProfiles] = useState<PublicProfile[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    setCarregando(true);
    setErro('');
    listarPerfis({ city: filters.city, category: filters.category })
      .then(({ perfis }) => setProfiles(perfis))
      .catch((err) => setErro(err instanceof ApiError ? err.message : 'Não foi possível carregar os perfis.'))
      .finally(() => setCarregando(false));
  }, [filters.city, filters.category]);

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
