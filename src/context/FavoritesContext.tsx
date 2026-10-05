import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useSession } from './SessionContext';
import { listarFavoritos, favoritarPerfil, desfavoritarPerfil, ApiError } from '../lib/api';

interface FavoritesContextValue {
  slugsFavoritados: Set<string>;
  carregando: boolean;
  alternarFavorito: (slug: string) => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextValue | undefined>(undefined);

/* So' carrega a lista quando a sessao e' de contratante - pra
   qualquer outro papel (ou visitante anonimo) o Set fica vazio e
   alternarFavorito nao faz nada, ja que favoritar e' coisa de cliente. */
export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { session } = useSession();
  const [slugsFavoritados, setSlugsFavoritados] = useState<Set<string>>(new Set());
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    if (session?.role !== 'contratante') {
      setSlugsFavoritados(new Set());
      return;
    }
    setCarregando(true);
    listarFavoritos()
      .then(({ favoritos }) => setSlugsFavoritados(new Set(favoritos.map((f) => f.slug))))
      .catch(() => {})
      .finally(() => setCarregando(false));
  }, [session?.role]);

  const alternarFavorito = useCallback(async (slug: string) => {
    const jaFavoritado = slugsFavoritados.has(slug);
    // Otimista: a UI responde na hora, e desfaz se a chamada falhar -
    // favoritar e' uma acao de baixo risco, nao vale a pena travar o
    // clique esperando resposta do servidor.
    setSlugsFavoritados((prev) => {
      const novo = new Set(prev);
      if (jaFavoritado) novo.delete(slug); else novo.add(slug);
      return novo;
    });
    try {
      if (jaFavoritado) await desfavoritarPerfil(slug);
      else await favoritarPerfil(slug);
    } catch (err) {
      setSlugsFavoritados((prev) => {
        const novo = new Set(prev);
        if (jaFavoritado) novo.add(slug); else novo.delete(slug);
        return novo;
      });
      if (!(err instanceof ApiError)) throw err;
    }
  }, [slugsFavoritados]);

  return (
    <FavoritesContext.Provider value={{ slugsFavoritados, carregando, alternarFavorito }}>
      {children}
    </FavoritesContext.Provider>
  );
};

export function useFavorites(): FavoritesContextValue {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error('useFavorites precisa estar dentro de FavoritesProvider');
  return ctx;
}
