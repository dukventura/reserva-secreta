-- Schema inicial do Reserva Secreta.
-- utf8mb4 em tudo: sem isso, nome com acento ou emoji em texto de bio
-- quebra silenciosamente em bancos MySQL antigos criados com latin1.

CREATE TABLE IF NOT EXISTS users (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  role          ENUM('master','gerente','profissional','contratante') NOT NULL,
  name          VARCHAR(120) NOT NULL,
  email         VARCHAR(190) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS professional_profiles (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id       INT UNSIGNED NOT NULL,
  slug          VARCHAR(140) NOT NULL,
  stage_name    VARCHAR(120) NOT NULL,
  age           TINYINT UNSIGNED NOT NULL,
  city          VARCHAR(60) NOT NULL,
  neighborhood  VARCHAR(120) NULL,
  category      ENUM('VIP','Mulheres','Trans') NOT NULL,
  tagline       VARCHAR(255) NULL,
  bio           TEXT NULL,
  -- Guardado como texto de exibicao ("R$ 350 / h") para bater com o
  -- front-end atual. Vira coluna numerica quando entrar cobranca por
  -- faixa de preco ou ordenacao por valor.
  hourly_rate   VARCHAR(40) NULL,
  whatsapp      VARCHAR(20) NOT NULL,
  status        ENUM('rascunho','pendente','aprovado','reprovado','suspenso') NOT NULL DEFAULT 'rascunho',
  is_vip        BOOLEAN NOT NULL DEFAULT FALSE,
  cover_image   VARCHAR(500) NULL,
  submitted_at  DATETIME NULL,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_profiles_slug (slug),
  UNIQUE KEY uq_profiles_user (user_id),
  CONSTRAINT fk_profiles_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS media (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  profile_id  INT UNSIGNED NOT NULL,
  url         VARCHAR(500) NOT NULL,
  position    SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  status      ENUM('pendente','aprovado','reprovado') NOT NULL DEFAULT 'pendente',
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_media_profile FOREIGN KEY (profile_id) REFERENCES professional_profiles(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS verifications (
  id                   INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id              INT UNSIGNED NOT NULL,
  email_confirmado     BOOLEAN NOT NULL DEFAULT FALSE,
  telefone_confirmado  BOOLEAN NOT NULL DEFAULT FALSE,
  documento_status     ENUM('pendente','aprovado','reprovado') NOT NULL DEFAULT 'pendente',
  documento_url        VARCHAR(500) NULL,
  revisado_por         INT UNSIGNED NULL,
  revisado_em          DATETIME NULL,
  updated_at           DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_verifications_user (user_id),
  CONSTRAINT fk_verifications_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_verifications_reviewer FOREIGN KEY (revisado_por) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS reports (
  id                 INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  target_profile_id  INT UNSIGNED NOT NULL,
  reporter_user_id   INT UNSIGNED NULL,
  reason             VARCHAR(80) NOT NULL,
  details            TEXT NOT NULL,
  status             ENUM('pendente','aprovado','reprovado') NOT NULL DEFAULT 'pendente',
  decided_by         INT UNSIGNED NULL,
  decided_at         DATETIME NULL,
  created_at         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_reports_profile FOREIGN KEY (target_profile_id) REFERENCES professional_profiles(id) ON DELETE CASCADE,
  CONSTRAINT fk_reports_reporter FOREIGN KEY (reporter_user_id) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT fk_reports_decider FOREIGN KEY (decided_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Imutavel por convencao de aplicacao (nunca fazer UPDATE/DELETE nesta
-- tabela pelo codigo) - e' o que sustenta a trilha de auditoria exigida
-- pela LGPD para dado sensivel.
CREATE TABLE IF NOT EXISTS audit_log (
  id             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  actor_user_id  INT UNSIGNED NULL,
  action         VARCHAR(160) NOT NULL,
  target         VARCHAR(255) NOT NULL,
  created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_audit_actor FOREIGN KEY (actor_user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
