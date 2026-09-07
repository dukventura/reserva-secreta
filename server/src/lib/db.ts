import { Kysely, MysqlDialect, Generated } from 'kysely';
import { createPool } from 'mysql2';

/* mysql2 + Kysely em vez de um ORM com binario nativo (Prisma etc.):
   o alvo e' Node.js Selector em hospedagem compartilhada, ambiente cuja
   versao exata de glibc/SO nao controlamos - um binario que nao bate
   certinho falha em producao sem aviso claro em dev. Kysely e' so
   TypeScript, sem esse risco. */

export type UserRole = 'master' | 'gerente' | 'profissional' | 'contratante';
export type ModerationStatus = 'pendente' | 'aprovado' | 'reprovado';
export type ProfileStatus = 'rascunho' | 'pendente' | 'aprovado' | 'reprovado' | 'suspenso';
export type Category = 'VIP' | 'Mulheres' | 'Trans';

interface UsersTable {
  id: Generated<number>;
  role: UserRole;
  name: string;
  email: string;
  password_hash: string;
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
}

interface ProfessionalProfilesTable {
  id: Generated<number>;
  user_id: number;
  slug: string;
  stage_name: string;
  age: number;
  city: string;
  neighborhood: string | null;
  category: Category;
  tagline: string | null;
  bio: string | null;
  hourly_rate: string | null;
  whatsapp: string;
  status: Generated<ProfileStatus>;
  is_vip: Generated<number>; // MySQL BOOLEAN = TINYINT(1)
  cover_image: string | null;
  submitted_at: Date | null;
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
}

interface MediaTable {
  id: Generated<number>;
  profile_id: number;
  url: string;
  position: Generated<number>;
  status: Generated<ModerationStatus>;
  created_at: Generated<Date>;
}

interface VerificationsTable {
  id: Generated<number>;
  user_id: number;
  email_confirmado: Generated<number>;
  telefone_confirmado: Generated<number>;
  documento_status: Generated<ModerationStatus>;
  documento_url: string | null;
  revisado_por: number | null;
  revisado_em: Date | null;
  updated_at: Generated<Date>;
}

interface ReportsTable {
  id: Generated<number>;
  target_profile_id: number;
  reporter_user_id: number | null;
  reason: string;
  details: string;
  status: Generated<ModerationStatus>;
  decided_by: number | null;
  decided_at: Date | null;
  created_at: Generated<Date>;
}

interface AuditLogTable {
  id: Generated<number>;
  actor_user_id: number | null;
  action: string;
  target: string;
  created_at: Generated<Date>;
}

export interface Database {
  users: UsersTable;
  professional_profiles: ProfessionalProfilesTable;
  media: MediaTable;
  verifications: VerificationsTable;
  reports: ReportsTable;
  audit_log: AuditLogTable;
}

const pool = createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT ?? 3306),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  // Hospedagem compartilhada costuma ter teto baixo de conexoes
  // simultaneas por banco - manter o pool pequeno evita estourar isso
  // sob carga e derrubar outros processos da mesma conta.
  connectionLimit: 5,
  charset: 'utf8mb4_general_ci',
});

export const db = new Kysely<Database>({
  dialect: new MysqlDialect({ pool }),
});
