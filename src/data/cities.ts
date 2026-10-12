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

/* Texto de apresentacao exibido abaixo dos perfis na pagina de cada
   cidade. Da ao Google conteudo proprio por cidade, em vez de so os
   cards (que mudam toda hora). */
export const TEXTO_CIDADE: Record<Exclude<City, 'Todas'>, { titulo: string; paragrafos: string[] }> = {
  'Ilicínea': {
    titulo: 'Acompanhantes em Ilicínea - MG',
    paragrafos: [
      'O Reserva Secreta reúne acompanhantes de luxo em Ilicínea e arredores, no Sul de Minas. Todos os anúncios passam por aprovação manual antes de serem publicados, e os perfis com selo de verificado tiveram documento e selfie conferidos pela nossa equipe.',
      'Cada perfil traz fotos reais, características, serviços, locais de atendimento e valores, com contato direto pelo WhatsApp, sem intermediários. Atendemos também quem está de passagem pela região do Lago de Furnas e pelas cidades vizinhas, como Boa Esperança.',
      'Discrição é prioridade: não pedimos cadastro para navegar e você pode favoritar perfis criando uma conta gratuita.',
    ],
  },
  'Boa Esperança': {
    titulo: 'Acompanhantes em Boa Esperança - MG',
    paragrafos: [
      'Procurando acompanhantes em Boa Esperança? O Reserva Secreta é o guia exclusivo e discreto do Sul de Minas, com perfis aprovados um a um pela nossa equipe antes de entrar no ar. O selo de verificado indica que o documento e a selfie da profissional foram conferidos.',
      'Em cada anúncio você encontra fotos reais, descrição, serviços, locais de atendimento e valores, além do contato direto pelo WhatsApp. O catálogo cobre Boa Esperança, a região do Lago de Furnas e cidades vizinhas, como Ilicínea.',
      'Navegação sigilosa, sem necessidade de cadastro. Se preferir, crie uma conta gratuita para salvar seus perfis favoritos.',
    ],
  },
};
