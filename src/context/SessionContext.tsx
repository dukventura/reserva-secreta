import React, { createContext, useContext, useState, useCallback } from 'react';
import type { DemoSession, UserRole } from '../types';

/* Sessao de demonstracao. Nao ha back-end nem autenticacao real: isto
   existe para o cliente navegar pelos 4 niveis do plano estrategico
   (master, gerente, profissional, contratante) num unico deploy
   estatico. Quando o back-end entrar, isto e substituido por um
   provider que fala com a API real - a forma de consumo (useSession)
   nao muda para o resto do app. */

const STORAGE_KEY = 'reservasecreta_demo_session';

const DEMO_NAMES: Record<UserRole, string> = {
  master: 'Eduardo Ventura',
  gerente: 'Helena Braga',
  profissional: 'Valentina Rossi',
  contratante: 'Visitante',
};

interface SessionContextValue {
  session: DemoSession | null;
  entrarComo: (role: UserRole) => void;
  sair: () => void;
}

const SessionContext = createContext<SessionContextValue | undefined>(undefined);

export const SessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<DemoSession | null>(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as DemoSession) : null;
    } catch {
      return null;
    }
  });

  const entrarComo = useCallback((role: UserRole) => {
    const next: DemoSession = { role, name: DEMO_NAMES[role] };
    setSession(next);
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // sessionStorage indisponivel (modo privado etc.) - segue so em memoria
    }
  }, []);

  const sair = useCallback(() => {
    setSession(null);
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignora
    }
  }, []);

  return (
    <SessionContext.Provider value={{ session, entrarComo, sair }}>
      {children}
    </SessionContext.Provider>
  );
};

export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession precisa estar dentro de SessionProvider');
  return ctx;
}
