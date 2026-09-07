import { useState, useEffect } from 'react';
import type { City, FilterState } from '../types';

const FILTROS_PADRAO: FilterState = {
  city: 'Todas',
  category: 'Todas',
  searchQuery: '',
  onlyVerified: false,
};

/* Compartilhado entre a home e a pagina de cidade: a pagina de cidade
   e a mesma busca com a cidade pre-selecionada e travada pela URL, nao
   uma tela separada. */
export function useProfileFilters(cidadeFixa?: City) {
  const [filters, setFilters] = useState<FilterState>(() => ({
    ...FILTROS_PADRAO,
    ...(cidadeFixa ? { city: cidadeFixa } : {}),
  }));

  // Se a rota mudar de /cidade/ilicinea para /cidade/boa-esperanca sem
  // desmontar o componente, o filtro acompanha.
  useEffect(() => {
    if (cidadeFixa) setFilters((prev) => ({ ...prev, city: cidadeFixa }));
  }, [cidadeFixa]);

  const handleFilterChange = (updated: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...updated }));
  };

  const handleResetFilters = () => {
    setFilters({ ...FILTROS_PADRAO, ...(cidadeFixa ? { city: cidadeFixa } : {}) });
  };

  return { filters, handleFilterChange, handleResetFilters };
}
