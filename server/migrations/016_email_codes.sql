-- Codigos de 6 digitos enviados por e-mail: confirmacao do e-mail no
-- cadastro e recuperacao de senha. Guarda so' o hash do codigo; cada
-- codigo vale 30 min, aceita poucas tentativas e e' usado uma vez.
CREATE TABLE IF NOT EXISTS email_codes (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id     INT UNSIGNED NOT NULL,
  tipo        ENUM('confirmacao','senha') NOT NULL,
  code_hash   CHAR(64) NOT NULL,
  expires_at  DATETIME NOT NULL,
  tentativas  TINYINT UNSIGNED NOT NULL DEFAULT 0,
  usado_em    DATETIME NULL,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_email_codes_user_tipo (user_id, tipo),
  CONSTRAINT fk_email_codes_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
