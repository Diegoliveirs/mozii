import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { App } from './App'
import { FaltaConfiguracao } from './componentes/ui/FaltaConfiguracao'
import { variaveisFaltando } from './lib/ambiente'
import './index.css'

// Estado de servidor fica no TanStack Query; 30s de frescor evita
// refetch em cascata ao navegar entre páginas.
const clienteQuery = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: 1 },
  },
})

const faltando = variaveisFaltando()
const raiz = document.getElementById('raiz')!

createRoot(raiz).render(
  <StrictMode>
    {faltando.length > 0 ? (
      <FaltaConfiguracao faltando={faltando} />
    ) : (
      <QueryClientProvider client={clienteQuery}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </QueryClientProvider>
    )}
  </StrictMode>,
)
