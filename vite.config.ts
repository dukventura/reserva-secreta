import { defineConfig } from 'vite'
import react from '@vitejs/react-refresh' // ou o plugin que estiver usando

export default defineConfig({
  base: '/guia-prime/', // <--- ADICIONE ESSA LINHA AQUI
  {
  "name": "guia-prime",
  "homepage": "https://github.io",
  "private": true,
  ...
}

  plugins: [react()],
  // mantenha o restante das configurações que já existirem abaixo
})
