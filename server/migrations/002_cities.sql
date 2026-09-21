-- Tabela de cidades atendidas. Antes disso, o backend validava o
-- cadastro contra um ENUM fixo (Ilicínea/Boa Esperança) direto no
-- código do registro — expandir para uma cidade nova exigia mexer em
-- código e reimplantar. Agora é uma linha nesta tabela.

CREATE TABLE IF NOT EXISTS cities (
  id     INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  slug   VARCHAR(80) NOT NULL,
  name   VARCHAR(60) NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  UNIQUE KEY uq_cities_slug (slug),
  UNIQUE KEY uq_cities_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT IGNORE INTO cities (slug, name) VALUES
  ('ilicinea', 'Ilicínea'),
  ('boa-esperanca', 'Boa Esperança');
