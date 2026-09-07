import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Crown, ShieldCheck, MessageCircle, Eye } from 'lucide-react';
import type { EscortProfile } from '../types';

interface ProfileCardProps {
  profile: EscortProfile;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({ profile }) => {
  const whatsappUrl = `https://wa.me/${profile.whatsapp}?text=${encodeURIComponent(
    profile.whatsappMessage || `Olá ${profile.name}, vi seu perfil no Reserva Secreta (reservasecreta.com.br)!`
  )}`;

  return (
    <Link
      to={`/perfil/${profile.id}`}
      className="group relative bg-grafite rounded-none overflow-hidden border border-white/10 hover:border-ouro/50 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1.5 flex flex-col"
    >
      {/* Card Image Container */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-grafite">
        
        {/* Profile Image with subtle dark gradient overlay */}
        <img
          src={profile.coverImage}
          alt={profile.name}
          loading="lazy"
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
        />

        {/* Top Gradient Overlay */}
        <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-black/80 via-black/30 to-transparent pointer-events-none" />

        {/* Bottom Gradient Overlay */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-grafite via-grafite/60 to-transparent pointer-events-none" />

        {/* Top Left Badges: VIP / Verified */}
        <div className="absolute top-3 left-3 flex flex-col space-y-1.5 z-10">
          {profile.isVip && (
            <div className="flex items-center space-x-1 px-2.5 py-1 rounded-campo bg-ouro text-black font-extrabold text-[11px] uppercase tracking-wider">
              <Crown className="w-3.5 h-3.5" />
              <span>VIP</span>
            </div>
          )}
          {profile.isVerified && (
            <div className="flex items-center space-x-1 px-2.5 py-0.9 rounded-campo bg-verificado/90 text-marfim font-bold text-[10px] uppercase tracking-wider shadow-md backdrop-blur-md">
              <ShieldCheck className="w-3 h-3" />
              <span>Fotos Reais</span>
            </div>
          )}
        </div>

        {/* Top Right Badges: Online Indicator & Category */}
        <div className="absolute top-3 right-3 flex flex-col items-end space-y-1.5 z-10">
          {profile.isOnline && (
            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-campo bg-black/60 border border-verificado/40 text-verificado-texto text-[11px] font-semibold backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-verificado-texto animate-ping" />
              <span>Disponível</span>
            </div>
          )}
          <div className="px-2 py-0.5 rounded-campo bg-white/10 border border-white/20 text-marfim text-[10px] font-semibold backdrop-blur-md uppercase tracking-wider">
            {profile.category}
          </div>
        </div>

        {/* Floating Price Tag */}
        <div className="absolute bottom-3 right-3 z-10">
          <div className="px-3 py-1.5 rounded-campo bg-black/80 border border-ouro/30 text-champanhe font-extrabold text-xs shadow-lg backdrop-blur-md">
            {profile.hourlyRate}
          </div>
        </div>
      </div>

      {/* Card Content Footer */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3 bg-grafite">
        
        <div>
          {/* Header info: Name & Age */}
          <div className="flex items-baseline justify-between">
            <h3 className="text-lg sm:text-xl font-display font-normal text-marfim group-hover:text-ouro transition-colors flex items-center space-x-2">
              <span>{profile.name}</span>
              <span className="text-sm font-semibold text-nevoa">, {profile.age}</span>
            </h3>
          </div>

          {/* Location Badge */}
          <div className="mt-1 flex items-center space-x-1.5 text-xs text-ouro font-medium">
            <MapPin className="w-3.5 h-3.5 shrink-0 text-ouro" />
            <span>{profile.city} {profile.neighborhood ? `• ${profile.neighborhood}` : ''}</span>
          </div>

          {/* Tagline / Teaser */}
          <p className="mt-2 text-xs text-nevoa line-clamp-2 leading-relaxed">
            "{profile.tagline}"
          </p>
        </div>

        {/* Specs Highlights */}
        <div className="flex items-center justify-between text-[11px] text-nevoa pt-2 border-t border-white/10">
          <span>Alt: <strong className="text-marfim">{profile.specs.height}</strong></span>
          <span>Peso: <strong className="text-marfim">{profile.specs.weight}</strong></span>
          <span>Cabelo: <strong className="text-marfim">{profile.specs.hair}</strong></span>
        </div>

        {/* Action Buttons */}
        <div className="pt-1 grid grid-cols-5 gap-2">
          {/* View Profile details */}
          <span className="col-span-3 flex items-center justify-center space-x-1.5 py-2.5 rounded-campo bg-white/5 group-hover:bg-white/10 border border-white/15 text-marfim font-bold text-xs transition-colors">
            <Eye className="w-4 h-4 text-ouro" />
            <span>Ver Perfil</span>
          </span>

          {/* Direct WhatsApp button */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="col-span-2 flex items-center justify-center space-x-1 py-2.5 rounded-campo bg-whatsapp hover:bg-whatsapp-hover text-marfim font-extrabold text-xs shadow-md transition-colors"
          >
            <MessageCircle className="w-4 h-4 fill-white" />
            <span>Whats</span>
          </a>
        </div>

      </div>
    </Link>
  );
};
