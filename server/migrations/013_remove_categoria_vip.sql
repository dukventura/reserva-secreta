-- Categoria "VIP" sai da lista de opcoes - so restam Mulheres e Trans.
-- "VIP" como selo/prioridade de quem paga um plano continua existindo
-- (professional_profiles.is_vip), isso aqui e' so' a categoria do
-- anuncio (que seção ele aparece), coisa diferente.
UPDATE professional_profiles SET category = 'Mulheres' WHERE category = 'VIP';

ALTER TABLE professional_profiles
  MODIFY COLUMN category ENUM('Mulheres','Trans') NOT NULL;
