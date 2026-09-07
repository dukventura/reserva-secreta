import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  MapPin,
  ShieldCheck,
  Crown,
  MessageCircle,
  Sparkles,
  CheckCircle2,
  Ruler,
  Weight,
  Languages,
  UserCheck,
  Share2,
  Lock,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  UserX,
} from 'lucide-react';
import { mockProfiles } from '../data/mockProfiles';

export const ProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const profile = mockProfiles.find((p) => p.id === id);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  if (!profile) {
    return (
      <div className="max-w-lg mx-auto px-4 py-24 text-center space-y-4">
        <UserX className="w-10 h-10 text-ouro mx-auto" />
        <h1 className="text-2xl font-display text-marfim">Perfil não encontrado</h1>
        <p className="text-sm text-nevoa">Este anúncio pode ter sido removido ou o link está incorreto.</p>
        <Link to="/" className="inline-block px-5 py-2.5 rounded-campo bg-ouro hover:bg-champanhe text-black font-bold text-sm transition-colors">
          Voltar para o catálogo
        </Link>
      </div>
    );
  }

  const whatsappUrl = `https://wa.me/${profile.whatsapp}?text=${encodeURIComponent(
    profile.whatsappMessage || `Olá ${profile.name}, vi seu perfil no Reserva Secreta (reservasecreta.com.br)!`
  )}`;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10 pb-28 md:pb-10 space-y-6">

      <Link to="/" className="inline-flex items-center space-x-2 text-xs text-nevoa hover:text-marfim transition-colors">
        <ArrowLeft className="w-4 h-4" />
        <span>Voltar ao catálogo</span>
      </Link>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-verificado-texto animate-ping" />
          <span className="text-xs font-bold text-verificado-texto uppercase tracking-wider">
            {profile.isOnline ? 'Online Agora' : 'Disponível para Encontro'}
          </span>
        </div>
        <button
          onClick={() => {
            if (navigator.share) {
              navigator.share({ title: profile.name, url: window.location.href });
            } else {
              navigator.clipboard.writeText(window.location.href);
              alert('Link copiado para a área de transferência!');
            }
          }}
          className="p-2 rounded-campo bg-white/5 hover:bg-white/10 text-nevoa transition-colors"
          title="Compartilhar Perfil"
        >
          <Share2 className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">

        {/* Gallery */}
        <div className="md:col-span-6 space-y-3">
          <div className="relative aspect-[3/4] w-full overflow-hidden bg-grafite border border-white/10 shadow-lg">
            <img
              src={profile.gallery[activeImageIndex] || profile.coverImage}
              alt={`${profile.name} foto ${activeImageIndex + 1}`}
              className="w-full h-full object-cover transition-all duration-300"
            />
            {profile.gallery.length > 1 && (
              <>
                <button
                  onClick={() => setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : profile.gallery.length - 1))}
                  className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-campo bg-black/60 text-marfim hover:bg-black/80 backdrop-blur-md"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setActiveImageIndex((prev) => (prev < profile.gallery.length - 1 ? prev + 1 : 0))}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-campo bg-black/60 text-marfim hover:bg-black/80 backdrop-blur-md"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}
            <div className="absolute top-3 left-3 flex flex-col space-y-1.5 z-10">
              {profile.isVip && (
                <div className="flex items-center space-x-1 px-3 py-1 rounded-campo bg-ouro text-black font-extrabold text-xs uppercase tracking-wider shadow-lg">
                  <Crown className="w-3.5 h-3.5" />
                  <span>VIP EXCLUSIVA</span>
                </div>
              )}
              {profile.isVerified && (
                <div className="flex items-center space-x-1 px-3 py-1 rounded-campo bg-verificado text-marfim font-bold text-xs uppercase tracking-wider shadow-lg backdrop-blur-md">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Fotos 100% Reais</span>
                </div>
              )}
            </div>
          </div>

          {profile.gallery.length > 1 && (
            <div className="flex items-center space-x-2 overflow-x-auto pb-1">
              {profile.gallery.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`relative w-16 h-20 rounded-campo overflow-hidden border-2 shrink-0 transition-all ${
                    activeImageIndex === idx ? 'border-ouro scale-105' : 'border-white/10 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="md:col-span-6 space-y-5">
          <div className="border-b border-white/10 pb-4 space-y-2">
            <h1 className="text-2xl sm:text-3xl font-display font-normal text-marfim tracking-tight flex items-center space-x-2">
              <span>{profile.name}</span>
              <span className="text-ouro text-xl font-bold">, {profile.age} anos</span>
            </h1>

            <div className="flex flex-wrap items-center gap-2">
              <span className="flex items-center space-x-1 text-xs font-semibold px-3 py-1 rounded-campo bg-ouro/10 border border-ouro/30 text-champanhe">
                <MapPin className="w-3.5 h-3.5" />
                <span>{profile.city} ({profile.neighborhood || 'Centro'})</span>
              </span>
              <span className="px-3 py-1 rounded-campo bg-white/5 border border-white/10 text-nevoa text-xs font-semibold">
                Categoria: {profile.category}
              </span>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <div className="text-xs text-nevoa uppercase tracking-wider font-semibold">Cachê / Valor:</div>
              <div className="text-xl sm:text-2xl font-black text-ouro">{profile.hourlyRate}</div>
            </div>
          </div>

          <div className="space-y-2 bg-grafite p-4 border border-white/10">
            <h4 className="text-xs font-bold text-ouro uppercase tracking-wider flex items-center space-x-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Sobre mim</span>
            </h4>
            <p className="text-xs sm:text-sm text-marfim leading-relaxed italic">"{profile.bio}"</p>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-extrabold text-nevoa uppercase tracking-wider flex items-center space-x-1">
              <UserCheck className="w-4 h-4 text-ouro" />
              <span>Ficha Técnica</span>
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-campo bg-white/5 border border-white/10 flex items-center justify-between">
                <span className="text-nevoa flex items-center space-x-1">
                  <Ruler className="w-3.5 h-3.5 text-ouro" />
                  <span>Altura:</span>
                </span>
                <strong className="text-marfim font-semibold">{profile.specs.height}</strong>
              </div>
              <div className="p-2.5 rounded-campo bg-white/5 border border-white/10 flex items-center justify-between">
                <span className="text-nevoa flex items-center space-x-1">
                  <Weight className="w-3.5 h-3.5 text-ouro" />
                  <span>Peso:</span>
                </span>
                <strong className="text-marfim font-semibold">{profile.specs.weight}</strong>
              </div>
              <div className="p-2.5 rounded-campo bg-white/5 border border-white/10 flex items-center justify-between">
                <span className="text-nevoa">Cabelo:</span>
                <strong className="text-marfim font-semibold">{profile.specs.hair}</strong>
              </div>
              <div className="p-2.5 rounded-campo bg-white/5 border border-white/10 flex items-center justify-between">
                <span className="text-nevoa">Olhos:</span>
                <strong className="text-marfim font-semibold">{profile.specs.eyes}</strong>
              </div>
              <div className="p-2.5 rounded-campo bg-white/5 border border-white/10 flex items-center justify-between col-span-2">
                <span className="text-nevoa flex items-center space-x-1">
                  <Languages className="w-3.5 h-3.5 text-ouro" />
                  <span>Idiomas:</span>
                </span>
                <strong className="text-marfim font-semibold">{profile.specs.languages.join(', ')}</strong>
              </div>
            </div>
          </div>

          <div className="hidden md:block pt-2">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center space-x-3 py-4 bg-whatsapp hover:bg-whatsapp-hover text-marfim font-extrabold text-lg shadow-xl transition-all transform hover:scale-[1.02]"
            >
              <MessageCircle className="w-6 h-6 fill-white" />
              <span>Chamar no WhatsApp Agora</span>
            </a>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-white/10 space-y-3">
        <h4 className="text-sm font-extrabold text-marfim uppercase tracking-wider flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-verificado-texto" />
          <span>Serviços & Atendimento</span>
        </h4>
        <div className="flex flex-wrap gap-2">
          {profile.services.map((service, idx) => (
            <span key={idx} className="px-3 py-1.5 rounded-campo bg-verificado/10 border border-verificado/20 text-verificado-texto text-xs font-semibold flex items-center space-x-1">
              <span>✓</span>
              <span>{service}</span>
            </span>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="text-sm font-extrabold text-marfim uppercase tracking-wider flex items-center space-x-2">
          <MapPin className="w-4 h-4 text-ouro" />
          <span>Locais Aceitos</span>
        </h4>
        <div className="flex flex-wrap gap-2">
          {profile.locations.map((loc, idx) => (
            <span key={idx} className="px-3 py-1.5 rounded-campo bg-white/5 border border-white/10 text-marfim text-xs font-medium">
              {loc}
            </span>
          ))}
        </div>
      </div>

      <div className="p-3.5 bg-ouro/10 border border-ouro/20 text-champanhe text-xs flex items-center space-x-2">
        <Lock className="w-4 h-4 shrink-0 text-ouro" />
        <span>
          Ao entrar em contato pelo WhatsApp, mencione que viu o anúncio no <strong>Reserva Secreta (reservasecreta.com.br)</strong> para um atendimento exclusivo e prioritário.
        </span>
      </div>

      {/* Sticky mobile CTA */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 p-3 bg-onix/95 border-t border-white/15 backdrop-blur-xl shadow-2xl">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-center space-x-3 py-3.5 bg-whatsapp hover:bg-whatsapp-hover text-marfim font-extrabold text-base shadow-2xl active:scale-95 transition-all"
        >
          <MessageCircle className="w-6 h-6 fill-white" />
          <span>Chamar {profile.name.split(' ')[0]} no WhatsApp</span>
        </a>
      </div>
    </div>
  );
};
