import { NavLink } from 'react-router-dom'
import { textos } from '../../lib/textos'
import {
  IconeCinema,
  IconeMais,
  IconeMomentos,
  IconeMural,
  IconePerfil,
  type PropsIcone,
} from '../ui/icones'

type ComponenteIcone = (props: PropsIcone) => React.ReactNode

const esquerda: { para: string; rotulo: string; Icone: ComponenteIcone }[] = [
  { para: '/', rotulo: textos.navegacao.mural, Icone: IconeMural },
  { para: '/cinema', rotulo: textos.navegacao.cinema, Icone: IconeCinema },
]
// Ajustes mora na engrenagem do Perfil (como o resto que é "de conta").
const direita: { para: string; rotulo: string; Icone: ComponenteIcone }[] = [
  { para: '/momentos', rotulo: textos.navegacao.momentos, Icone: IconeMomentos },
  { para: '/perfil', rotulo: textos.navegacao.perfil, Icone: IconePerfil },
]

function Aba({ para, rotulo, Icone }: { para: string; rotulo: string; Icone: ComponenteIcone }) {
  return (
    <NavLink
      to={para}
      end={para === '/'}
      className={({ isActive }) =>
        `flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] ${
          isActive ? 'text-rosa-suave' : 'text-cinza'
        }`
      }
    >
      {({ isActive }) => (
        <>
          {/* Peso fill na aba ativa: convenção de app nativo */}
          <Icone size={22} weight={isActive ? 'fill' : 'regular'} aria-hidden />
          {rotulo}
        </>
      )}
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
          className="mx-2 -mt-4 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-rosa text-neve shadow-cartao transition-transform active:scale-95"
        >
          <IconeMais size={24} weight="bold" aria-hidden />
        </NavLink>
        {direita.map((aba) => (
          <Aba key={aba.para} {...aba} />
        ))}
      </div>
    </nav>
  )
}
