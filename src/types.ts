export type City = 'Todas' | 'Ilicínea' | 'Boa Esperança';
export type Category = 'Todas' | 'VIP' | 'Mulheres' | 'Trans';

export interface ProfileSpecs {
  height: string; // Ex: "1.68m"
  weight: string; // Ex: "58kg"
  eyes: string; // Ex: "Castanhos"
  hair: string; // Ex: "Morena iluminada"
  languages: string[]; // Ex: ["Português", "Inglês"]
  silicone: string; // Ex: "Sim (350ml)"
  tattoos: string; // Ex: "Delicadas"
}

export interface EscortProfile {
  id: string;
  name: string;
  age: number;
  city: 'Ilicínea' | 'Boa Esperança';
  neighborhood?: string;
  category: 'VIP' | 'Mulheres' | 'Trans';
  isVip: boolean;
  isVerified: boolean;
  isOnline?: boolean;
  hourlyRate: string; // Ex: "R$ 300 /h"
  coverImage: string;
  gallery: string[];
  tagline: string;
  bio: string;
  specs: ProfileSpecs;
  services: string[];
  locations: string[]; // Ex: ["Com local próprio", "Hotéis/Motéis", "Viagens"]
  whatsapp: string; // Ex: "5535999999999"
  whatsappMessage?: string;
}

export interface FilterState {
  city: City;
  category: Category;
  searchQuery: string;
  onlyVerified: boolean;
}

/* Sessao de demonstracao (sem back-end): permite navegar pelos 4
   niveis do plano estrategico sem um servidor de autenticacao real. */
export type UserRole = 'master' | 'gerente' | 'profissional' | 'contratante';

export interface DemoSession {
  role: UserRole;
  name: string;
}

export type ModerationStatus = 'pendente' | 'aprovado' | 'reprovado';

export interface PendingProfile {
  id: string;
  name: string;
  age: number;
  city: 'Ilicínea' | 'Boa Esperança';
  category: 'VIP' | 'Mulheres' | 'Trans';
  whatsapp: string;
  submittedAt: string; // ISO date
  status: ModerationStatus;
  coverImage: string;
  verificationStatus: {
    email: boolean;
    telefone: boolean;
    documento: ModerationStatus;
  };
}

export type ReportReason =
  | 'Conteúdo sem consentimento'
  | 'Perfil falso / golpe'
  | 'Menor de idade suspeita'
  | 'Assédio no contato'
  | 'Outro';

export interface Report {
  id: string;
  targetName: string;
  targetId: string;
  reason: ReportReason;
  details: string;
  reportedAt: string;
  status: ModerationStatus;
  anonymous: boolean;
}

export interface AuditLogEntry {
  id: string;
  actor: string;
  actorRole: UserRole;
  action: string;
  target: string;
  timestamp: string;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  active: boolean;
}

export interface PlanOption {
  id: string;
  name: string;
  price: string;
  period: string;
  features: string[];
  highlighted?: boolean;
}
