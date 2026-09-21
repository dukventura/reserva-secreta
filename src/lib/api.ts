/* Cliente HTTP central para a API do Reserva Secreta (server/).
   Ponto unico que sabe a URL base e injeta o token de sessao - o
   resto do app so chama estas funcoes, nunca `fetch` direto. */

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';
const TOKEN_KEY = 'reservasecreta_token';

export function getToken(): string | null {
  try {
    return sessionStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string): void {
  try {
    sessionStorage.setItem(TOKEN_KEY, token);
  } catch {
    // sessionStorage indisponivel (modo privado etc.) - sessao vira so em memoria
  }
}

export function clearToken(): void {
  try {
    sessionStorage.removeItem(TOKEN_KEY);
  } catch {
    // ignora
  }
}

export class ApiError extends Error {
  status: number;
  detalhes?: unknown;

  constructor(status: number, message: string, detalhes?: unknown) {
    super(message);
    this.status = status;
    this.detalhes = detalhes;
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
  auth?: boolean; // inclui o header Authorization se houver token
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = {};
  // FormData (upload de arquivo) define o proprio Content-Type com o
  // boundary do multipart - se a gente fixar 'application/json' aqui,
  // o body vira texto ilegivel pro multer do lado do servidor.
  const isFormData = options.body instanceof FormData;
  if (options.body !== undefined && !isFormData) headers['Content-Type'] = 'application/json';

  if (options.auth) {
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${path}`, {
    method: options.method ?? 'GET',
    headers,
    body: isFormData ? (options.body as FormData) : options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const mensagem = (data && typeof data === 'object' && 'erro' in data && typeof data.erro === 'string')
      ? data.erro
      : `Erro ${response.status} ao chamar ${path}.`;
    throw new ApiError(response.status, mensagem, data?.detalhes);
  }

  return data as T;
}

// ---- Tipos que espelham o formato devolvido pela API ----

export type UserRole = 'master' | 'gerente' | 'profissional' | 'contratante';

export interface AuthUser {
  id: number;
  role: UserRole;
  name: string;
  email?: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export interface CityOption {
  slug: string;
  name: string;
}

export interface PublicProfile {
  slug: string;
  stage_name: string;
  age: number;
  city: string;
  neighborhood: string | null;
  height: string | null;
  weight: string | null;
  eyes: string | null;
  hair: string | null;
  languages: string[];
  silicone: string | null;
  tattoos: string | null;
  services: string[];
  locations: string[];
  category: 'VIP' | 'Mulheres' | 'Trans';
  tagline: string | null;
  bio: string | null;
  hourly_rate: string | null;
  whatsapp: string;
  is_vip: number;
  cover_image: string | null;
  is_verified: boolean;
}

export interface PublicProfileDetail extends PublicProfile {
  gallery: string[];
}

export interface MyProfile {
  id: number;
  user_id: number;
  slug: string;
  stage_name: string;
  age: number;
  city: string;
  neighborhood: string | null;
  height: string | null;
  weight: string | null;
  eyes: string | null;
  hair: string | null;
  languages: string[];
  silicone: string | null;
  tattoos: string | null;
  services: string[];
  locations: string[];
  category: 'VIP' | 'Mulheres' | 'Trans';
  tagline: string | null;
  bio: string | null;
  hourly_rate: string | null;
  whatsapp: string;
  status: 'rascunho' | 'pendente' | 'aprovado' | 'reprovado' | 'suspenso';
  is_vip: number;
  cover_image: string | null;
  submitted_at: string | null;
  email_confirmado: number;
  telefone_confirmado: number;
  documento_status: 'pendente' | 'aprovado' | 'reprovado';
  gallery: { id: number; url: string; status: 'pendente' | 'aprovado' | 'reprovado' }[];
}

export interface PendingModerationProfile {
  id: number;
  slug: string;
  stage_name: string;
  age: number;
  city: string;
  category: 'VIP' | 'Mulheres' | 'Trans';
  whatsapp: string;
  cover_image: string | null;
  submitted_at: string | null;
}

export interface PendingReport {
  id: number;
  reason: string;
  details: string;
  status: 'pendente' | 'aprovado' | 'reprovado';
  created_at: string;
  reporter_user_id: number | null;
  target_name: string;
  target_slug: string;
}

export interface PendingMedia {
  id: number;
  url: string;
  created_at: string;
  profile_name: string;
  profile_slug: string;
}

export interface AuditLogEntry {
  id: number;
  action: string;
  target: string;
  created_at: string;
  actor_name: string | null;
  actor_role: UserRole | null;
}

// ---- auth ----

export function registrarContratante(dados: { name: string; email: string; password: string }) {
  return request<AuthResponse>('/api/auth/register', {
    method: 'POST',
    body: { role: 'contratante', ...dados },
  });
}

export function registrarProfissional(dados: {
  name: string;
  email: string;
  password: string;
  city: string;
  category: 'VIP' | 'Mulheres' | 'Trans';
  age: number;
  whatsapp: string;
}) {
  return request<AuthResponse>('/api/auth/register', {
    method: 'POST',
    body: { role: 'profissional', ...dados },
  });
}

export function login(email: string, password: string) {
  return request<AuthResponse>('/api/auth/login', {
    method: 'POST',
    body: { email, password },
  });
}

export function buscarMe() {
  return request<{ user: AuthUser }>('/api/auth/me', { auth: true });
}

// ---- cidades ----

export function listarCidades() {
  return request<{ cidades: CityOption[] }>('/api/cities');
}

// ---- perfis ----

export function listarPerfis(filtros: { city?: string; category?: string } = {}) {
  const params = new URLSearchParams();
  if (filtros.city) params.set('city', filtros.city);
  if (filtros.category) params.set('category', filtros.category);
  const query = params.toString();
  return request<{ perfis: PublicProfile[] }>(`/api/profiles${query ? `?${query}` : ''}`);
}

export function buscarPerfilPorSlug(slug: string) {
  return request<{ perfil: PublicProfileDetail }>(`/api/profiles/${slug}`);
}

export function buscarMeuPerfil() {
  return request<{ perfil: MyProfile }>('/api/profiles/me', { auth: true });
}

export interface AtualizacaoPerfil {
  tagline?: string;
  bio?: string;
  hourly_rate?: string;
  neighborhood?: string;
  height?: string;
  weight?: string;
  eyes?: string;
  hair?: string;
  silicone?: string;
  tattoos?: string;
  languages?: string[];
  services?: string[];
  locations?: string[];
}

export function atualizarMeuPerfil(dados: AtualizacaoPerfil) {
  return request<{ ok: true }>('/api/profiles/me', { method: 'PATCH', body: dados, auth: true });
}

export function enviarPerfilParaAprovacao() {
  return request<{ ok: true }>('/api/profiles/me/submit', { method: 'POST', auth: true });
}

export function enviarFoto(arquivo: File) {
  const form = new FormData();
  form.append('foto', arquivo);
  return request<{ foto: { id: number; url: string; status: 'pendente' } }>('/api/profiles/me/media', {
    method: 'POST',
    body: form,
    auth: true,
  });
}

export function removerFoto(id: number) {
  return request<{ ok: true }>(`/api/profiles/me/media/${id}`, { method: 'DELETE', auth: true });
}

// ---- moderacao ----

export function listarPerfisPendentes() {
  return request<{ perfis: PendingModerationProfile[] }>('/api/moderation/profiles/pending', { auth: true });
}

export function decidirPerfil(id: number, status: 'aprovado' | 'reprovado') {
  return request<{ ok: true }>(`/api/moderation/profiles/${id}/decide`, {
    method: 'POST',
    body: { status },
    auth: true,
  });
}

export function listarDenunciasPendentes() {
  return request<{ denuncias: PendingReport[] }>('/api/moderation/reports', { auth: true });
}

export function decidirDenuncia(id: number, status: 'aprovado' | 'reprovado') {
  return request<{ ok: true }>(`/api/moderation/reports/${id}/decide`, {
    method: 'POST',
    body: { status },
    auth: true,
  });
}

export function listarFotosPendentes() {
  return request<{ fotos: PendingMedia[] }>('/api/moderation/media/pending', { auth: true });
}

export function decidirFoto(id: number, status: 'aprovado' | 'reprovado') {
  return request<{ ok: true }>(`/api/moderation/media/${id}/decide`, {
    method: 'POST',
    body: { status },
    auth: true,
  });
}

export function listarLogAuditoria() {
  return request<{ registros: AuditLogEntry[] }>('/api/moderation/audit-log', { auth: true });
}

// ---- denuncias publicas ----

export function enviarDenuncia(dados: { targetSlug: string; reason: string; details: string }) {
  return request<{ ok: true }>('/api/reports', { method: 'POST', body: dados });
}
