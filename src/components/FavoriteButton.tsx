import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { useSession } from '../context/SessionContext';
import { useFavorites } from '../context/FavoritesContext';

interface FavoriteButtonProps {
  slug: string;
  className?: string;
}

export const FavoriteButton: React.FC<FavoriteButtonProps> = ({ slug, className = '' }) => {
  const navigate = useNavigate();
  const { session } = useSession();
  const { slugsFavoritados, alternarFavorito } = useFavorites();
  const favoritado = slugsFavoritados.has(slug);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (session?.role !== 'contratante') {
      navigate('/entrar');
      return;
    }
    alternarFavorito(slug);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      title={favoritado ? 'Remover dos favoritos' : 'Salvar nos favoritos'}
      aria-label={favoritado ? 'Remover dos favoritos' : 'Salvar nos favoritos'}
      className={`flex items-center justify-center w-8 h-8 rounded-full bg-black/60 backdrop-blur-md border border-white/20 hover:border-ouro transition-colors ${className}`}
    >
      <Heart className={`w-4 h-4 transition-colors ${favoritado ? 'fill-ouro text-ouro' : 'text-white'}`} />
    </button>
  );
};
