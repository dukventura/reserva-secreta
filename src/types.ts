export type City = 'Todas' | 'Ilicínea' | 'Boa Esperança';
export type Category = 'Todas' | 'VIP' | 'Mulheres' | 'Trans';

export interface ProfileSpecs {
  height: string; // Ex: "1.68m"
  weight: string; // Ex: "58kg"
  eyes: string; // Ex: "Castanhos"
  hair: string; // Ex: "Morena iluminada"
  languages: string[]; // Ex: ["Português", "Inglês"]
  silicone: string; // Ex: "Sim (350ml)"
  tattoos: string; // Ex: "Delicadas"
}

export interface EscortProfile {
  id: string;
  name: string;
  age: number;
  city: 'Ilicínea' | 'Boa Esperança';
  neighborhood?: string;
  category: 'VIP' | 'Mulheres' | 'Trans';
  isVip: boolean;
  isVerified: boolean;
  isOnline?: boolean;
  hourlyRate: string; // Ex: "R$ 300 /h"
  coverImage: string;
  gallery: string[];
  tagline: string;
  bio: string;
  specs: ProfileSpecs;
  services: string[];
  locations: string[]; // Ex: ["Com local próprio", "Hotéis/Motéis", "Viagens"]
  whatsapp: string; // Ex: "5535999999999"
  whatsappMessage?: string;
}

export interface FilterState {
  city: City;
  category: Category;
  searchQuery: string;
  onlyVerified: boolean;
}
