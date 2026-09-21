import React, { useState, useEffect } from 'react';
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
import { buscarPerfilPorSlug, ApiError, type PublicProfileDetail } from '../lib/api';

export const ProfilePage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [profile, setProfile] = useState<PublicProfileDetail | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [naoEncontrado, setNaoEncontrado] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    if (!slug) return;
    setCarregando(true);
    setNaoEncontrado(false);
    buscarPerfilPorSlug(slug)
      .then(({ perfil }) => setProfile(perfil))
      .catch((err) => {
        if (err instanceof ApiError && err.status === 404) setNaoEncontrado(true);
      })
      .finally(() => setCarregando(false));
  }, [slug]);

  if (carregando) {
    return <div className="max-w-lg mx-auto px-4 py-24 text-center text-sm text-nevoa">Carregando perfil...</div>;
  }

  if (naoEncontrado || !profile) {
    return (
      <div className="max-w-lg mx-auto px-4 py-24 text-center space-y-4">
        <UserX className="w-12 h-12 text-ouro mx-auto" />
        <h1 className="text-2xl font-display text-white">Perfil não encontrado</h1>
        <p className="text-sm text-gray-300">Este anúncio pode ter sido removido ou o link está incorreto.</p>
        <Link to="/" className="inline-block px-6 py-3 rounded-lg bg-ouro hover:bg-[#B89243] text-black font-bold text-sm transition-colors shadow-lg">
          Voltar para o catálogo
        </Link>
      </div>
    );
  }

  const firstName = profile.stage_name.split(' ')[0];
  const gallery = profile.gallery.length > 0 ? profile.gallery : (profile.cover_image ? [profile.cover_image] : []);
  const whatsappUrl = `https://wa.me/${profile.whatsapp}?text=${encodeURIComponent(
    `Olá ${profile.stage_name}, vi seu perfil no Reserva Secreta (reservasecreta.com.br)!`
  )}`;
  const temFichaTecnica = profile.height || profile.weight || profile.eyes || profile.hair || profile.languages.length > 0;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10 pb-32 md:pb-12 space-y-8">

      {/* Botão de Retorno */}
      <Link to="/" className="inline-flex items-center space-x-2 text-sm font-semibold text-gray-300 hover:text-ouro transition-colors">
        <ArrowLeft className="w-4 h-4 text-ouro" />
        <span>Voltar ao catálogo</span>
      </Link>

      {/* Status e Compartilhamento */}
      <div className="flex items-center justify-between bg-[#270E15] p-3.5 rounded-xl border border-white/10">
        <div className="flex items-center space-x-2.5">
          <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
          <span className="text-xs sm:text-sm font-bold text-emerald-400 uppercase tracking-wider">
            Disponível para Encontro
          </span>
        </div>
        <button
          onClick={() => {
            if (navigator.share) {
              navigator.share({ title: profile.stage_name, url: window.location.href });
            } else {
              navigator.clipboard.writeText(window.location.href);
              alert('Link do perfil copiado para a área de transferência!');
            }
          }}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors"
          title="Compartilhar Perfil"
        >
          <Share2 className="w-4 h-4 text-ouro" />
          <span className="hidden sm:inline">Compartilhar</span>
        </button>
      </div>

      {/* Grid Principal: Galeria + Detalhes do Perfil */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">

        {/* Galeria de Fotos */}
        <div className="md:col-span-6 space-y-3">
          <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl bg-[#18080C] border-2 border-ouro/30 shadow-2xl">
            {gallery.length > 0 ? (
              <img
                src={gallery[activeImageIndex]}
                alt={`${profile.stage_name} foto ${activeImageIndex + 1}`}
                className="w-full h-full object-cover transition-all duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-sm text-nevoa">Sem foto</div>
            )}
            {gallery.length > 1 && (
              <>
                <button
                  onClick={() => setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : gallery.length - 1))}
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/70 text-white hover:bg-black backdrop-blur-md transition-all"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={() => setActiveImageIndex((prev) => (prev < gallery.length - 1 ? prev + 1 : 0))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/70 text-white hover:bg-black backdrop-blur-md transition-all"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}

            {/* Badges Flutuantes */}
            <div className="absolute top-4 left-4 flex flex-col space-y-2 z-10">
              {Boolean(profile.is_vip) && (
                <div className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-ouro text-black font-extrabold text-xs uppercase tracking-wider shadow-xl">
                  <Crown className="w-4 h-4" />
                  <span>VIP EXCLUSIVA</span>
                </div>
              )}
              {profile.is_verified && (
                <div className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 text-white font-bold text-xs uppercase tracking-wider shadow-xl backdrop-blur-md">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Fotos 100% Reais</span>
                </div>
              )}
            </div>
          </div>

          {/* Thumbnails da Galeria */}
          {gallery.length > 1 && (
            <div className="flex items-center space-x-3 overflow-x-auto pb-2">
              {gallery.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`relative w-20 h-24 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                    activeImageIndex === idx ? 'border-ouro ring-2 ring-ouro/40 scale-105' : 'border-white/20 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Informações Principais */}
        <div className="md:col-span-6 space-y-6">

          <div className="border-b border-white/15 pb-5 space-y-3">
            <h1 className="text-3xl sm:text-4xl font-display font-semibold text-white tracking-tight flex items-center space-x-3">
              <span>{profile.stage_name}</span>
              <span className="text-ouro font-serif text-2xl font-bold">, {profile.age} anos</span>
            </h1>

            <div className="flex flex-wrap items-center gap-2">
              <span className="flex items-center space-x-1.5 text-xs font-bold px-3.5 py-1.5 rounded-lg bg-ouro/20 border border-ouro/40 text-white">
                <MapPin className="w-4 h-4 text-ouro" />
                <span>{profile.city} ({profile.neighborhood || 'Centro'})</span>
              </span>
              <span className="px-3.5 py-1.5 rounded-lg bg-white/10 border border-white/15 text-gray-200 text-xs font-semibold">
                Categoria: {profile.category}
              </span>
            </div>

            {profile.hourly_rate && (
              <div className="pt-3 flex items-center justify-between bg-[#270E15] p-4 rounded-xl border border-ouro/20">
                <div className="text-xs text-gray-300 uppercase tracking-wider font-bold">Cachê / Valor Hora:</div>
                <div className="text-2xl sm:text-3xl font-black text-ouro">{profile.hourly_rate}</div>
              </div>
            )}
          </div>

          {/* Biografia / Sobre mim */}
          {profile.bio && (
            <div className="space-y-2 bg-[#270E15] p-5 rounded-xl border border-white/10">
              <h4 className="text-xs font-bold text-ouro uppercase tracking-wider flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-ouro" />
                <span>Sobre mim</span>
              </h4>
              <p className="text-sm sm:text-base text-white leading-relaxed italic">"{profile.bio}"</p>
            </div>
          )}

          {/* Ficha Técnica */}
          {temFichaTecnica && (
            <div className="space-y-3">
              <h4 className="text-xs font-extrabold text-gray-300 uppercase tracking-wider flex items-center space-x-2">
                <UserCheck className="w-4 h-4 text-ouro" />
                <span>Ficha Técnica</span>
              </h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {profile.height && (
                  <div className="p-3 rounded-xl bg-[#270E15] border border-white/10 flex items-center justify-between">
                    <span className="text-gray-300 flex items-center space-x-1.5">
                      <Ruler className="w-4 h-4 text-ouro" />
                      <span>Altura:</span>
                    </span>
                    <strong className="text-white font-bold">{profile.height}</strong>
                  </div>
                )}
                {profile.weight && (
                  <div className="p-3 rounded-xl bg-[#270E15] border border-white/10 flex items-center justify-between">
                    <span className="text-gray-300 flex items-center space-x-1.5">
                      <Weight className="w-4 h-4 text-ouro" />
                      <span>Peso:</span>
                    </span>
                    <strong className="text-white font-bold">{profile.weight}</strong>
                  </div>
                )}
                {profile.hair && (
                  <div className="p-3 rounded-xl bg-[#270E15] border border-white/10 flex items-center justify-between">
                    <span className="text-gray-300">Cabelo:</span>
                    <strong className="text-white font-bold">{profile.hair}</strong>
                  </div>
                )}
                {profile.eyes && (
                  <div className="p-3 rounded-xl bg-[#270E15] border border-white/10 flex items-center justify-between">
                    <span className="text-gray-300">Olhos:</span>
                    <strong className="text-white font-bold">{profile.eyes}</strong>
                  </div>
                )}
                {profile.languages.length > 0 && (
                  <div className="p-3 rounded-xl bg-[#270E15] border border-white/10 flex items-center justify-between col-span-2">
                    <span className="text-gray-300 flex items-center space-x-1.5">
                      <Languages className="w-4 h-4 text-ouro" />
                      <span>Idiomas:</span>
                    </span>
                    <strong className="text-white font-bold">{profile.languages.join(', ')}</strong>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Botão de Chamada no Desktop */}
          <div className="hidden md:block pt-3">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center space-x-3 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-lg rounded-xl shadow-xl transition-all transform hover:scale-[1.02]"
            >
              <MessageCircle className="w-6 h-6 fill-white" />
              <span>Chamar {firstName} no WhatsApp Agora</span>
            </a>
          </div>
        </div>
      </div>

      {/* Serviços */}
      {profile.services.length > 0 && (
        <div className="pt-6 border-t border-white/15 space-y-4">
          <h4 className="text-base font-extrabold text-white uppercase tracking-wider flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span>Serviços & Atendimento</span>
          </h4>
          <div className="flex flex-wrap gap-2.5">
            {profile.services.map((service, idx) => (
              <span key={idx} className="px-4 py-2 rounded-lg bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-sm font-semibold flex items-center space-x-1.5">
                <span>✓</span>
                <span>{service}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Locais Aceitos */}
      {profile.locations.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-base font-extrabold text-white uppercase tracking-wider flex items-center space-x-2">
            <MapPin className="w-5 h-5 text-ouro" />
            <span>Locais Aceitos</span>
          </h4>
          <div className="flex flex-wrap gap-2.5">
            {profile.locations.map((loc, idx) => (
              <span key={idx} className="px-4 py-2 rounded-lg bg-[#270E15] border border-white/15 text-white text-sm font-medium">
                {loc}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Alerta de Sigilo */}
      <div className="p-4 bg-ouro/15 border border-ouro/30 rounded-xl text-white text-xs sm:text-sm flex items-center space-x-3">
        <Lock className="w-5 h-5 shrink-0 text-ouro" />
        <span>
          Ao entrar em contato pelo WhatsApp, informe que encontrou o anúncio no <strong>Reserva Secreta (reservasecreta.com.br)</strong> para garantia de atendimento VIP.
        </span>
      </div>

      {/* Barra fixa de WhatsApp no rodapé do celular */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 p-3 bg-[#16070B]/95 border-t border-ouro/40 backdrop-blur-xl shadow-2xl flex items-center justify-between gap-3">
        {profile.hourly_rate && (
          <div className="pl-2">
            <div className="text-[10px] uppercase font-bold text-gray-300">Cachê / Hora</div>
            <div className="text-lg font-black text-ouro">{profile.hourly_rate}</div>
          </div>
        )}

        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center space-x-2.5 py-3.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-base rounded-xl shadow-xl active:scale-95 transition-all"
        >
          <MessageCircle className="w-5 h-5 fill-white" />
          <span>WhatsApp Direto</span>
        </a>
      </div>

    </div>
  );
};
