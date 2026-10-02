-- Controle de mensalidade VIP. Sem gateway de pagamento integrado
-- ainda (decisao em aberto - risco de MCC com adquirentes
-- tradicionais pra esse nicho) - o Admin Master registra o pagamento
-- manualmente (PIX fora do site) e o sistema cuida sozinho de marcar
-- como vencido e tirar o selo VIP quando a data passar.
CREATE TABLE IF NOT EXISTS subscriptions (
  id                   INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id              INT UNSIGNED NOT NULL,
  status               ENUM('ativo','vencido','cancelado') NOT NULL DEFAULT 'ativo',
  vence_em             DATE NOT NULL,
  ultimo_pagamento_em  DATE NOT NULL,
  registrado_por       INT UNSIGNED NULL,
  created_at           DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at           DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_subscriptions_user (user_id),
  CONSTRAINT fk_subscriptions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_subscriptions_registrado_por FOREIGN KEY (registrado_por) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
