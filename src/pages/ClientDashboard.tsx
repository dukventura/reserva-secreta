import React, { useState, useEffect } from 'react';
import { Heart, UserCircle2, Flag, AlertCircle, CheckCircle2, KeyRound } from 'lucide-react';
import { RequireRole } from '../components/RequireRole';
import { ProfileCard } from '../components/ProfileCard';
import { useFavorites } from '../context/FavoritesContext';
import {
  buscarMe, atualizarMinhaConta, listarFavoritos, listarMinhasDenuncias, ApiError,
  type AuthUser, type ClientReport, type PublicProfile,
} from '../lib/api';

const TABS = [
  { key: 'favoritos', label: 'Favoritos', icon: <Heart className="w-4 h-4" /> },
  { key: 'conta', label: 'Minha Conta', icon: <UserCircle2 className="w-4 h-4" /> },
  { key: 'denuncias', label: 'Minhas Denúncias', icon: <Flag className="w-4 h-4" /> },
];

const ROTULO_STATUS_DENUNCIA: Record<ClientReport['status'], string> = {
  pendente: 'Em análise',
  aprovado: 'Procedente — anúncio removido',
  reprovado: 'Arquivada',
};

function AbaFavoritos() {
  // slugsFavoritados.size no array de dependencias faz a lista
  // recarregar sozinha quando o coracao e' clicado em outra tela
  // (card/perfil) e a pessoa volta pra essa aba.
  const { slugsFavoritados } = useFavorites();
  const [favoritos, setFavoritos] = useState<PublicProfile[] | null>(null);

  useEffect(() => {
    listarFavoritos().then(({ favoritos }) => setFavoritos(favoritos));
  }, [slugsFavoritados.size]);

  if (favoritos === null) return <p className="text-sm text-nevoa">Carregando favoritos...</p>;
  if (favoritos.length === 0) {
    return (
      <div className="text-center py-12 space-y-2">
        <Heart className="w-8 h-8 text-nevoa mx-auto" />
        <p className="text-sm text-nevoa">Você ainda não favoritou nenhum perfil.</p>
        <p className="text-xs text-nevoa">Clique no coração em qualquer anúncio pra salvar aqui.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {favoritos.map((p) => <ProfileCard key={p.slug} profile={p} />)}
    </div>
  );
}

function AbaConta() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [nome, setNome] = useState('');
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [salvo, setSalvo] = useState(false);
  const [erro, setErro] = useState('');

  useEffect(() => {
    buscarMe().then(({ user }) => { setUser(user); setNome(user.name); });
  }, []);

  const salvar = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    setSalvo(false);
    setSalvando(true);
    try {
      const dados: { name?: string; senha_atual?: string; nova_senha?: string } = {};
      if (user && nome.trim() && nome !== user.name) dados.name = nome.trim();
      if (novaSenha) { dados.senha_atual = senhaAtual; dados.nova_senha = novaSenha; }
      if (Object.keys(dados).length === 0) { setSalvando(false); return; }
      await atualizarMinhaConta(dados);
      setSenhaAtual('');
      setNovaSenha('');
      setSalvo(true);
      if (dados.name) setUser((u) => (u ? { ...u, name: dados.name! } : u));
    } catch (err) {
      setErro(err instanceof ApiError ? err.message : 'Não foi possível salvar.');
    } finally {
      setSalvando(false);
    }
  };

  if (!user) return <p className="text-sm text-nevoa">Carregando...</p>;

  return (
    <form onSubmit={salvar} className="max-w-md space-y-4">
      {erro && (
        <div className="flex items-start space-x-2 bg-red-500/10 border border-red-500/30 p-3 text-xs text-red-300">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{erro}</span>
        </div>
      )}
      {salvo && (
        <div className="flex items-start space-x-2 bg-verificado/10 border border-verificado/30 p-3 text-xs text-verificado-texto">
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
          <span>Dados atualizados.</span>
        </div>
      )}

      <div>
        <label className="block text-xs font-semibold text-nevoa mb-1.5">Nome</label>
        <input
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className="w-full bg-onix text-marfim text-sm rounded-campo px-4 py-2.5 border border-white/15 focus:border-ouro outline-none"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-nevoa mb-1.5">E-mail</label>
        <input value={user.email ?? ''} disabled className="w-full bg-onix/50 text-nevoa text-sm rounded-campo px-4 py-2.5 border border-white/10 outline-none" />
      </div>

      <div className="pt-2 border-t border-white/10 space-y-3">
        <div className="flex items-center space-x-2 text-xs font-semibold text-nevoa uppercase tracking-wide">
          <KeyRound className="w-3.5 h-3.5 text-ouro" />
          <span>Trocar senha (opcional)</span>
        </div>
        <div>
          <label className="block text-xs font-semibold text-nevoa mb-1.5">Senha atual</label>
          <input
            type="password"
            value={senhaAtual}
            onChange={(e) => setSenhaAtual(e.target.value)}
            className="w-full bg-onix text-marfim text-sm rounded-campo px-4 py-2.5 border border-white/15 focus:border-ouro outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-nevoa mb-1.5">Nova senha</label>
          <input
            type="password"
            minLength={8}
            value={novaSenha}
            onChange={(e) => setNovaSenha(e.target.value)}
            placeholder="Mínimo 8 caracteres"
            className="w-full bg-onix text-marfim text-sm rounded-campo px-4 py-2.5 border border-white/15 focus:border-ouro outline-none"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={salvando}
        className="px-5 py-2.5 rounded-campo bg-ouro hover:bg-champanhe text-black font-bold text-sm transition-colors disabled:opacity-60"
      >
        {salvando ? 'Salvando...' : 'Salvar alterações'}
      </button>
    </form>
  );
}

