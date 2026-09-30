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
import { aoTrocarDeConta } from './lib/trocaDeConta'
import { travarZoom } from './lib/travarZoom'
import { aplicarTema } from './temas/aplicarTema'
import { carregarTema } from './temas/carregarTema'
import { ProvedorTema } from './temas/ProvedorTema'
import { TEMA_PADRAO, registro } from './temas/registro'
import { pilhaDoTema, resolverTema } from './temas/resolverTema'
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
  // O tema resolve e carrega ANTES de montar: nada pinta com o tema errado.
  // `?tema=natal` na URL pré-visualiza um tema fora da janela de datas.
  const pedido = new URLSearchParams(window.location.search).get('tema')
  const idTema = resolverTema(new Date(), registro, TEMA_PADRAO, pedido)
  const tema = await carregarTema(idTema, registro)
  aplicarTema(pilhaDoTema(idTema, registro))

  if (faltando.length > 0) {
    createRoot(raiz).render(
      <StrictMode>
        <ProvedorTema tema={tema}>
          <FaltaConfiguracao faltando={faltando} />
        </ProvedorTema>
      </StrictMode>,
    )
    return
  }

  const { criarRepositoriosSupabase } = await import('./dados/supabase/indice')
  const repositorios = criarRepositoriosSupabase()

  // Conta nova = cache zerado, venha a troca de onde vier (botão Sair, logout
  // em outra aba, sessão expirada): dados de uma conta nunca aparecem na outra.
  repositorios.autenticacao.aoMudarAutenticacao(aoTrocarDeConta(() => clienteQuery.clear()))

  createRoot(raiz).render(
    <StrictMode>
      <ProvedorTema tema={tema}>
        <QueryClientProvider client={clienteQuery}>
          <ProvedorRepositorios repositorios={repositorios}>
            <BrowserRouter>
              <ProvedorAvisos>
                <App />
                <AvisoAtualizacao />
              </ProvedorAvisos>
            </BrowserRouter>
          </ProvedorRepositorios>
        </QueryClientProvider>
      </ProvedorTema>
    </StrictMode>,
  )
}

void iniciar()
