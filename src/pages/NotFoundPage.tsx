import React from 'react';
import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';

export const NotFoundPage: React.FC = () => (
  <div className="max-w-lg mx-auto px-4 py-24 text-center space-y-4">
    <Compass className="w-10 h-10 text-ouro mx-auto" />
    <h1 className="text-3xl font-display text-marfim">Página não encontrada</h1>
    <p className="text-sm text-nevoa">O endereço que você tentou acessar não existe ou foi movido.</p>
    <Link to="/" className="inline-block px-5 py-2.5 rounded-campo bg-ouro hover:bg-champanhe text-black font-bold text-sm transition-colors">
      Voltar para a home
    </Link>
  </div>
);
