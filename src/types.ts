export type City = 'Todas' | 'Ilicínea' | 'Boa Esperança';
export type Category = 'Todas' | 'Mulheres' | 'Trans';

export interface FilterState {
  city: City;
  category: Category;
  searchQuery: string;
  onlyVerified: boolean;
}

export type UserRole = 'master' | 'gerente' | 'profissional' | 'contratante';

export interface DemoSession {
  id?: number;
  role: UserRole;
  name: string;
  email?: string;
}
