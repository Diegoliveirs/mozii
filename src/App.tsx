import { Navigate, Route, Routes } from 'react-router-dom'
import { PaginaInicial } from './paginas/PaginaInicial'

/**
 * Mapa de rotas do app. Na Fase 1 entram as guardas
 * ExigirAutenticacao e ExigirCasal envolvendo as rotas privadas.
 */
export function App() {
  return (
    <Routes>
      <Route path="/" element={<PaginaInicial />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
