-- Campos de ficha tecnica que o front-end publico sempre exibiu, mas
-- que so existiam em dado mockado: altura, peso, olhos, cabelo,
-- idiomas, silicone, tatuagens, servicos e locais aceitos. `IF NOT
-- EXISTS` (suportado pelo MariaDB) mantem o mesmo runner idempotente
-- que ja existe, sem precisar de uma ferramenta de migracao up/down
-- so por causa deste ALTER TABLE.

ALTER TABLE professional_profiles
  ADD COLUMN IF NOT EXISTS height    VARCHAR(20)  NULL AFTER neighborhood,
  ADD COLUMN IF NOT EXISTS weight    VARCHAR(20)  NULL AFTER height,
  ADD COLUMN IF NOT EXISTS eyes      VARCHAR(60)  NULL AFTER weight,
  ADD COLUMN IF NOT EXISTS hair      VARCHAR(60)  NULL AFTER eyes,
  -- JSON no MariaDB e' um alias de LONGTEXT com CHECK(JSON_VALID(..)):
  -- armazena um array de strings, ex: '["Português","Inglês"]'.
  ADD COLUMN IF NOT EXISTS languages JSON         NULL AFTER hair,
  ADD COLUMN IF NOT EXISTS silicone  VARCHAR(60)  NULL AFTER languages,
  ADD COLUMN IF NOT EXISTS tattoos   VARCHAR(60)  NULL AFTER silicone,
  ADD COLUMN IF NOT EXISTS services  JSON         NULL AFTER tattoos,
  ADD COLUMN IF NOT EXISTS locations JSON         NULL AFTER services;
