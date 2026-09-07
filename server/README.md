# API do Reserva Secreta

Backend Node/Express + MySQL, feito para rodar em hospedagem
compartilhada via **Setup Node.js App** (Passenger) no cPanel — sem
Docker, sem Redis, sem servidor dedicado.

Por que **mysql2 + Kysely** em vez de um ORM como Prisma: Prisma
depende de um binário nativo que precisa bater exatamente com o
sistema operacional do servidor. Em hospedagem compartilhada não
controlamos isso, e um binário incompatível falha em produção sem
aviso em desenvolvimento. Kysely é só TypeScript — zero desse risco.

## Setup no cPanel (uma vez)

**1. Banco de dados** — `MySQL Databases`:
- Crie um banco (ex: `usuario_reservasecreta`)
- Crie um usuário e uma senha forte
- Adicione o usuário ao banco com **todos os privilégios**
- Anote: nome do banco, nome do usuário, senha (host geralmente é `localhost`)

**2. Aplicação Node** — `Setup Node.js App`:
- Node.js version: **18 ou mais recente**
- Application root: uma pasta *fora* da `public_html` (ex: `api`) — o
  código-fonte do backend não deve ficar num diretório servido
  publicamente pelo Apache/LiteSpeed
- Application URL: o subdomínio ou path que vai expor a API (ex:
  `api.reservasecreta.com.br` ou `reservasecreta.com.br/api`)
- Application startup file: `dist/index.js`
- Depois de criada, em **Environment variables**, adicione todas as
  chaves listadas em [`.env.example`](.env.example) — nunca crie um
  arquivo `.env` solto no servidor, use o formulário do painel

**3. Primeira implantação:**
```bash
npm install --omit=dev   # o botão "Run NPM Install" do painel faz isso
npm run build            # compila TypeScript para dist/
npm run migrate           # cria as tabelas (idempotente, seguro rodar de novo)
```
Depois disso, use o botão **Restart** do Setup Node.js App.

## Desenvolvimento local

```bash
cp .env.example .env   # preencha com um MySQL/MariaDB local
npm install
npm run migrate
npm run dev             # http://localhost:3001
```

## Rotas

| Rota | Papel exigido | O que faz |
|---|---|---|
| `POST /api/auth/register` | público | cria conta (só `profissional` ou `contratante` — `master`/`gerente` não se autocadastram) |
| `POST /api/auth/login` | público | e-mail + senha → token |
| `GET /api/auth/me` | qualquer logado | dados da própria conta |
| `GET /api/profiles` | público | diretório — só perfis `aprovado` |
| `GET /api/profiles/:slug` | público | perfil individual — só se `aprovado` |
| `GET /api/profiles/me` | profissional | o próprio perfil, qualquer status |
| `PATCH /api/profiles/me` | profissional | edita tagline/bio/valor |
| `POST /api/profiles/me/submit` | profissional | envia para a fila do gerente |
| `GET /api/moderation/profiles/pending` | gerente, master | fila de aprovação |
| `POST /api/moderation/profiles/:id/decide` | gerente, master | aprova/reprova |
| `GET /api/moderation/reports` | gerente, master | denúncias pendentes |
| `POST /api/moderation/reports/:id/decide` | gerente, master | decide denúncia — procedente **suspende o anúncio na hora** (Marco Civil art. 21: conteúdo íntimo sem consentimento não espera ordem judicial) |
| `GET /api/moderation/audit-log` | gerente, master | gerente vê só as próprias ações; master vê tudo |
| `POST /api/reports` | público (token opcional) | denúncia, inclusive anônima |

## O que ainda falta (fora do escopo desta leva)

- Rota administrativa para o master criar contas de `gerente` (hoje só via SQL direto)
- Upload de mídia (galeria de fotos, documento de verificação) — precisa de storage, não só banco
- Verificação por telefone/SMS — adiada por decisão: Fase 0 é e-mail/senha
- Conectar o front-end (`SessionContext`/`ModerationContext` hoje são só memória do navegador) a esta API
