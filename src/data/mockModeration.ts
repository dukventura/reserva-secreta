import type { PendingProfile, Report, AuditLogEntry, TeamMember, PlanOption } from '../types';

/* Dados de demonstracao para os paineis de gerente e admin master.
   Sem back-end: as acoes de aprovar/reprovar mudam so o estado local
   da sessao, nao persistem. */

export const mockPendingProfiles: PendingProfile[] = [
  {
    id: 'p-larissa-costa',
    name: 'Larissa Costa',
    age: 24,
    city: 'Ilicínea',
    category: 'Mulheres',
    whatsapp: '5535988887777',
    submittedAt: '2026-09-05T14:20:00Z',
    status: 'pendente',
    coverImage: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=400&q=80',
    verificationStatus: { email: true, telefone: true, documento: 'pendente' },
  },
  {
    id: 'p-bianca-souza',
    name: 'Bianca Souza',
    age: 27,
    city: 'Boa Esperança',
    category: 'VIP',
    whatsapp: '5535988886666',
    submittedAt: '2026-09-04T09:10:00Z',
    status: 'pendente',
    coverImage: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80',
    verificationStatus: { email: true, telefone: false, documento: 'pendente' },
  },
  {
    id: 'p-thai-lima',
    name: 'Thai Lima',
    age: 23,
    city: 'Ilicínea',
    category: 'Trans',
    whatsapp: '5535988885555',
    submittedAt: '2026-09-03T18:45:00Z',
    status: 'aprovado',
    coverImage: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
    verificationStatus: { email: true, telefone: true, documento: 'aprovado' },
  },
];

export const mockReports: Report[] = [
  {
    id: 'r-001',
    targetName: 'Isabela Santos',
    targetId: 'isabela-santos',
    reason: 'Assédio no contato',
    details: 'Recebi mensagens insistentes fora do horário combinado, mesmo após pedir para parar.',
    reportedAt: '2026-09-05T11:30:00Z',
    status: 'pendente',
    anonymous: true,
  },
  {
    id: 'r-002',
    targetName: 'Camilla Thorne',
    targetId: 'camilla-thorne',
    reason: 'Perfil falso / golpe',
    details: 'Cobrou sinal antecipado por Pix e não confirmou o encontro depois.',
    reportedAt: '2026-09-04T20:05:00Z',
    status: 'pendente',
    anonymous: false,
  },
  {
    id: 'r-003',
    targetName: 'Sophia Lima',
    targetId: 'sophia-lima',
    reason: 'Outro',
    details: 'Fotos da galeria parecem antigas demais em relação ao perfil descrito.',
    reportedAt: '2026-09-02T08:15:00Z',
    status: 'reprovado',
    anonymous: true,
  },
];

export const mockAuditLog: AuditLogEntry[] = [
  { id: 'a-001', actor: 'Helena Braga', actorRole: 'gerente', action: 'Aprovou verificação de documento', target: 'Thai Lima', timestamp: '2026-09-05T15:02:00Z' },
  { id: 'a-002', actor: 'Helena Braga', actorRole: 'gerente', action: 'Marcou denúncia como reprovada', target: 'Sophia Lima (r-003)', timestamp: '2026-09-02T09:40:00Z' },
  { id: 'a-003', actor: 'Eduardo Ventura', actorRole: 'master', action: 'Criou conta de gerente', target: 'Helena Braga', timestamp: '2026-08-28T10:00:00Z' },
  { id: 'a-004', actor: 'Helena Braga', actorRole: 'gerente', action: 'Suspendeu anúncio por denúncia procedente', target: 'perfil removido #402', timestamp: '2026-08-20T13:22:00Z' },
];

export const mockTeam: TeamMember[] = [
  { id: 't-001', name: 'Eduardo Ventura', email: 'venturaedu.mkt@gmail.com', role: 'master', active: true },
  { id: 't-002', name: 'Helena Braga', email: 'helena@reservasecreta.com.br', role: 'gerente', active: true },
];

export const mockPlans: PlanOption[] = [
  {
    id: 'plano-base',
    name: 'Base',
    price: 'Grátis',
    period: '',
    features: ['Perfil com até 3 fotos', 'Sem selo de verificado', 'Aparece na busca por cidade'],
  },
  {
    id: 'plano-vip',
    name: 'VIP',
    price: 'R$ 89',
    period: '/mês',
    highlighted: true,
    features: ['Galeria completa (até 12 fotos)', 'Selo de verificado', 'Prioridade na listagem da cidade', 'Estatísticas de visualização'],
  },
  {
    id: 'plano-boost',
    name: 'Boost avulso',
    price: 'R$ 25',
    period: '/7 dias',
    features: ['Destaque no topo da home', 'Destaque no topo da categoria', 'Não substitui o plano VIP'],
  },
];
