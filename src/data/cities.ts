import type { City } from '../types';

/* Mapa fixo por enquanto - com back-end vira uma tabela `cities` (ja
   previsto no plano estrategico), mas o formato de URL nao muda. */
export const CIDADES: { slug: string; nome: Exclude<City, 'Todas'> }[] = [
  { slug: 'ilicinea', nome: 'Ilicínea' },
  { slug: 'boa-esperanca', nome: 'Boa Esperança' },
];

export function cidadePorSlug(slug: string | undefined): Exclude<City, 'Todas'> | undefined {
  return CIDADES.find((c) => c.slug === slug)?.nome;
}

export function slugDaCidade(nome: string): string {
  return CIDADES.find((c) => c.nome === nome)?.slug ?? nome.toLowerCase();
}
