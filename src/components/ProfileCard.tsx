import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MapPin, Crown, ShieldCheck, MessageCircle, Eye } from 'lucide-react';
import type { PublicProfile } from '../lib/api';

interface ProfileCardProps {
  profile: PublicProfile;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({ profile }) => {
  const navigate = useNavigate();
  const whatsappUrl = `https://wa.me/${profile.whatsapp}?text=${encodeURIComponent(
    `Olá ${profile.stage_name}, vi seu perfil no Reserva Secreta (reservasecreta.com.br)!`
  )}`;
  const irParaPerfil = `/perfil/${profile.slug}`;

  // Nao e' um <Link> envolvendo o cartao inteiro porque o botao de
  // WhatsApp la dentro tambem e' um <a> - <a> dentro de <a> e' HTML
  // invalido e quebra a hidratacao. O cartao vira clicavel via onClick
  // + teclado, e o link real (para SEO/"abrir em nova aba") fica no
  // titulo do perfil.
  return (
    <div
      role="link"
      tabIndex={0}
      onClick={() => navigate(irParaPerfil)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate(irParaPerfil); } }}
      className="group relative bg-[#270E15] rounded-xl overflow-hidden border border-ouro/30 hover:border-ouro shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1.5 flex flex-col cursor-pointer"
    >
      {/* Container de Imagem */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#18080C]">

        {/* Imagem de Capa */}
        {profile.cover_image ? (
          <img
            src={profile.cover_image}
            alt={profile.stage_name}
            loading="lazy"
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xs text-nevoa">Sem foto</div>
        )}

        {/* Gradiente Superior */}
        <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-black/80 via-black/30 to-transparent pointer-events-none" />

        {/* Gradiente Inferior */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#270E15] via-[#270E15]/60 to-transparent pointer-events-none" />

        {/* Badges Flutuantes: VIP & Verificado */}
        <div className="absolute top-3 left-3 flex flex-col space-y-1.5 z-10">
          {Boolean(profile.is_vip) && (
            <div className="flex items-center space-x-1 px-2.5 py-1 rounded-md bg-ouro text-black font-extrabold text-[11px] uppercase tracking-wider shadow-lg">
              <Crown className="w-3.5 h-3.5" />
              <span>VIP</span>
            </div>
          )}
          {profile.is_verified && (
            <div className="flex items-center space-x-1 px-2.5 py-1 rounded-md bg-emerald-600 text-white font-bold text-[10px] uppercase tracking-wider shadow-md backdrop-blur-md">
              <ShieldCheck className="w-3 h-3" />
              <span>Fotos Reais</span>
            </div>
          )}
        </div>

        {/* Categoria */}
        <div className="absolute top-3 right-3 z-10">
          <div className="px-2.5 py-0.5 rounded-md bg-white/10 border border-white/20 text-white text-[10px] font-bold backdrop-blur-md uppercase tracking-wider">
            {profile.category}
          </div>
        </div>

        {/* Tag de Valor Flutuante */}
        {profile.hourly_rate && (
          <div className="absolute bottom-3 right-3 z-10">
            <div className="px-3 py-1.5 rounded-md bg-black/85 border border-ouro/40 text-ouro font-black text-xs shadow-lg backdrop-blur-md">
              {profile.hourly_rate}
            </div>
          </div>
        )}
      </div>

      {/* Conteúdo do Cartão */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3 bg-[#270E15]">

        <div>
          {/* Nome e Idade */}
          <div className="flex items-baseline justify-between">
            <h3 className="text-lg sm:text-xl font-display font-semibold text-white group-hover:text-ouro transition-colors flex items-center space-x-2">
              <Link to={irParaPerfil} onClick={(e) => e.stopPropagation()} className="hover:underline">{profile.stage_name}</Link>
              <span className="text-sm font-bold text-gray-300">, {profile.age}</span>
            </h3>
          </div>

          {/* Localização */}
          <div className="mt-1 flex items-center space-x-1.5 text-xs text-ouro font-semibold">
            <MapPin className="w-3.5 h-3.5 shrink-0 text-ouro" />
            <span>{profile.city} {profile.neighborhood ? `• ${profile.neighborhood}` : ''}</span>
          </div>

          {/* Chamada / Tagline */}
          {profile.tagline && (
            <p className="mt-2 text-xs text-gray-200 line-clamp-2 leading-relaxed italic">
              "{profile.tagline}"
            </p>
          )}
        </div>

        {/* Ficha Rápida */}
        {(profile.height || profile.weight || profile.hair) && (
          <div className="flex items-center justify-between text-[11px] text-gray-300 pt-2.5 border-t border-white/10">
            <span>Alt: <strong className="text-white font-bold">{profile.height ?? '—'}</strong></span>
            <span>Peso: <strong className="text-white font-bold">{profile.weight ?? '—'}</strong></span>
            <span>Cabelo: <strong className="text-white font-bold">{profile.hair ?? '—'}</strong></span>
          </div>
        )}

        {/* Botões de Ação */}
        <div className="pt-1 grid grid-cols-5 gap-2">
          {/* Ver Perfil */}
          <span className="col-span-3 flex items-center justify-center space-x-1.5 py-2.5 rounded-lg bg-white/10 group-hover:bg-white/20 border border-white/20 text-white font-bold text-xs transition-colors">
            <Eye className="w-4 h-4 text-ouro" />
            <span>Ver Perfil</span>
          </span>

          {/* Botão de WhatsApp Direto */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="col-span-2 flex items-center justify-center space-x-1 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-md transition-all active:scale-95"
          >
            <MessageCircle className="w-4 h-4 fill-white" />
            <span>Whats</span>
          </a>
        </div>

      </div>
    </div>
  );
};
