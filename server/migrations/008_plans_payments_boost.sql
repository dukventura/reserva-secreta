-- Planos configuraveis pelo Admin Master, historico de pagamentos e
-- impulso avulso. Tudo idempotente: o runner reaplica todos os
-- arquivos a cada deploy.

CREATE TABLE IF NOT EXISTS plans (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nome            VARCHAR(60) NOT NULL,
  preco_centavos  INT UNSIGNED NOT NULL,
  duracao_dias    SMALLINT UNSIGNED NOT NULL,
  max_fotos       TINYINT UNSIGNED NOT NULL,
  -- Maior = aparece antes na listagem da cidade.
  prioridade      TINYINT UNSIGNED NOT NULL DEFAULT 0,
  selo_vip        BOOLEAN NOT NULL DEFAULT TRUE,
  ativo           BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Plano VIP que ja era cobrado manualmente vira o primeiro registro.
INSERT INTO plans (id, nome, preco_centavos, duracao_dias, max_fotos, prioridade, selo_vip)
VALUES (1, 'VIP', 8900, 30, 12, 10, TRUE)
ON DUPLICATE KEY UPDATE id = id;

CREATE TABLE IF NOT EXISTS payments (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id         INT UNSIGNED NOT NULL,
  tipo            ENUM('plano','impulso') NOT NULL,
  plan_id         INT UNSIGNED NULL,
  valor_centavos  INT UNSIGNED NOT NULL,
  dias            SMALLINT UNSIGNED NOT NULL,
  observacao      VARCHAR(500) NULL,
  registrado_por  INT UNSIGNED NULL,
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_payments_user (user_id),
  KEY idx_payments_created (created_at),
  CONSTRAINT fk_payments_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_payments_plan FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE SET NULL,
  CONSTRAINT fk_payments_registrado_por FOREIGN KEY (registrado_por) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

ALTER TABLE subscriptions
  ADD COLUMN IF NOT EXISTS plan_id INT UNSIGNED NULL AFTER user_id;

-- Assinaturas criadas antes dos planos existirem eram todas VIP.
UPDATE subscriptions SET plan_id = 1 WHERE plan_id IS NULL;

-- Desnormalizado no perfil pra listagem publica ordenar sem join:
-- prioridade vem do plano ativo (zera quando vence), boost_ate e' o
-- impulso avulso (vale enquanto estiver no futuro, sem precisar de cron).
ALTER TABLE professional_profiles
  ADD COLUMN IF NOT EXISTS prioridade TINYINT UNSIGNED NOT NULL DEFAULT 0 AFTER is_vip,
  ADD COLUMN IF NOT EXISTS boost_ate DATETIME NULL AFTER prioridade;
