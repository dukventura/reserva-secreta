import React from 'react';
import { LogIn, ClipboardCheck, Images, Flag, History, Users, Wallet } from 'lucide-react';

export const ManualAdminPage: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-16 space-y-10">
      <div className="space-y-2">
        <h1 className="text-3xl font-display font-normal text-marfim">Manual do Painel Administrativo</h1>
        <p className="text-sm text-nevoa">Guia para Gerente e Admin Master — Reserva Secreta</p>
      </div>

      <section className="space-y-3">
        <h2 className="flex items-center space-x-2 text-lg font-display text-marfim">
          <LogIn className="w-5 h-5 text-ouro" />
          <span>Como entrar</span>
        </h2>
        <ol className="list-decimal list-inside space-y-1.5 text-sm text-nevoa marker:text-ouro">
          <li>Acesse reservasecreta.com.br/entrar</li>
          <li>Digite e-mail e senha</li>
          <li>Clique em "Entrar"</li>
        </ol>
        <p className="text-sm text-nevoa">
          Você é direcionado automaticamente pro painel do seu papel: <strong className="text-marfim">Gerente</strong> vai para o painel de moderação; <strong className="text-marfim">Admin Master</strong> vai para o painel administrativo (e também pode acessar o painel do gerente a qualquer momento).
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="flex items-center space-x-2 text-lg font-display text-marfim">
          <ClipboardCheck className="w-5 h-5 text-ouro" />
          <span>Aprovar ou reprovar anúncios</span>
        </h2>
        <p className="text-sm text-nevoa">
          Aba "Aprovações": lista todos os anúncios com status "Em análise", com foto, nome, idade, categoria, cidade, WhatsApp e data de envio.
        </p>
        <ul className="list-disc list-inside space-y-1.5 text-sm text-nevoa marker:text-ouro">
          <li><strong className="text-marfim">Aprovar</strong>: o anúncio fica visível imediatamente no catálogo público</li>
          <li><strong className="text-marfim">Reprovar</strong>: a profissional é avisada no próprio painel dela e pode editar e reenviar</li>
        </ul>
        <p className="text-sm text-nevoa">Toda decisão fica registrada no Histórico.</p>
      </section>

      <section className="space-y-3">
        <h2 className="flex items-center space-x-2 text-lg font-display text-marfim">
          <Images className="w-5 h-5 text-ouro" />
          <span>Aprovar ou reprovar fotos</span>
        </h2>
        <p className="text-sm text-nevoa">
          Aba "Fotos": mostra cada foto enviada por profissionais, junto com o nome do perfil e a data de envio.
        </p>
        <ul className="list-disc list-inside space-y-1.5 text-sm text-nevoa marker:text-ouro">
          <li><strong className="text-marfim">Aprovar</strong>: a foto passa a aparecer na galeria pública do perfil</li>
          <li><strong className="text-marfim">Reprovar</strong>: o arquivo é apagado do servidor e some da galeria da profissional</li>
        </ul>
        <p className="text-sm text-nevoa">Cada perfil pode ter no máximo 10 fotos aprovadas.</p>
      </section>

      <section className="space-y-3">
        <h2 className="flex items-center space-x-2 text-lg font-display text-marfim">
          <Flag className="w-5 h-5 text-ouro" />
          <span>Denúncias</span>
        </h2>
        <p className="text-sm text-nevoa">
          Aba "Denúncias": lista denúncias abertas contra anúncios (podem ser anônimas). Mostra o motivo, o anúncio denunciado e a descrição enviada.
        </p>
        <ul className="list-disc list-inside space-y-1.5 text-sm text-nevoa marker:text-ouro">
          <li>
            <strong className="text-marfim">Procede — suspender anúncio</strong>: o anúncio é suspenso na hora, automaticamente. Essa ação segue o Marco Civil da Internet (art. 21): denúncia de conteúdo íntimo sem consentimento não espera ordem judicial — a remoção é imediata assim que a notificação é aceita
          </li>
          <li><strong className="text-marfim">Arquivar</strong>: a denúncia é encerrada sem ação no anúncio</li>
        </ul>
        <p className="text-sm text-nevoa">Um anúncio suspenso só volta ao ar com intervenção manual da equipe.</p>
      </section>

      <section className="space-y-3">
        <h2 className="flex items-center space-x-2 text-lg font-display text-marfim">
          <History className="w-5 h-5 text-ouro" />
          <span>Histórico e Log de Auditoria</span>
        </h2>
        <ul className="list-disc list-inside space-y-1.5 text-sm text-nevoa marker:text-ouro">
          <li><strong className="text-marfim">Gerente</strong> (aba "Histórico"): vê somente as próprias ações de moderação</li>
          <li><strong className="text-marfim">Admin Master</strong> (aba "Log de Auditoria"): vê o histórico completo de todos os membros da equipe, incluindo criação de contas</li>
        </ul>
        <p className="text-sm text-nevoa">Cada registro mostra quem fez, o quê, sobre qual anúncio/foto/denúncia, e quando.</p>
      </section>

      <section className="space-y-3">
        <h2 className="flex items-center space-x-2 text-lg font-display text-marfim">
          <Users className="w-5 h-5 text-ouro" />
          <span>Gestão de equipe (só Admin Master)</span>
        </h2>
        <p className="text-sm text-nevoa">Aba "Equipe": mostra todos os membros com acesso administrativo (gerentes e masters).</p>
        <p className="text-sm text-nevoa">Para adicionar alguém:</p>
        <ol className="list-decimal list-inside space-y-1.5 text-sm text-nevoa marker:text-ouro">
          <li>Clique em "Adicionar membro"</li>
          <li>Preencha nome, e-mail e uma senha provisória</li>
          <li>Escolha o papel: Gerente ou Admin Master</li>
          <li>Clique em "Criar conta"</li>
        </ol>
        <p className="text-sm text-nevoa">
          A pessoa já pode entrar imediatamente com essas credenciais. Não existe hoje uma tela de troca de senha pela própria conta — combine a senha provisória diretamente com a pessoa.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="flex items-center space-x-2 text-lg font-display text-marfim">
          <Wallet className="w-5 h-5 text-ouro" />
          <span>Financeiro (só Admin Master)</span>
        </h2>
        <p className="text-sm text-nevoa">Aba "Financeiro": mostra os planos disponíveis (Base, VIP, Boost avulso) e números ilustrativos de assinantes e receita.</p>
        <p className="text-sm text-nevoa">Esses números ainda são manuais/ilustrativos — não existe cobrança automatizada. Pagamentos são combinados e conciliados diretamente via PIX com cada profissional.</p>
      </section>
    </div>
  );
};
