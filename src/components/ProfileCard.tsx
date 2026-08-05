import React from 'react';
import { MapPin, Crown, ShieldCheck, MessageCircle, Eye } from 'lucide-react';
import type { EscortProfile } from '../types';

interface ProfileCardProps {
  profile: EscortProfile;
  onSelect: (profile: EscortProfile) => void;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({ profile, onSelect }) => {
  const whatsappUrl = `https://wa.me/${profile.whatsapp}?text=${encodeURIComponent(
    profile.whatsappMessage || `Olá ${profile.name}, vi seu perfil no Guia Prime!`
  )}`;

  return (
    <div
      onClick={() => onSelect(profile)}
      className="group relative bg-[#14141a] rounded-2xl overflow-hidden border border-white/10 hover:border-amber-500/50 shadow-xl hover:shadow-2xl hover:shadow-amber-500/10 transition-all duration-300 transform hover:-translate-y-1.5 flex flex-col cursor-pointer"
    >
      {/* Card Image Container */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#1c1c24]">
        
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
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#14141a] via-[#14141a]/60 to-transparent pointer-events-none" />

        {/* Top Left Badges: VIP / Verified */}
        <div className="absolute top-3 left-3 flex flex-col space-y-1.5 z-10">
          {profile.isVip && (
            <div className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-amber-500 text-black font-extrabold text-[11px] uppercase tracking-wider shadow-lg shadow-amber-500/40 animate-pulse-slow">
              <Crown className="w-3.5 h-3.5" />
              <span>VIP</span>
            </div>
          )}
          {profile.isVerified && (
            <div className="flex items-center space-x-1 px-2.5 py-0.9 rounded-full bg-emerald-500/90 text-white font-bold text-[10px] uppercase tracking-wider shadow-md backdrop-blur-md">
              <ShieldCheck className="w-3 h-3" />
              <span>Fotos Reais</span>
            </div>
          )}
        </div>

        {/* Top Right Badges: Online Indicator & Category */}
        <div className="absolute top-3 right-3 flex flex-col items-end space-y-1.5 z-10">
          {profile.isOnline && (
            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-black/60 border border-emerald-500/40 text-emerald-400 text-[11px] font-semibold backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>Disponível</span>
            </div>
          )}
          <div className="px-2 py-0.5 rounded-md bg-white/10 border border-white/20 text-gray-200 text-[10px] font-semibold backdrop-blur-md uppercase tracking-wider">
            {profile.category}
          </div>
        </div>

        {/* Floating Price Tag */}
        <div className="absolute bottom-3 right-3 z-10">
          <div className="px-3 py-1.5 rounded-xl bg-black/80 border border-amber-500/30 text-amber-300 font-extrabold text-xs shadow-lg backdrop-blur-md">
            {profile.hourlyRate}
          </div>
        </div>
      </div>

      {/* Card Content Footer */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3 bg-[#14141a]">
        
        <div>
          {/* Header info: Name & Age */}
          <div className="flex items-baseline justify-between">
            <h3 className="text-lg sm:text-xl font-extrabold text-white group-hover:text-amber-400 transition-colors flex items-center space-x-2">
              <span>{profile.name}</span>
              <span className="text-sm font-semibold text-gray-400">, {profile.age}</span>
            </h3>
          </div>

          {/* Location Badge */}
          <div className="mt-1 flex items-center space-x-1.5 text-xs text-amber-400 font-medium">
            <MapPin className="w-3.5 h-3.5 shrink-0 text-amber-400" />
            <span>{profile.city} {profile.neighborhood ? `• ${profile.neighborhood}` : ''}</span>
          </div>

          {/* Tagline / Teaser */}
          <p className="mt-2 text-xs text-gray-300 line-clamp-2 leading-relaxed">
            "{profile.tagline}"
          </p>
        </div>

        {/* Specs Highlights */}
        <div className="flex items-center justify-between text-[11px] text-gray-400 pt-2 border-t border-white/10">
          <span>Alt: <strong className="text-gray-200">{profile.specs.height}</strong></span>
          <span>Peso: <strong className="text-gray-200">{profile.specs.weight}</strong></span>
          <span>Cabelo: <strong className="text-gray-200">{profile.specs.hair}</strong></span>
        </div>

        {/* Action Buttons */}
        <div className="pt-1 grid grid-cols-5 gap-2">
          {/* View Profile details button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect(profile);
            }}
            className="col-span-3 flex items-center justify-center space-x-1.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-gray-200 font-bold text-xs transition-colors"
          >
            <Eye className="w-4 h-4 text-amber-400" />
            <span>Ver Perfil</span>
          </button>

          {/* Direct WhatsApp button */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="col-span-2 flex items-center justify-center space-x-1 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#1ea952] text-white font-extrabold text-xs shadow-md transition-colors btn-whatsapp-glow"
          >
            <MessageCircle className="w-4 h-4 fill-white" />
            <span>Whats</span>
          </a>
        </div>

      </div>
    </div>
  );
};
