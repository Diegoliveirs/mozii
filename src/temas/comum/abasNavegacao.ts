import type { ReactNode } from 'react'
import {
  IconeCinema,
  IconeMais,
  IconeMomentos,
  IconeMural,
  IconePerfil,
  type PropsIcone,
} from '../../componentes/ui/icones'
import { textos } from '../../lib/textos'

export interface AbaNavegacao {
  para: string
  rotulo: string
  Icone: (props: PropsIcone) => ReactNode
}

/** Os destinos da navegação — definidos uma vez, desenhados por cada tema. */
export const abasNavegacao: AbaNavegacao[] = [
  { para: '/', rotulo: textos.navegacao.mural, Icone: IconeMural },
  { para: '/cinema', rotulo: textos.navegacao.cinema, Icone: IconeCinema },
  // Ajustes mora na engrenagem do Perfil (como o resto que é "de conta").
  { para: '/momentos', rotulo: textos.navegacao.momentos, Icone: IconeMomentos },
  { para: '/perfil', rotulo: textos.navegacao.perfil, Icone: IconePerfil },
]

/** A ação central de publicar. */
export const abaNovaPublicacao: AbaNavegacao = {
  para: '/novo',
  rotulo: textos.novo.titulo,
  Icone: IconeMais,
}
