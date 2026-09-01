import { Navigate, Route, Routes } from 'react-router-dom'
import { ExigirAutenticacao } from './componentes/guardas/ExigirAutenticacao'
import { ExigirCasal } from './componentes/guardas/ExigirCasal'
import { CascaApp } from './componentes/layout/CascaApp'
import { PaginaAjustes } from './paginas/PaginaAjustes'
import { PaginaCadastro } from './paginas/PaginaCadastro'
import { PaginaConfirmarEmail } from './paginas/PaginaConfirmarEmail'
import { PaginaCinema } from './paginas/PaginaCinema'
import { PaginaEntrar } from './paginas/PaginaEntrar'
import { PaginaFilme } from './paginas/PaginaFilme'
import { PaginaLista } from './paginas/PaginaLista'
import { PaginaMomentos } from './paginas/PaginaMomentos'
import { PaginaMural } from './paginas/PaginaMural'
import { PaginaNovaPublicacao } from './paginas/PaginaNovaPublicacao'
import { PaginaPerfil } from './paginas/PaginaPerfil'
import { PaginaParear } from './paginas/PaginaParear'
import { PaginaPublicacao } from './paginas/PaginaPublicacao'
import { PaginaSessoes } from './paginas/PaginaSessoes'

/**
 * Mapa de rotas. Aninhamento das guardas:
 * público → ExigirAutenticacao → /parear → ExigirCasal → CascaApp → páginas.
 */
export function App() {
  return (
    <Routes>
      <Route path="/entrar" element={<PaginaEntrar />} />
      <Route path="/cadastro" element={<PaginaCadastro />} />
      <Route path="/confirmar-email" element={<PaginaConfirmarEmail />} />

      <Route element={<ExigirAutenticacao />}>
        <Route path="/parear" element={<PaginaParear />} />

        <Route element={<ExigirCasal />}>
          <Route element={<CascaApp />}>
            <Route path="/" element={<PaginaMural />} />
            <Route path="/novo" element={<PaginaNovaPublicacao />} />
            <Route path="/publicacao/:publicacaoId" element={<PaginaPublicacao />} />
            <Route path="/cinema" element={<PaginaCinema />} />
            <Route path="/cinema/sessoes" element={<PaginaSessoes />} />
            <Route path="/filme/:tmdbId" element={<PaginaFilme />} />
            <Route path="/listas/:listaId" element={<PaginaLista />} />
            <Route path="/momentos" element={<PaginaMomentos />} />
            <Route path="/perfil" element={<PaginaPerfil />} />
            <Route path="/perfil/:membroId" element={<PaginaPerfil />} />
            <Route path="/ajustes" element={<PaginaAjustes />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
