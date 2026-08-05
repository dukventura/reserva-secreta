import React, { useState } from 'react';
import {
  X,
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
  ChevronRight
} from 'lucide-react';
import type { EscortProfile } from '../types';

interface ProfileModalProps {
  profile: EscortProfile | null;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ profile, onClose }) => {
  if (!profile) return null;

  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const whatsappUrl = `https://wa.me/${profile.whatsapp}?text=${encodeURIComponent(
    profile.whatsappMessage || `Olá ${profile.name}, vi seu perfil no Guia Prime!`
  )}`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/90 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      
      {/* Modal Card Box */}
      <div className="relative w-full max-w-4xl bg-[#101015] rounded-t-3xl sm:rounded-3xl border border-white/10 shadow-2xl overflow-hidden max-h-[92vh] sm:max-h-[90vh] flex flex-col my-0 sm:my-auto">
        
        {/* Top Header Bar */}
        <div className="sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 py-3 bg-[#0d0d12]/95 border-b border-white/10 backdrop-blur-md">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
              {profile.isOnline ? 'Online Agora' : 'Disponível para Encontro'}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({ title: profile.name, url: window.location.href });
                } else {
                  navigator.clipboard.writeText(window.location.href);
                  alert('Link copiado para a área de transferência!');
                }
              }}
              className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-300 transition-colors"
              title="Compartilhar Perfil"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              aria-label="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto flex-1 p-4 sm:p-6 pb-28 sm:pb-8 space-y-6">
          
          {/* Top Section: Photo Gallery + Quick Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            
            {/* Gallery Column (Left side desktop / top mobile) */}
            <div className="md:col-span-6 space-y-3">
              {/* Main Photo View */}
              <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden bg-[#181820] border border-white/10 shadow-lg">
                <img
                  src={profile.gallery[activeImageIndex] || profile.coverImage}
                  alt={`${profile.name} foto ${activeImageIndex + 1}`}
                  className="w-full h-full object-cover transition-all duration-300"
                />

                {/* Left / Right Gallery Nav Overlay */}
                {profile.gallery.length > 1 && (
                  <>
                    <button
                      onClick={() => setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : profile.gallery.length - 1))}
                      className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 text-white hover:bg-black/80 backdrop-blur-md"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setActiveImageIndex((prev) => (prev < profile.gallery.length - 1 ? prev + 1 : 0))}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 text-white hover:bg-black/80 backdrop-blur-md"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}

                {/* VIP / Verified badges on image */}
                <div className="absolute top-3 left-3 flex flex-col space-y-1.5 z-10">
                  {profile.isVip && (
                    <div className="flex items-center space-x-1 px-3 py-1 rounded-full bg-amber-500 text-black font-extrabold text-xs uppercase tracking-wider shadow-lg">
                      <Crown className="w-3.5 h-3.5" />
                      <span>VIP EXCLUSIVA</span>
                    </div>
                  )}
                  {profile.isVerified && (
                    <div className="flex items-center space-x-1 px-3 py-1 rounded-full bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg backdrop-blur-md">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Fotos 100% Reais</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Gallery Thumbnails List */}
              {profile.gallery.length > 1 && (
                <div className="flex items-center space-x-2 overflow-x-auto pb-1">
                  {profile.gallery.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative w-16 h-20 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                        activeImageIndex === idx ? 'border-amber-400 scale-105 shadow-md shadow-amber-400/20' : 'border-white/10 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Profile Info Column (Right side desktop) */}
            <div className="md:col-span-6 space-y-5">
              
              {/* Header: Name, Age & Rate */}
              <div className="border-b border-white/10 pb-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center space-x-2">
                    <span>{profile.name}</span>
                    <span className="text-amber-400 text-xl font-bold">, {profile.age} anos</span>
                  </h2>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span className="flex items-center space-x-1 text-xs font-semibold px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{profile.city} ({profile.neighborhood || 'Centro'})</span>
                  </span>
                  <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-gray-300 text-xs font-semibold">
                    Categoria: {profile.category}
                  </span>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <div className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Cachê / Valor:</div>
                  <div className="text-xl sm:text-2xl font-black text-amber-400">
                    {profile.hourlyRate}
                  </div>
                </div>
              </div>

              {/* Tagline & Bio */}
              <div className="space-y-2 bg-[#16161e] p-4 rounded-2xl border border-white/10">
                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center space-x-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Sobre mim</span>
                </h4>
                <p className="text-xs sm:text-sm text-gray-200 leading-relaxed italic">
                  "{profile.bio}"
                </p>
              </div>

              {/* Ficha Técnica / Mock Specs Grid */}
              <div className="space-y-3">
                <h4 className="text-xs font-extrabold text-gray-300 uppercase tracking-wider flex items-center space-x-1">
                  <UserCheck className="w-4 h-4 text-amber-400" />
                  <span>Ficha Técnica</span>
                </h4>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                    <span className="text-gray-400 flex items-center space-x-1">
                      <Ruler className="w-3.5 h-3.5 text-amber-400" />
                      <span>Altura:</span>
                    </span>
                    <strong className="text-white font-semibold">{profile.specs.height}</strong>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                    <span className="text-gray-400 flex items-center space-x-1">
                      <Weight className="w-3.5 h-3.5 text-amber-400" />
                      <span>Peso:</span>
                    </span>
                    <strong className="text-white font-semibold">{profile.specs.weight}</strong>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                    <span className="text-gray-400">Cabelo:</span>
                    <strong className="text-white font-semibold">{profile.specs.hair}</strong>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                    <span className="text-gray-400">Olhos:</span>
                    <strong className="text-white font-semibold">{profile.specs.eyes}</strong>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between col-span-2">
                    <span className="text-gray-400 flex items-center space-x-1">
                      <Languages className="w-3.5 h-3.5 text-amber-400" />
                      <span>Idiomas:</span>
                    </span>
                    <strong className="text-white font-semibold">{profile.specs.languages.join(', ')}</strong>
                  </div>
                </div>
              </div>

              {/* Desktop Direct Call CTA (Visible on Desktop side panel) */}
              <div className="hidden md:block pt-2">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center space-x-3 py-4 rounded-2xl bg-[#25D366] hover:bg-[#1ea952] text-white font-extrabold text-lg shadow-xl shadow-emerald-900/30 transition-all transform hover:scale-[1.02] btn-whatsapp-glow"
                >
                  <MessageCircle className="w-6 h-6 fill-white" />
                  <span>Chamar no WhatsApp Agora</span>
                </a>
              </div>

            </div>
          </div>

          {/* Atendimento & Serviços Offered */}
          <div className="pt-4 border-t border-white/10 space-y-3">
            <h4 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Serviços & Atendimento</span>
            </h4>

            <div className="flex flex-wrap gap-2">
              {profile.services.map((service, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold flex items-center space-x-1"
                >
                  <span>✓</span>
                  <span>{service}</span>
                </span>
              ))}
            </div>
          </div>

          {/* Locais de Atendimento */}
          <div className="space-y-3">
            <h4 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-amber-400" />
              <span>Locais Aceitos</span>
            </h4>

            <div className="flex flex-wrap gap-2">
              {profile.locations.map((loc, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-gray-200 text-xs font-medium"
                >
                  {loc}
                </span>
              ))}
            </div>
          </div>

          {/* Discreet Privacy Note */}
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center space-x-2">
            <Lock className="w-4 h-4 shrink-0 text-amber-400" />
            <span>
              Ao entrar em contato pelo WhatsApp, mencione que viu o anúncio no <strong>Guia Prime</strong> para um atendimento exclusivo e prioritário.
            </span>
          </div>

        </div>

        {/* CRITICAL MOBILE STICKY BOTTOM BAR (Massive WhatsApp Button) */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 p-3 bg-[#0a0a0e]/95 border-t border-white/15 backdrop-blur-xl shadow-2xl">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center space-x-3 py-3.5 rounded-2xl bg-[#25D366] hover:bg-[#1ea952] text-white font-extrabold text-base shadow-2xl shadow-emerald-600/50 active:scale-95 transition-all btn-whatsapp-glow"
          >
            <MessageCircle className="w-6 h-6 fill-white animate-bounce" />
            <span>Chamar {profile.name.split(' ')[0]} no WhatsApp</span>
          </a>
        </div>

      </div>
    </div>
  );
};