function AbaDenuncias() {
  const [denuncias, setDenuncias] = useState<ClientReport[] | null>(null);
  const [erro, setErro] = useState('');

  useEffect(() => {
    listarMinhasDenuncias()
      .then(({ denuncias }) => setDenuncias(denuncias))
      .catch((err) => setErro(err instanceof ApiError ? err.message : 'Não foi possível carregar.'));
  }, []);

  if (erro) return <p className="text-sm text-red-300">{erro}</p>;
  if (denuncias === null) return <p className="text-sm text-nevoa">Carregando...</p>;
  if (denuncias.length === 0) return <p className="text-sm text-nevoa">Você ainda não fez nenhuma denúncia.</p>;

  return (
    <div className="border border-white/10 divide-y divide-white/10 max-w-2xl">
      {denuncias.map((d) => (
        <div key={d.id} className="p-3.5 text-sm">
          <div className="flex items-center justify-between gap-2">
            <span className="text-marfim font-semibold">{d.target_name}</span>
            <span className="text-[11px] text-nevoa">{new Date(d.created_at).toLocaleDateString('pt-BR')}</span>
          </div>
          <div className="text-xs text-nevoa mt-1">{d.reason}</div>
          <div className="text-[11px] text-ouro font-semibold mt-1">{ROTULO_STATUS_DENUNCIA[d.status]}</div>
        </div>
      ))}
    </div>
  );
}

function ClientDashboardContent() {
  const [tab, setTab] = useState('favoritos');

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 sm:py-16 space-y-6">
      <h1 className="text-2xl font-display font-normal text-marfim">Minha Conta</h1>

      <div className="flex gap-1 border-b border-white/10">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center space-x-1.5 px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors ${
              tab === t.key ? 'border-ouro text-ouro' : 'border-transparent text-nevoa hover:text-marfim'
            }`}
          >
            {t.icon}
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {tab === 'favoritos' && <AbaFavoritos />}
      {tab === 'conta' && <AbaConta />}
      {tab === 'denuncias' && <AbaDenuncias />}
    </div>
  );
}

export const ClientDashboard: React.FC = () => (
  <RequireRole allow={['contratante']}>
    <ClientDashboardContent />
  </RequireRole>
);
