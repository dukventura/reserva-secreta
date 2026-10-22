import React, { createContext, useContext, useState, useCallback } from 'react';
import * as api from '../lib/api';

/* Estado de moderacao compartilhado entre as paginas de gerente/master.
   Nao busca nada no mount do provider (que envolve o app inteiro) -
   isso dispararia chamadas autenticadas para visitantes anonimos. Cada
   dashboard chama `refresh()` no proprio efeito, depois que RequireRole
   ja confirmou que ha uma sessao com papel adequado. */

interface ModerationContextValue {
  pendingProfiles: api.PendingModerationProfile[];
  activeProfiles: api.ActiveProfile[];
  reports: api.PendingReport[];
  pendingMedia: api.PendingMedia[];
  pendingDocuments: api.PendingDocument[];
  pendingSelfies: api.PendingSelfie[];
  auditLog: api.AuditLogEntry[];
  carregando: boolean;
  erro: string;
  refresh: () => Promise<void>;
  decideProfile: (id: number, status: 'aprovado' | 'reprovado') => Promise<void>;
  setProfileStatus: (id: number, status: 'aprovado' | 'suspenso') => Promise<void>;
  decideReport: (id: number, status: 'aprovado' | 'reprovado') => Promise<void>;
  decideMedia: (id: number, status: 'aprovado' | 'reprovado') => Promise<void>;
  decideDocument: (userId: number, status: 'aprovado' | 'reprovado') => Promise<void>;
  decideSelfie: (userId: number, status: 'aprovado' | 'reprovado') => Promise<void>;
}

const ModerationContext = createContext<ModerationContextValue | undefined>(undefined);

export const ModerationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [pendingProfiles, setPendingProfiles] = useState<api.PendingModerationProfile[]>([]);
  const [activeProfiles, setActiveProfiles] = useState<api.ActiveProfile[]>([]);
  const [reports, setReports] = useState<api.PendingReport[]>([]);
  const [pendingMedia, setPendingMedia] = useState<api.PendingMedia[]>([]);
  const [pendingDocuments, setPendingDocuments] = useState<api.PendingDocument[]>([]);
  const [pendingSelfies, setPendingSelfies] = useState<api.PendingSelfie[]>([]);
  const [auditLog, setAuditLog] = useState<api.AuditLogEntry[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');

  const refresh = useCallback(async () => {
    setCarregando(true);
    setErro('');
    try {
      const [perfis, ativos, denuncias, fotos, documentos, selfies, log] = await Promise.all([
        api.listarPerfisPendentes(),
        api.listarPerfisAtivos(),
        api.listarDenunciasPendentes(),
        api.listarFotosPendentes(),
        api.listarDocumentosPendentes(),
        api.listarSelfiesPendentes(),
        api.listarLogAuditoria(),
      ]);
      setPendingProfiles(perfis.perfis);
      setActiveProfiles(ativos.perfis);
      setReports(denuncias.denuncias);
      setPendingMedia(fotos.fotos);
      setPendingDocuments(documentos.documentos);
      setPendingSelfies(selfies.selfies);
      setAuditLog(log.registros);
    } catch (err) {
      setErro(err instanceof api.ApiError ? err.message : 'Não foi possível carregar os dados de moderação.');
    } finally {
      setCarregando(false);
    }
  }, []);

  // O botao de decidir (aprovar/reprovar/suspender) as vezes falha por
  // regra do servidor (ex: perfil sem documento/selfie aprovados ainda)
  // - sem isso, a chamada rejeitava sem nenhum feedback visivel, dando
  // a impressao de botao travado/sem efeito.
  const comErroVisivel = useCallback(async (acao: () => Promise<unknown>) => {
    setErro('');
    try {
      await acao();
    } catch (err) {
      setErro(err instanceof api.ApiError ? err.message : 'Não foi possível concluir a ação.');
    }
  }, []);

  const decideProfile = useCallback(async (id: number, status: 'aprovado' | 'reprovado') => {
    await comErroVisivel(async () => {
      await api.decidirPerfil(id, status);
      setPendingProfiles((prev) => prev.filter((p) => p.id !== id));
      await refresh();
    });
  }, [refresh, comErroVisivel]);

  const setProfileStatus = useCallback(async (id: number, status: 'aprovado' | 'suspenso') => {
    await comErroVisivel(async () => {
      await api.alterarStatusPerfil(id, status);
      await refresh();
    });
  }, [refresh, comErroVisivel]);

  const decideReport = useCallback(async (id: number, status: 'aprovado' | 'reprovado') => {
    await comErroVisivel(async () => {
      await api.decidirDenuncia(id, status);
      setReports((prev) => prev.filter((r) => r.id !== id));
      await refresh();
    });
  }, [refresh, comErroVisivel]);

  const decideMedia = useCallback(async (id: number, status: 'aprovado' | 'reprovado') => {
    await comErroVisivel(async () => {
      await api.decidirFoto(id, status);
      setPendingMedia((prev) => prev.filter((m) => m.id !== id));
      await refresh();
    });
  }, [refresh, comErroVisivel]);

  const decideDocument = useCallback(async (userId: number, status: 'aprovado' | 'reprovado') => {
    await comErroVisivel(async () => {
      await api.decidirDocumento(userId, status);
      setPendingDocuments((prev) => prev.filter((d) => d.user_id !== userId));
      await refresh();
    });
  }, [refresh, comErroVisivel]);

  const decideSelfie = useCallback(async (userId: number, status: 'aprovado' | 'reprovado') => {
    await comErroVisivel(async () => {
      await api.decidirSelfie(userId, status);
      setPendingSelfies((prev) => prev.filter((s) => s.user_id !== userId));
      await refresh();
    });
  }, [refresh, comErroVisivel]);

  return (
    <ModerationContext.Provider value={{ pendingProfiles, activeProfiles, reports, pendingMedia, pendingDocuments, pendingSelfies, auditLog, carregando, erro, refresh, decideProfile, setProfileStatus, decideReport, decideMedia, decideDocument, decideSelfie }}>
      {children}
    </ModerationContext.Provider>
  );
};

export function useModeration(): ModerationContextValue {
  const ctx = useContext(ModerationContext);
  if (!ctx) throw new Error('useModeration precisa estar dentro de ModerationProvider');
  return ctx;
}
