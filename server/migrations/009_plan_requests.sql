-- Pedido de plano feito pela propria profissional (botao "Solicitar
-- este plano" na aba Plano) - antes disso, pedir um plano so' existia
-- como mensagem informal de WhatsApp, sem nenhum registro no sistema.
CREATE TABLE IF NOT EXISTS plan_requests (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id      INT UNSIGNED NOT NULL,
  plan_id      INT UNSIGNED NOT NULL,
  status       ENUM('pendente','atendido','recusado','cancelado') NOT NULL DEFAULT 'pendente',
  created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  resolved_at  DATETIME NULL,
  resolved_by  INT UNSIGNED NULL,
  KEY idx_plan_requests_user (user_id),
  KEY idx_plan_requests_status (status),
  CONSTRAINT fk_plan_requests_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_plan_requests_plan FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE CASCADE,
  CONSTRAINT fk_plan_requests_resolved_by FOREIGN KEY (resolved_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
