import type { TeamMember, PlanOption } from '../types';

/* Dados de demonstracao ainda sem rota no backend: gestao de equipe
   (falta rota administrativa para o master criar gerentes) e planos
   (assinatura/cobranca ainda nao existe - pagamentos sao manuais). */

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
