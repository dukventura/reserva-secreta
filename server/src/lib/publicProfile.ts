import { db } from './db';

export const CAMPOS_PUBLICOS = [
  'professional_profiles.id', 'professional_profiles.slug', 'professional_profiles.stage_name',
  'professional_profiles.age', 'professional_profiles.city', 'professional_profiles.neighborhood',
  'professional_profiles.height', 'professional_profiles.weight', 'professional_profiles.eyes',
  'professional_profiles.hair', 'professional_profiles.languages', 'professional_profiles.silicone',
  'professional_profiles.tattoos', 'professional_profiles.services', 'professional_profiles.locations',
  'professional_profiles.category', 'professional_profiles.tagline', 'professional_profiles.bio',
  'professional_profiles.hourly_rate', 'professional_profiles.whatsapp', 'professional_profiles.is_vip',
  'professional_profiles.cover_image',
] as const;

// isVerified reflete o documento aprovado de verdade (tabela
// verifications), em vez de um campo redundante que poderia
// dessincronizar do status real de verificacao.
//
// thumbnail_url vem da galeria de verdade (media aprovada), nao de
// cover_image - esse campo nunca e' preenchido no fluxo real de
// cadastro (/anunciar so' grava em `media`), entao o card da home
// sempre aparecia "Sem foto" mesmo pra perfis com fotos aprovadas,
// enquanto a pagina de perfil (que le a galeria de verdade) mostrava
// normal. Mesma correcao ja aplicada em moderation.ts.
export function comVerificacao() {
  return db
    .selectFrom('professional_profiles')
    .leftJoin('verifications', 'verifications.user_id', 'professional_profiles.user_id')
    .select((eb) => [
      ...CAMPOS_PUBLICOS,
      'verifications.documento_status as documento_status',
      eb.selectFrom('media')
        .select('media.url')
        .whereRef('media.profile_id', '=', 'professional_profiles.id')
        .where('media.status', '=', 'aprovado')
        .orderBy('media.position', 'asc')
        .limit(1)
        .as('thumbnail_url'),
    ])
    .where('professional_profiles.status', '=', 'aprovado');
}

// mysql2 reconhece o tipo JSON pelo protocolo e ja devolve array/objeto
// desserializado - so cai em string quando o driver nao tem essa info
// (ex: outra lib, ou coluna criada como TEXT puro). Tratamos os dois
// casos para nao depender desse detalhe de driver. Array vazio (nao
// null) poupa checagem extra em todo lugar que itera a lista no front.
export function parseJsonArray(valor: unknown): string[] {
  if (Array.isArray(valor)) return valor;
  if (typeof valor === 'string' && valor) {
    try {
      const parsed = JSON.parse(valor);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

export function paraPerfilPublico(row: Awaited<ReturnType<ReturnType<typeof comVerificacao>['executeTakeFirst']>>) {
  if (!row) return null;
  const { id: _id, documento_status, languages, services, locations, ...resto } = row;
  return {
    ...resto,
    languages: parseJsonArray(languages),
    services: parseJsonArray(services),
    locations: parseJsonArray(locations),
    is_verified: documento_status === 'aprovado',
  };
}
