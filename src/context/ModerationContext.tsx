import React, { createContext, useContext, useState, useCallback } from 'react';
import type { PendingProfile, Report, AuditLogEntry, ModerationStatus } from '../types';
import { mockPendingProfiles, mockReports, mockAuditLog } from '../data/mockModeration';

/* Estado de moderacao compartilhado entre as paginas, em memoria (sem
   back-end). Existe para o cadastro feito em /anunciar aparecer de
   verdade na fila do gerente durante a demonstracao - sem isto cada
   pagina teria seus proprios dados mock, isolados uma da outra. */

interface ModerationContextValue {
  pendingProfiles: PendingProfile[];
  reports: Report[];
  auditLog: AuditLogEntry[];
  submitProfile: (data: Omit<PendingProfile, 'id' | 'submittedAt' | 'status' | 'verificationStatus'>) => void;
  decideProfile: (id: string, status: ModerationStatus, actor: string) => void;
  decideReport: (id: string, status: ModerationStatus, actor: string) => void;
}

const ModerationContext = createContext<ModerationContextValue | undefined>(undefined);

export const ModerationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [pendingProfiles, setPendingProfiles] = useState<PendingProfile[]>(mockPendingProfiles);
  const [reports, setReports] = useState<Report[]>(mockReports);
  const [auditLog, setAuditLog] = useState<AuditLogEntry[]>(mockAuditLog);

  const logAction = useCallback((actor: string, action: string, target: string) => {
    setAuditLog((prev) => [
      { id: `a-${Date.now()}`, actor, actorRole: 'gerente', action, target, timestamp: new Date().toISOString() },
      ...prev,
    ]);
  }, []);

  const submitProfile: ModerationContextValue['submitProfile'] = useCallback((data) => {
    const novo: PendingProfile = {
      ...data,
      id: `p-${Date.now()}`,
      submittedAt: new Date().toISOString(),
      status: 'pendente',
      verificationStatus: { email: false, telefone: true, documento: 'pendente' },
    };
    setPendingProfiles((prev) => [novo, ...prev]);
  }, []);

  const decideProfile = useCallback((id: string, status: ModerationStatus, actor: string) => {
    setPendingProfiles((prev) => prev.map((p) => (p.id === id ? { ...p, status } : p)));
    const alvo = pendingProfiles.find((p) => p.id === id);
    logAction(actor, status === 'aprovado' ? 'Aprovou anúncio' : 'Reprovou anúncio', alvo?.name || id);
  }, [pendingProfiles, logAction]);

  const decideReport = useCallback((id: string, status: ModerationStatus, actor: string) => {
    setReports((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    const alvo = reports.find((r) => r.id === id);
    logAction(actor, status === 'aprovado' ? 'Procedeu denúncia' : 'Arquivou denúncia', alvo?.targetName || id);
  }, [reports, logAction]);

  return (
    <ModerationContext.Provider value={{ pendingProfiles, reports, auditLog, submitProfile, decideProfile, decideReport }}>
      {children}
    </ModerationContext.Provider>
  );
};

export function useModeration(): ModerationContextValue {
  const ctx = useContext(ModerationContext);
  if (!ctx) throw new Error('useModeration precisa estar dentro de ModerationProvider');
  return ctx;
}
