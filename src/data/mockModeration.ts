import type { PlanOption } from '../types';

/* Planos de assinatura ainda sem rota no backend - cobranca e' manual
   via PIX nesta fase. Gestao de equipe (mockTeam) foi removida daqui
   quando GET/POST /api/auth/staff passou a existir de verdade. */

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
