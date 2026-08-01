import { NavLink } from 'react-router-dom'
import { textos } from '../../lib/textos'

const abas = [
  { para: '/', rotulo: textos.navegacao.mural, icone: '💬' },
  { para: '/ajustes', rotulo: textos.navegacao.ajustes, icone: '⚙️' },
  // As abas Cinema, Momentos e Perfil entram nas Fases 2–4.
]

/** Navegação inferior fixa, estilo app nativo. */
export function BarraNavegacao() {
  return (
    <nav className="fixed inset-x-0 bottom-0 border-t border-linha bg-abismo/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
      <div className="mx-auto flex max-w-md">
        {abas.map((aba) => (
          <NavLink
            key={aba.para}
            to={aba.para}
            end={aba.para === '/'}
            className={({ isActive }) =>
              `flex flex-1 flex-col items-center gap-0.5 py-2.5 text-xs ${
                isActive ? 'text-rosa-suave' : 'text-cinza'
              }`
            }
          >
            <span aria-hidden>{aba.icone}</span>
            {aba.rotulo}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
