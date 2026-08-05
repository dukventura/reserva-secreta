import React, { useState } from 'react';
import { X, Crown, MessageCircle, CheckCircle2 } from 'lucide-react';

interface AdvertiseModalProps {
  onClose: () => void;
}

export const AdvertiseModal: React.FC<AdvertiseModalProps> = ({ onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    city: 'Ilicínea',
    whatsapp: '',
    category: 'VIP',
    instagram: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = `Olá equipe Guia Prime! Gostaria de cadastrar meu perfil:\n- Nome: ${formData.name}\n- Cidade: ${formData.city}\n- Categoria: ${formData.category}\n- Contato: ${formData.whatsapp}`;
    const url = `https://wa.me/5535999999999?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg bg-[#121218] rounded-3xl border border-amber-500/30 shadow-2xl p-6 sm:p-8 space-y-6">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
            <Crown className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-white">
            Anuncie no <span className="text-gold-gradient">Guia Prime</span>
          </h2>
          <p className="text-xs text-gray-300">
            Seja uma acompanhante VIP em Ilicínea, Boa Esperança e região com máxima visibilidade e discrição.
          </p>
        </div>

        {/* Benefits list */}
        <div className="space-y-2 bg-white/5 p-3.5 rounded-2xl border border-white/10 text-xs text-gray-300">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Perfil com Fotos HD & Galeria Personalizada</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Botão direto para o seu WhatsApp sem intermediários</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Atendimento suporte 24h e selo de Perfil Verificado</span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Seu Nome / Nome Artístico</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: Amanda Santos"
              className="w-full bg-[#1a1a24] text-white text-sm rounded-xl px-4 py-2.5 border border-white/15 focus:border-amber-400 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Cidade</label>
              <select
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full bg-[#1a1a24] text-white text-sm rounded-xl px-3 py-2.5 border border-white/15 focus:border-amber-400 outline-none"
              >
                <option value="Ilicínea">Ilicínea</option>
                <option value="Boa Esperança">Boa Esperança</option>
                <option value="Outra Região">Outra Região</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Categoria Pretendida</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full bg-[#1a1a24] text-white text-sm rounded-xl px-3 py-2.5 border border-white/15 focus:border-amber-400 outline-none"
              >
                <option value="VIP">VIP</option>
                <option value="Mulheres">Mulheres</option>
                <option value="Trans">Trans</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Seu WhatsApp de Atendimento</label>
            <input
              type="tel"
              required
              value={formData.whatsapp}
              onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
              placeholder="(35) 99999-9999"
              className="w-full bg-[#1a1a24] text-white text-sm rounded-xl px-4 py-2.5 border border-white/15 focus:border-amber-400 outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center space-x-2 py-3.5 rounded-xl bg-[#25D366] hover:bg-[#1ea952] text-white font-extrabold text-sm shadow-xl transition-all"
          >
            <MessageCircle className="w-5 h-5 fill-white" />
            <span>Enviar Pedido via WhatsApp</span>
          </button>
        </form>

      </div>
    </div>
  );
};
