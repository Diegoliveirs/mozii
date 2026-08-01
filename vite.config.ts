import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Configuração mínima de propósito: cada plugin extra é uma coisa a mais para manter.
// O plugin de PWA entra na Fase 0 (ver docs/07-deploy-e-ambientes.md).
export default defineConfig({
  plugins: [react(), tailwindcss()],
})
