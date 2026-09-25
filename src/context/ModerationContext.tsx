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
  pendingMedia: api.PendingMedia[];
  pendingDocuments: api.PendingDocument[];
  auditLog: api.AuditLogEntry[];
  carregando: boolean;
  erro: string;
  refresh: () => Promise<void>;
  decideProfile: (id: number, status: 'aprovado' | 'reprovado') => Promise<void>;
  decideReport: (id: number, status: 'aprovado' | 'reprovado') => Promise<void>;
  decideMedia: (id: number, status: 'aprovado' | 'reprovado') => Promise<void>;
  decideDocument: (userId: number, status: 'aprovado' | 'reprovado') => Promise<void>;
}

const ModerationContext = createContext<ModerationContextValue | undefined>(undefined);

export const ModerationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [pendingProfiles, setPendingProfiles] = useState<api.PendingModerationProfile[]>([]);
  const [reports, setReports] = useState<api.PendingReport[]>([]);
  const [pendingMedia, setPendingMedia] = useState<api.PendingMedia[]>([]);
  const [pendingDocuments, setPendingDocuments] = useState<api.PendingDocument[]>([]);
  const [auditLog, setAuditLog] = useState<api.AuditLogEntry[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');

  const refresh = useCallback(async () => {
    setCarregando(true);
    setErro('');
    try {
      const [perfis, denuncias, fotos, documentos, log] = await Promise.all([
        api.listarPerfisPendentes(),
        api.listarDenunciasPendentes(),
        api.listarFotosPendentes(),
        api.listarDocumentosPendentes(),
        api.listarLogAuditoria(),
      ]);
      setPendingProfiles(perfis.perfis);
      setReports(denuncias.denuncias);
      setPendingMedia(fotos.fotos);
      setPendingDocuments(documentos.documentos);
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

  const decideMedia = useCallback(async (id: number, status: 'aprovado' | 'reprovado') => {
    await api.decidirFoto(id, status);
    setPendingMedia((prev) => prev.filter((m) => m.id !== id));
    await refresh();
  }, [refresh]);

  const decideDocument = useCallback(async (userId: number, status: 'aprovado' | 'reprovado') => {
    await api.decidirDocumento(userId, status);
    setPendingDocuments((prev) => prev.filter((d) => d.user_id !== userId));
    await refresh();
  }, [refresh]);

  return (
    <ModerationContext.Provider value={{ pendingProfiles, reports, pendingMedia, pendingDocuments, auditLog, carregando, erro, refresh, decideProfile, decideReport, decideMedia, decideDocument }}>
      {children}
    </ModerationContext.Provider>
  );
};

export function useModeration(): ModerationContextValue {
  const ctx = useContext(ModerationContext);
  if (!ctx) throw new Error('useModeration precisa estar dentro de ModerationProvider');
  return ctx;
}
