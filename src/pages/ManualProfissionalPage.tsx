import React from 'react';
import { UserPlus, ClipboardList, UserRound, Images, RefreshCw, ShieldCheck, LifeBuoy } from 'lucide-react';

const STATUS = [
  { status: 'Rascunho', significado: 'Ainda não foi enviado para análise' },
  { status: 'Em análise', significado: 'Está na fila do gerente, aguardando aprovação' },
  { status: 'Publicado', significado: 'Aprovado — visível no catálogo público' },
  { status: 'Reprovado', significado: 'O gerente pediu ajustes — edite e reenvie' },
  { status: 'Suspenso', significado: 'Uma denúncia contra o anúncio foi julgada procedente' },
];

export const ManualProfissionalPage: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-16 space-y-10">
      <div className="space-y-2">
        <h1 className="text-3xl font-display font-normal text-marfim">Manual da Profissional</h1>
        <p className="text-sm text-nevoa">Guia de uso do painel — Reserva Secreta</p>
      </div>

      <section className="space-y-3">
        <h2 className="flex items-center space-x-2 text-lg font-display text-marfim">
          <UserPlus className="w-5 h-5 text-ouro" />
          <span>Como criar sua conta</span>
        </h2>
        <ol className="list-decimal list-inside space-y-1.5 text-sm text-nevoa marker:text-ouro">
          <li>No site, clique em <strong className="text-marfim">"Quero Anunciar"</strong>.</li>
          <li>Preencha nome, e-mail e senha (mínimo 8 caracteres).</li>
          <li>Informe idade, categoria (VIP, Mulheres ou Trans), cidade e WhatsApp.</li>
          <li>Clique em <strong className="text-marfim">"Criar conta e enviar para análise"</strong> — sua conta e seu anúncio são criados juntos.</li>
        </ol>
      </section>

      <section className="space-y-3">
        <h2 className="flex items-center space-x-2 text-lg font-display text-marfim">
          <ClipboardList className="w-5 h-5 text-ouro" />
          <span>O que acontece depois do cadastro</span>
        </h2>
        <p className="text-sm text-nevoa">
          Ao se cadastrar pelo formulário público, seu anúncio já é enviado automaticamente para análise. O status aparece na aba "Painel":
        </p>
        <div className="border border-white/10 divide-y divide-white/10">
          {STATUS.map((s) => (
            <div key={s.status} className="flex flex-col sm:flex-row sm:items-center gap-1 p-3 text-sm">
              <span className="sm:w-32 shrink-0 font-semibold text-marfim">{s.status}</span>
              <span className="text-nevoa">{s.significado}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="flex items-center space-x-2 text-lg font-display text-marfim">
          <UserRound className="w-5 h-5 text-ouro" />
          <span>Como editar seu perfil</span>
        </h2>
        <p className="text-sm text-nevoa">No painel, aba "Meu Perfil":</p>
        <ul className="list-disc list-inside space-y-1.5 text-sm text-nevoa marker:text-ouro">
          <li>Frase de destaque, sobre mim e valor/hora</li>
          <li>Bairro</li>
          <li>Ficha técnica: altura, peso, olhos, cabelo, silicone, tatuagens</li>
          <li>Idiomas, serviços e locais aceitos — digite separados por vírgula (ex: "Português, Inglês")</li>
        </ul>
        <p className="text-sm text-nevoa">Clique em <strong className="text-marfim">"Salvar alterações"</strong> ao terminar.</p>
      </section>

      <section className="space-y-3">
        <h2 className="flex items-center space-x-2 text-lg font-display text-marfim">
          <Images className="w-5 h-5 text-ouro" />
          <span>Como enviar e remover fotos</span>
        </h2>
        <p className="text-sm text-nevoa">Aba "Galeria": clique em "Adicionar foto".</p>
        <ul className="list-disc list-inside space-y-1.5 text-sm text-nevoa marker:text-ouro">
          <li>Até 10 fotos por perfil</li>
          <li>Formatos aceitos: JPG, PNG ou WEBP</li>
          <li>Tamanho máximo: 5MB por foto</li>
        </ul>
        <p className="text-sm text-nevoa">
          Toda foto nova entra como "Em análise" e só aparece no seu anúncio público depois de aprovada pelo gerente. Para remover uma foto, passe o mouse sobre ela e clique no ícone de lixeira que aparece no canto.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="flex items-center space-x-2 text-lg font-display text-marfim">
          <RefreshCw className="w-5 h-5 text-ouro" />
          <span>Como reenviar para análise</span>
        </h2>
        <p className="text-sm text-nevoa">Se seu anúncio for reprovado:</p>
        <ol className="list-decimal list-inside space-y-1.5 text-sm text-nevoa marker:text-ouro">
          <li>Ajuste o que for necessário na aba "Meu Perfil".</li>
          <li>Vá na aba "Painel".</li>
          <li>Clique em "Enviar para análise".</li>
        </ol>
        <p className="text-sm text-nevoa">Esse botão só aparece quando o status é Rascunho ou Reprovado.</p>
      </section>

      <section className="space-y-3">
        <h2 className="flex items-center space-x-2 text-lg font-display text-marfim">
          <ShieldCheck className="w-5 h-5 text-ouro" />
          <span>Verificação da conta</span>
        </h2>
        <p className="text-sm text-nevoa">
          A aba "Verificação" mostra três itens: e-mail validado, telefone verificado e documento. Por enquanto, o envio de documento pela própria plataforma ainda não está disponível — a equipe avisa separadamente quando esse passo for necessário.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="flex items-center space-x-2 text-lg font-display text-marfim">
          <LifeBuoy className="w-5 h-5 text-ouro" />
          <span>Dúvidas e suporte</span>
        </h2>
        <p className="text-sm text-nevoa">
          Se seu anúncio for suspenso por uma denúncia, ou se tiver qualquer dúvida sobre o cadastro, fotos ou pagamento, entre em contato diretamente com a equipe do Reserva Secreta.
        </p>
      </section>
    </div>
  );
};
