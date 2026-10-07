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
  documento_enviado: boolean;
  selfie_status: 'pendente' | 'aprovado' | 'reprovado';
  selfie_enviada: boolean;
  subscription_status: 'ativo' | 'vencido' | 'cancelado' | null;
  subscription_vence_em: string | null;
  plano_nome: string | null;
  max_fotos: number;
  boost_ate: string | null;
  pedido_plano_pendente: { id: number; plano_nome: string; created_at: string } | null;
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
  thumbnail_url: string | null;
  submitted_at: string | null;
  approved_photos: number;
}

export interface ActiveProfile {
  id: number;
  slug: string;
  stage_name: string;
  age: number;
  city: string;
  category: 'VIP' | 'Mulheres' | 'Trans';
  whatsapp: string;
  status: 'aprovado' | 'suspenso';
  thumbnail_url: string | null;
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
  user_id: number;
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

export interface StaffMember {
  id: number;
  name: string;
  email: string;
  role: 'master' | 'gerente';
  created_at: string;
}

export function listarEquipe() {
  return request<{ equipe: StaffMember[] }>('/api/auth/staff', { auth: true });
}

export function criarMembroEquipe(dados: { name: string; email: string; password: string; role: 'gerente' | 'master' }) {
  return request<{ user: AuthUser }>('/api/auth/staff', { method: 'POST', body: dados, auth: true });
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

export function enviarDocumento(arquivo: File) {
  const form = new FormData();
  form.append('documento', arquivo);
  return request<{ ok: true }>('/api/profiles/me/document', { method: 'POST', body: form, auth: true });
}

export function enviarSelfie(arquivo: File) {
  const form = new FormData();
  form.append('selfie', arquivo);
  return request<{ ok: true }>('/api/profiles/me/selfie', { method: 'POST', body: form, auth: true });
}

export function solicitarPlano(planId: number) {
  return request<{ ok: true; id: number }>('/api/profiles/me/plan-requests', { method: 'POST', body: { plan_id: planId }, auth: true });
}

export function cancelarPedidoPlano(id: number) {
  return request<{ ok: true }>(`/api/profiles/me/plan-requests/${id}/cancelar`, { method: 'POST', auth: true });
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

export function listarPerfisAtivos() {
  return request<{ perfis: ActiveProfile[] }>('/api/moderation/profiles/active', { auth: true });
}

export function alterarStatusPerfil(id: number, status: 'aprovado' | 'suspenso') {
  return request<{ ok: true }>(`/api/moderation/profiles/${id}/status`, {
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

export interface PendingDocument {
  user_id: number;
  updated_at: string;
  user_name: string;
  profile_slug: string | null;
  profile_name: string | null;
}

export function listarDocumentosPendentes() {
  return request<{ documentos: PendingDocument[] }>('/api/moderation/documents/pending', { auth: true });
}

export function decidirDocumento(userId: number, status: 'aprovado' | 'reprovado') {
  return request<{ ok: true }>(`/api/moderation/documents/${userId}/decide`, {
    method: 'POST',
    body: { status },
    auth: true,
  });
}

// O arquivo do documento nunca tem URL publica - precisa do token de
// autenticacao no header, entao vira um blob local em vez de um <img
// src> direto.
export async function buscarArquivoDocumento(userId: number): Promise<string> {
  const token = getToken();
  const response = await fetch(`${API_URL}/api/moderation/documents/${userId}/file`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!response.ok) throw new ApiError(response.status, 'Não foi possível carregar o documento.');
  const blob = await response.blob();
  return URL.createObjectURL(blob);
}

export interface PendingSelfie {
  user_id: number;
  updated_at: string;
  user_name: string;
  profile_slug: string | null;
  profile_name: string | null;
}

export function listarSelfiesPendentes() {
  return request<{ selfies: PendingSelfie[] }>('/api/moderation/selfies/pending', { auth: true });
}

export function decidirSelfie(userId: number, status: 'aprovado' | 'reprovado') {
  return request<{ ok: true }>(`/api/moderation/selfies/${userId}/decide`, {
    method: 'POST',
    body: { status },
    auth: true,
  });
}

export async function buscarArquivoSelfie(userId: number): Promise<string> {
  const token = getToken();
  const response = await fetch(`${API_URL}/api/moderation/selfies/${userId}/file`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!response.ok) throw new ApiError(response.status, 'Não foi possível carregar a selfie.');
  const blob = await response.blob();
  return URL.createObjectURL(blob);
}

export function listarLogAuditoria() {
  return request<{ registros: AuditLogEntry[] }>('/api/moderation/audit-log', { auth: true });
}

export interface Plan {
  id: number;
  nome: string;
  preco_centavos: number;
  duracao_dias: number;
  max_fotos: number;
  prioridade: number;
  selo_vip: number;
  ativo?: number;
}

export type PlanInput = {
  nome: string;
  preco_centavos: number;
  duracao_dias: number;
  max_fotos: number;
  prioridade: number;
  selo_vip: boolean;
};

export interface SubscriptionRow {
  user_id: number;
  stage_name: string;
  is_vip: number;
  boost_ate: string | null;
  perfil_status: 'rascunho' | 'pendente' | 'aprovado' | 'reprovado' | 'suspenso';
  email: string;
  status: 'ativo' | 'vencido' | 'cancelado' | null;
  vence_em: string | null;
  ultimo_pagamento_em: string | null;
  plan_id: number | null;
  plano_nome: string | null;
}

export interface ClienteRow {
  id: number;
  name: string;
  email: string;
  created_at: string;
}

export interface PaymentRow {
  id: number;
  user_id: number;
  tipo: 'plano' | 'impulso';
  valor_centavos: number;
  dias: number;
  observacao: string | null;
  created_at: string;
  stage_name: string | null;
  email: string;
  plano_nome: string | null;
  registrado_por_nome: string | null;
}

export interface FinanceSummary {
  receita_mes_centavos: number;
  assinantes_ativos: number;
  vencendo_7_dias: number;
  impulsos_ativos: number;
  pedidos_pendentes: number;
}

export function listarPlanosPublicos() {
  return request<{ planos: Plan[] }>('/api/plans');
}

export function listarPlanos() {
  return request<{ planos: Plan[] }>('/api/finance/plans', { auth: true });
}

export function criarPlano(dados: PlanInput) {
  return request<{ ok: true }>('/api/finance/plans', { method: 'POST', body: dados, auth: true });
}

export function editarPlano(id: number, dados: Partial<PlanInput> & { ativo?: boolean }) {
  return request<{ ok: true }>(`/api/finance/plans/${id}`, { method: 'PATCH', body: dados, auth: true });
}

export function listarAssinaturas() {
  return request<{ assinaturas: SubscriptionRow[] }>('/api/finance/subscriptions', { auth: true });
}

export function listarClientes() {
  return request<{ clientes: ClienteRow[] }>('/api/finance/clientes', { auth: true });
}

export function ativarPlano(userId: number, dados: { plan_id: number; dias?: number; valor_centavos?: number; observacao?: string }) {
  return request<{ ok: true; vence_em: string; renovacao: boolean }>(`/api/finance/subscriptions/${userId}/ativar`, {
    method: 'POST',
    body: dados,
    auth: true,
  });
}

export function cancelarAssinatura(userId: number) {
  return request<{ ok: true }>(`/api/finance/subscriptions/${userId}/cancelar`, { method: 'POST', auth: true });
}

// Exclusao definitiva - diferente de cancelar/suspender, apaga a
// conta pra sempre (login, perfil, fotos, documentos, historico).
export function excluirProfissional(userId: number) {
  return request<{ ok: true }>(`/api/finance/professionals/${userId}`, { method: 'DELETE', auth: true });
}

export function ativarImpulso(userId: number, dados: { dias: number; valor_centavos: number; observacao?: string }) {
  return request<{ ok: true; boost_ate: string }>(`/api/finance/subscriptions/${userId}/impulso`, {
    method: 'POST',
    body: dados,
    auth: true,
  });
}

export function encerrarImpulso(userId: number) {
  return request<{ ok: true }>(`/api/finance/subscriptions/${userId}/impulso/cancelar`, { method: 'POST', auth: true });
}

export function listarPagamentos(userId?: number) {
  return request<{ pagamentos: PaymentRow[] }>(`/api/finance/payments${userId ? `?userId=${userId}` : ''}`, { auth: true });
}

export function buscarResumoFinanceiro() {
  return request<FinanceSummary>('/api/finance/summary', { auth: true });
}

export interface PlanRequestRow {
  id: number;
  user_id: number;
  created_at: string;
  stage_name: string;
  plan_id: number;
  plano_nome: string;
  preco_centavos: number;
}

export function listarPedidosPlano() {
  return request<{ pedidos: PlanRequestRow[] }>('/api/finance/plan-requests', { auth: true });
}

export function atenderPedidoPlano(id: number) {
  return request<{ ok: true; vence_em: string }>(`/api/finance/plan-requests/${id}/atender`, { method: 'POST', auth: true });
}

export function recusarPedidoPlano(id: number) {
  return request<{ ok: true }>(`/api/finance/plan-requests/${id}/recusar`, { method: 'POST', auth: true });
}

// ---- denuncias publicas ----

export function enviarDenuncia(dados: { targetSlug: string; reason: string; details: string }) {
  // auth:true so' anexa o token se existir sessao - a rota aceita sem
  // login tambem (denuncia anonima continua possivel), mas quando a
  // pessoa esta logada, a denuncia fica vinculada pra aparecer em
  // "Minhas Denuncias" no painel do cliente.
  return request<{ ok: true }>('/api/reports', { method: 'POST', body: dados, auth: true });
}

// ---- conta do cliente (contratante) ----

export interface ClientReport {
  id: number;
  reason: string;
  status: 'pendente' | 'aprovado' | 'reprovado';
  created_at: string;
  target_name: string;
  target_slug: string;
}

export function atualizarMinhaConta(dados: { name?: string; senha_atual?: string; nova_senha?: string }) {
  return request<{ ok: true }>('/api/client/me', { method: 'PATCH', body: dados, auth: true });
}

export function listarFavoritos() {
  return request<{ favoritos: PublicProfile[] }>('/api/client/favorites', { auth: true });
}

export function favoritarPerfil(slug: string) {
  return request<{ ok: true }>(`/api/client/favorites/${slug}`, { method: 'POST', auth: true });
}

export function desfavoritarPerfil(slug: string) {
  return request<{ ok: true }>(`/api/client/favorites/${slug}`, { method: 'DELETE', auth: true });
}

export function listarMinhasDenuncias() {
  return request<{ denuncias: ClientReport[] }>('/api/client/reports', { auth: true });
}
