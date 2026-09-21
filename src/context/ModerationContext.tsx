import React, { createContext, useContext, useState, useCallback } from 'react';
import * as api from '../lib/api';

/* Estado de moderacao compartilhado entre as paginas de gerente/master.
   Nao busca nada no mount do provider (que envolve o app inteiro) -
   isso dispararia chamadas autenticadas para visitantes anonimos. Cada
   dashboard chama `refresh()` no proprio efeito, depois que RequireRole
   ja confirmou que ha uma sessao com papel adequado. */

interface ModerationContextValue {
  pendingProfiles: api.PendingModerationProfile[];
  reports: api.PendingReport[];
  auditLog: api.AuditLogEntry[];
  carregando: boolean;
  erro: string;
  refresh: () => Promise<void>;
  decideProfile: (id: number, status: 'aprovado' | 'reprovado') => Promise<void>;
  decideReport: (id: number, status: 'aprovado' | 'reprovado') => Promise<void>;
}

const ModerationContext = createContext<ModerationContextValue | undefined>(undefined);

export const ModerationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [pendingProfiles, setPendingProfiles] = useState<api.PendingModerationProfile[]>([]);
  const [reports, setReports] = useState<api.PendingReport[]>([]);
  const [auditLog, setAuditLog] = useState<api.AuditLogEntry[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');

  const refresh = useCallback(async () => {
    setCarregando(true);
    setErro('');
    try {
      const [perfis, denuncias, log] = await Promise.all([
        api.listarPerfisPendentes(),
        api.listarDenunciasPendentes(),
        api.listarLogAuditoria(),
      ]);
      setPendingProfiles(perfis.perfis);
      setReports(denuncias.denuncias);
      setAuditLog(log.registros);
    } catch (err) {
      setErro(err instanceof api.ApiError ? err.message : 'Não foi possível carregar os dados de moderação.');
    } finally {
      setCarregando(false);
    }
  }, []);

  const decideProfile = useCallback(async (id: number, status: 'aprovado' | 'reprovado') => {
    await api.decidirPerfil(id, status);
    setPendingProfiles((prev) => prev.filter((p) => p.id !== id));
    await refresh();
  }, [refresh]);

  const decideReport = useCallback(async (id: number, status: 'aprovado' | 'reprovado') => {
    await api.decidirDenuncia(id, status);
    setReports((prev) => prev.filter((r) => r.id !== id));
    await refresh();
  }, [refresh]);

  return (
    <ModerationContext.Provider value={{ pendingProfiles, reports, auditLog, carregando, erro, refresh, decideProfile, decideReport }}>
      {children}
    </ModerationContext.Provider>
  );
};

export function useModeration(): ModerationContextValue {
  const ctx = useContext(ModerationContext);
  if (!ctx) throw new Error('useModeration precisa estar dentro de ModerationProvider');
  return ctx;
}
