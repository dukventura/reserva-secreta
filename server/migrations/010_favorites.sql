-- Favoritos da conta de cliente (contratante) - unica funcionalidade
-- real que essa conta tinha depois do login era nenhuma; isso da um
-- motivo pra criar conta em vez de so navegar anonimo.
CREATE TABLE IF NOT EXISTS favorites (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id     INT UNSIGNED NOT NULL,
  profile_id  INT UNSIGNED NOT NULL,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_favorites_user_profile (user_id, profile_id),
  CONSTRAINT fk_favorites_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_favorites_profile FOREIGN KEY (profile_id) REFERENCES professional_profiles(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
