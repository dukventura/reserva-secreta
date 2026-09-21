export type City = 'Todas' | 'Ilicínea' | 'Boa Esperança';
export type Category = 'Todas' | 'VIP' | 'Mulheres' | 'Trans';

export interface FilterState {
  city: City;
  category: Category;
  searchQuery: string;
  onlyVerified: boolean;
}

export type UserRole = 'master' | 'gerente' | 'profissional' | 'contratante';

export interface DemoSession {
  role: UserRole;
  name: string;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  active: boolean;
}

export interface PlanOption {
  id: string;
  name: string;
  price: string;
  period: string;
  features: string[];
  highlighted?: boolean;
}
