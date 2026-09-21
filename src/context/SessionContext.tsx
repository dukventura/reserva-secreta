import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { DemoSession } from '../types';
import * as api from '../lib/api';

interface SessionContextValue {
  session: DemoSession | null;
  carregando: boolean;
  entrar: (email: string, password: string) => Promise<DemoSession>;
  registrarContratante: (dados: { name: string; email: string; password: string }) => Promise<DemoSession>;
  registrarProfissional: (dados: {
    name: string;
    email: string;
    password: string;
    city: string;
    category: 'VIP' | 'Mulheres' | 'Trans';
    age: number;
    whatsapp: string;
  }) => Promise<DemoSession>;
  sair: () => void;
}

const SessionContext = createContext<SessionContextValue | undefined>(undefined);

function paraSessao(user: api.AuthUser): DemoSession {
  return { role: user.role, name: user.name };
}

export const SessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<DemoSession | null>(null);
  const [carregando, setCarregando] = useState(true);

  // Ao carregar o app, se ha um token salvo de uma sessao anterior,
  // confirma com a API que ele ainda e' valido antes de considerar o
  // usuario logado - um token expirado nao deve parecer uma sessao ativa.
  useEffect(() => {
    const token = api.getToken();
    if (!token) {
      setCarregando(false);
      return;
    }
    api
      .buscarMe()
      .then(({ user }) => setSession(paraSessao(user)))
      .catch(() => api.clearToken())
      .finally(() => setCarregando(false));
  }, []);

  const entrar = useCallback(async (email: string, password: string) => {
    const { token, user } = await api.login(email, password);
    api.setToken(token);
    const nova = paraSessao(user);
    setSession(nova);
    return nova;
  }, []);

  const registrarContratante = useCallback(async (dados: { name: string; email: string; password: string }) => {
    const { token, user } = await api.registrarContratante(dados);
    api.setToken(token);
    const nova = paraSessao(user);
    setSession(nova);
    return nova;
  }, []);

  const registrarProfissional = useCallback(
    async (dados: {
      name: string;
      email: string;
      password: string;
      city: string;
      category: 'VIP' | 'Mulheres' | 'Trans';
      age: number;
      whatsapp: string;
    }) => {
      const { token, user } = await api.registrarProfissional(dados);
      api.setToken(token);
      const nova = paraSessao(user);
      setSession(nova);
      return nova;
    },
    [],
  );

  const sair = useCallback(() => {
    api.clearToken();
    setSession(null);
  }, []);

  return (
    <SessionContext.Provider value={{ session, carregando, entrar, registrarContratante, registrarProfissional, sair }}>
      {children}
    </SessionContext.Provider>
  );
};

export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession precisa estar dentro de SessionProvider');
  return ctx;
}
