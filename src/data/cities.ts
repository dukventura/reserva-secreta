/* Cidades vem da tabela `cities` (todos os municipios do Brasil, com
   UF). Aqui ficam so' os utilitarios de exibicao e o texto de SEO. */

export function rotuloCidade(c: { name: string; uf: string }): string {
  return `${c.name} - ${c.uf}`;
}

// Parametros da API de perfis para o filtro de cidade atual.
export function filtroCidade(c: 'Todas' | { name: string; uf: string }): { city?: string; uf?: string } {
  return c === 'Todas' ? {} : { city: c.name, uf: c.uf };
}

export function semAcento(texto: string): string {
  return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

/* Texto de apresentacao exibido abaixo dos perfis na pagina de cada
   cidade. Da ao Google conteudo proprio por cidade, em vez de so os
   cards (que mudam toda hora). */
const TEXTO_PROPRIO: Record<string, { titulo: string; paragrafos: string[] }> = {
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

// Ilicinea e Boa Esperanca tem texto escrito a mao; as demais cidades
// recebem um texto padrao com o nome e a UF.
export function textoDaCidade(c: { name: string; uf: string }): { titulo: string; paragrafos: string[] } {
  if (c.uf === 'MG' && TEXTO_PROPRIO[c.name]) return TEXTO_PROPRIO[c.name];
  return {
    titulo: `Acompanhantes em ${rotuloCidade(c)}`,
    paragrafos: [
      `O Reserva Secreta reúne acompanhantes de luxo em ${c.name} e região. Todos os anúncios passam por aprovação manual antes de serem publicados, e os perfis com selo de verificado tiveram documento e selfie conferidos pela nossa equipe.`,
      'Cada perfil traz fotos reais, características, serviços, locais de atendimento e valores, com contato direto pelo WhatsApp, sem intermediários.',
      'Discrição é prioridade: não pedimos cadastro para navegar e você pode favoritar perfis criando uma conta gratuita.',
    ],
  };
}
