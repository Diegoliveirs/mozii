import { textos } from '../../lib/textos'
import type { TemaCompleto } from '../contrato'
import { BarraNavegacao } from './componentes/BarraNavegacao'
import { CabecalhoPagina } from './componentes/CabecalhoPagina'
import { TelaAbertura } from './componentes/TelaAbertura'
import './fontes.css'
import './tokens.css'

export const tema: TemaCompleto = {
  id: 'classico',
  componentes: {
    BarraNavegacao,
    CabecalhoPagina,
    TelaAbertura,
    CamadaAderecos: () => null,
  },
  encaixes: {},
  textos: textos.temas.classico,
}
