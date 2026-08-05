import type { EscortProfile } from '../types';

export const mockProfiles: EscortProfile[] = [
  {
    id: 'valentina-rossi',
    name: 'Valentina Rossi',
    age: 22,
    city: 'Ilicínea',
    neighborhood: 'Centro VIP',
    category: 'VIP',
    isVip: true,
    isVerified: true,
    isOnline: true,
    hourlyRate: 'R$ 350 / h',
    coverImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80'
    ],
    tagline: 'Carinhosa, elegante e muito discreta. Atendimento exclusivo com foco no seu prazer.',
    bio: 'Olá meu amor! Sou a Valentina, universitária de 22 anos, educada, simpática e apaixonada por momentos marcantes. Se você busca uma companhia de alto nível para jantares, viagens ou momentos íntimos inesquecíveis, estou pronta para te surpreender com total discrição.',
    specs: {
      height: '1.68m',
      weight: '56kg',
      eyes: 'Castanhos Mel',
      hair: 'Morena Iluminada',
      languages: ['Português', 'Inglês Intermediário'],
      silicone: 'Sim (350ml)',
      tattoos: 'Pequenas e delicadas'
    },
    services: [
      'Acompanhante para Eventos & Jantares',
      'Pernoite / Fim de Semana',
      'Massagem Relaxante Tântrica',
      'Beijo na Boca (GFE com carinho)',
      'Fetiches Suaves',
      'Viagens & Escapadas VIP'
    ],
    locations: ['Com Local Próprio Discreto', 'Hotéis / Motéis', 'A Domicílio'],
    whatsapp: '5535999887766',
    whatsappMessage: 'Olá Valentina, vi seu perfil no Guia Prime e gostaria de verificar sua disponibilidade!'
  },
  {
    id: 'isabela-santos',
    name: 'Isabela Santos',
    age: 24,
    city: 'Boa Esperança',
    neighborhood: 'Beira Lago',
    category: 'VIP',
    isVip: true,
    isVerified: true,
    isOnline: true,
    hourlyRate: 'R$ 400 / h',
    coverImage: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=800&q=80'
    ],
    tagline: 'Loira com corpo escultural e sorriso encantador. Experiência Namorada (GFE).',
    bio: 'Sou a Isabela, acompanhante de luxo em Boa Esperança. Tenho um estilo envolvente e carinhoso, perfeita para homens de bom gosto que apreciam conversas inteligentes e uma sensualidade natural sem pressa.',
    specs: {
      height: '1.72m',
      weight: '60kg',
      eyes: 'Verdes',
      hair: 'Loira Natural',
      languages: ['Português', 'Espanhol'],
      silicone: 'Sim (375ml)',
      tattoos: 'Nenhuma'
    },
    services: [
      'GFE (Girlfriend Experience)',
      'Jantares & Eventos Sociais',
      'Atendimento Executivo',
      'Pernoite',
      'Dupla com amiga (Sob consulta)'
    ],
    locations: ['Hotéis 5 Estrelas', 'Com Local Luxuoso', 'Resorts da Região'],
    whatsapp: '5535999776655',
    whatsappMessage: 'Olá Isabela! Encontrei seu perfil no Guia Prime e gostaria de saber mais sobre o atendimento.'
  },
  {
    id: 'sophia-lima',
    name: 'Sophia Lima',
    age: 21,
    city: 'Ilicínea',
    neighborhood: 'Centro',
    category: 'Mulheres',
    isVip: false,
    isVerified: true,
    isOnline: false,
    hourlyRate: 'R$ 250 / h',
    coverImage: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80'
    ],
    tagline: 'Novidade na cidade! Jovem, meiga e com energia contagiante.',
    bio: 'Olá querido! Sou a Sophia, 21 aninhos, recém-chegada a Ilicínea. Adoro proporcionar encontros descontraídos, sem frescura e com muita cumplicidade.',
    specs: {
      height: '1.62m',
      weight: '52kg',
      eyes: 'Castanhos',
      hair: 'Castanho Escuro',
      languages: ['Português'],
      silicone: 'Natural',
      tattoos: 'Uma pequena no pulso'
    },
    services: [
      'Atendimento Carinhoso',
      'Beijo na Boca',
      'Massagem Sensual',
      'Encontros Rápidos ou Rápida Duração'
    ],
    locations: ['Com Local Próprio Ar-condicionado', 'Motéis'],
    whatsapp: '553599665544',
    whatsappMessage: 'Oi Sophia! Vi seu anúncio no Guia Prime, está disponível hoje?'
  },
  {
    id: 'camilla-thorne',
    name: 'Camilla Thorne',
    age: 25,
    city: 'Boa Esperança',
    neighborhood: 'Nobre',
    category: 'Trans',
    isVip: true,
    isVerified: true,
    isOnline: true,
    hourlyRate: 'R$ 350 / h',
    coverImage: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=800&q=80'
    ],
    tagline: 'Mulher Trans de extrema classe, feminina e inesquecível.',
    bio: 'Prazer, Camilla! Sou uma mulher trans linda, extremamente feminina, simpática e atenciosa. Atendo homens discretos, casais e de bom gosto que procuram uma experiência refinada.',
    specs: {
      height: '1.75m',
      weight: '62kg',
      eyes: 'Castanhos Claros',
      hair: 'Longo Castanho',
      languages: ['Português', 'Inglês'],
      silicone: 'Sim (400ml)',
      tattoos: 'Algumas artísticas'
    },
    services: [
      'Ativo e Passivo (Atendimento Completo)',
      'GFE / Carinho Sem Pressa',
      'Jantares & Acompanhamento VIP',
      'Pernoites',
      'Fetiches & Fantasias'
    ],
    locations: ['Com Local Próprio Privativo', 'Hotéis & Motéis'],
    whatsapp: '5535999554433',
    whatsappMessage: 'Olá Camilla, vi seu anúncio no Guia Prime e fiquei encantado. Como funciona seu atendimento?'
  },
  {
    id: 'maya-alencar',
    name: 'Maya Alencar',
    age: 23,
    city: 'Ilicínea',
    neighborhood: 'Sul',
    category: 'Mulheres',
    isVip: false,
    isVerified: true,
    isOnline: true,
    hourlyRate: 'R$ 280 / h',
    coverImage: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=800&q=80'
    ],
    tagline: 'Morena sensual, olhar marcante e curvas perfeitas.',
    bio: 'Oi gato! Maya aqui. Sou brincalhona, envolvente e adoro momentos quentes com homens educados. Venha relaxar do estresse do dia a dia comigo.',
    specs: {
      height: '1.65m',
      weight: '57kg',
      eyes: 'Negros',
      hair: 'Morena',
      languages: ['Português'],
      silicone: 'Sim (300ml)',
      tattoos: 'Sim'
    },
    services: [
      'Massagem Erótica',
      'GFE (Carinhosa)',
      'Atendimento a Casais',
      'Preliminares Sem Pressa'
    ],
    locations: ['Com Local Próprio Discreto', 'A Domicílio / Hotéis'],
    whatsapp: '5535999443322',
    whatsappMessage: 'Oi Maya! Vi seu perfil no Guia Prime e gostaria de agendar um horário com você.'
  },
  {
    id: 'leticia-mendes',
    name: 'Letícia Mendes',
    age: 26,
    city: 'Boa Esperança',
    neighborhood: 'Centro Histórico',
    category: 'Mulheres',
    isVip: false,
    isVerified: true,
    isOnline: false,
    hourlyRate: 'R$ 300 / h',
    coverImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=800&q=80'
    ],
    tagline: 'Elegante, madura e com papo delicioso. Companhia perfeita.',
    bio: 'Sou a Letícia, 26 anos, mulher madura, elegante e super segura de si. Se você valoriza uma mulher elegante e envolvente para momentos especiais, me chame no WhatsApp!',
    specs: {
      height: '1.70m',
      weight: '59kg',
      eyes: 'Castanhos',
      hair: 'Castanho Claro',
      languages: ['Português', 'Inglês'],
      silicone: 'Sim (320ml)',
      tattoos: 'Delicadas'
    },
    services: [
      'Acompanhamento VIP em Eventos',
      'Jantares & Encontros Formais',
      'Massagem Relaxante',
      'Atendimento Executivo'
    ],
    locations: ['Hotéis & Motéis', 'Com Local Discreto'],
    whatsapp: '5535999332211',
    whatsappMessage: 'Olá Letícia! Encontrei seu contato no Guia Prime e gostaria de tirar algumas dúvidas sobre o seu atendimento.'
  }
];
