import { NavLink } from 'react-router-dom'
import { textos } from '../../lib/textos'

const esquerda = [
  { para: '/', rotulo: textos.navegacao.mural, icone: '💬' },
  { para: '/cinema', rotulo: textos.navegacao.cinema, icone: '🎬' },
]
// As abas Momentos e Perfil entram na Fase 4.
const direita = [{ para: '/ajustes', rotulo: textos.navegacao.ajustes, icone: '⚙️' }]

function Aba({ para, rotulo, icone }: { para: string; rotulo: string; icone: string }) {
  return (
    <NavLink
      to={para}
      end={para === '/'}
      className={({ isActive }) =>
        `flex flex-1 flex-col items-center gap-0.5 py-2.5 text-xs ${
          isActive ? 'text-rosa-suave' : 'text-cinza'
        }`
      }
    >
      <span aria-hidden>{icone}</span>
      {rotulo}
    </NavLink>
  )
}

/** Navegação inferior fixa com o botão central de publicar. */
export function BarraNavegacao() {
  return (
    <nav className="fixed inset-x-0 bottom-0 border-t border-linha bg-abismo/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
      <div className="mx-auto flex max-w-md items-center">
        {esquerda.map((aba) => (
          <Aba key={aba.para} {...aba} />
        ))}
        <NavLink
          to="/novo"
          aria-label={textos.novo.titulo}
          className="mx-2 -mt-4 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-rosa text-2xl text-neve shadow-lg"
        >
          +
        </NavLink>
        {direita.map((aba) => (
          <Aba key={aba.para} {...aba} />
        ))}
      </div>
    </nav>
  )
}
