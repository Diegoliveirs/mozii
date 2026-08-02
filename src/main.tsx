import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { App } from './App'
import { ProvedorRepositorios } from './dados/ContextoRepositorios'
import { AvisoAtualizacao } from './componentes/ui/AvisoAtualizacao'
import { ProvedorAvisos } from './componentes/ui/Avisos'
import { FaltaConfiguracao } from './componentes/ui/FaltaConfiguracao'
import { variaveisFaltando } from './lib/ambiente'
import { travarZoom } from './lib/travarZoom'
import './index.css'

travarZoom()

// Estado de servidor fica no TanStack Query; 30s de frescor evita
// refetch em cascata ao navegar entre páginas.
const clienteQuery = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: 1 },
  },
})

const faltando = variaveisFaltando()
const raiz = document.getElementById('raiz')!

// O import da fábrica é dinâmico DEPOIS da checagem de ambiente:
// criar o cliente Supabase sem URL derrubaria o app antes da tela de ajuda.
async function iniciar() {
  if (faltando.length > 0) {
    createRoot(raiz).render(
      <StrictMode>
        <FaltaConfiguracao faltando={faltando} />
      </StrictMode>,
    )
    return
  }

  const { criarRepositoriosSupabase } = await import('./dados/supabase/indice')

  createRoot(raiz).render(
    <StrictMode>
      <QueryClientProvider client={clienteQuery}>
        <ProvedorRepositorios repositorios={criarRepositoriosSupabase()}>
          <BrowserRouter>
            <ProvedorAvisos>
              <App />
              <AvisoAtualizacao />
            </ProvedorAvisos>
          </BrowserRouter>
        </ProvedorRepositorios>
      </QueryClientProvider>
    </StrictMode>,
  )
}

void iniciar()
