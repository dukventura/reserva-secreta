-- Contador de rate limit compartilhado entre processos. O
-- MemoryStore padrao do express-rate-limit nao serve aqui porque o
-- Passenger desta hospedagem roda mais de uma instancia do processo
-- Node por tras do mesmo app - cada uma teria sua propria contagem na
-- memoria, e o limite nunca fecharia de verdade.

CREATE TABLE IF NOT EXISTS rate_limits (
  rl_key    VARCHAR(255) NOT NULL PRIMARY KEY,
  count     INT UNSIGNED NOT NULL DEFAULT 1,
  reset_at  DATETIME NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
