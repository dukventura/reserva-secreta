import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPinOff } from 'lucide-react';
import { Hero } from '../components/Hero';
import { ProfileGrid } from '../components/ProfileGrid';
import { useProfileFilters } from '../hooks/useProfileFilters';
import { filtroCidade, rotuloCidade, textoDaCidade } from '../data/cities';
import { useSeo } from '../hooks/useSeo';
import { listarPerfis, buscarCidadePorSlug, ApiError, type CityOption, type PublicProfile } from '../lib/api';

export const CityPage: React.FC = () => {
  const { cidade: cidadeSlug } = useParams<{ cidade: string }>();
  // undefined = carregando, null = slug que nao existe na tabela.
  const [cidade, setCidade] = useState<CityOption | null | undefined>(undefined);
  const { filters, handleFilterChange, handleResetFilters } = useProfileFilters(cidade ?? undefined);
  const [profiles, setProfiles] = useState<PublicProfile[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  useSeo(cidade
    ? {
        title: `Acompanhantes em ${rotuloCidade(cidade)}`,
        description: `Acompanhantes de luxo em ${rotuloCidade(cidade)}. Perfis verificados com fotos reais, valores e contato direto pelo WhatsApp no Reserva Secreta.`,
      }
    : { title: 'Cidade não encontrada', noindex: true });

  useEffect(() => {
    if (!cidadeSlug) return;
    setCidade(undefined);
    buscarCidadePorSlug(cidadeSlug)
      .then(({ cidade: c }) => setCidade(c))
      .catch(() => setCidade(null));
  }, [cidadeSlug]);

  useEffect(() => {
    if (!cidade) return;
    setCarregando(true);
    setErro('');
    listarPerfis({ ...filtroCidade(filters.city), category: filters.category })
      .then(({ perfis }) => setProfiles(perfis))
      .catch((err) => setErro(err instanceof ApiError ? err.message : 'Não foi possível carregar os perfis.'))
      .finally(() => setCarregando(false));
  }, [cidade, filters.city, filters.category]);

  if (cidade === undefined) {
    return <p className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center text-sm text-nevoa">Carregando...</p>;
  }

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
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-4">
        <h2 className="text-2xl font-display text-marfim">{textoDaCidade(cidade).titulo}</h2>
        {textoDaCidade(cidade).paragrafos.map((p) => (
          <p key={p} className="text-sm text-nevoa leading-relaxed">{p}</p>
        ))}
      </section>
    </>
  );
};
