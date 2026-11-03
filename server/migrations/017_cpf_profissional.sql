-- Um cadastro de anunciante por CPF. O CPF completo nunca e' gravado:
-- cpf_hash (HMAC com chave do servidor) serve so' pra detectar
-- duplicidade, e cpf_mascara (digitos do meio) pro gerente conferir
-- com o documento enviado.
ALTER TABLE professional_profiles
  ADD COLUMN IF NOT EXISTS cpf_hash CHAR(64) NULL AFTER whatsapp,
  ADD COLUMN IF NOT EXISTS cpf_mascara VARCHAR(14) NULL AFTER cpf_hash,
  ADD UNIQUE INDEX IF NOT EXISTS uq_profiles_cpf_hash (cpf_hash);
