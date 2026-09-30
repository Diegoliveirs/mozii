import type { ComponentType, ReactNode } from 'react'
import type { AbaNavegacao } from './comum/abasNavegacao'

/**
 * O contrato de um tema. Um tema é um pacote completo — tokens (CSS),
 * componentes estruturais (slots), adereços, textos e assets — e só
 * RENDERIZA: dados, rotas, a11y e textos vêm de lugares compartilhados.
 */

/** Um id por tema. Criar um tema novo começa por esta linha. */
export type IdTema = 'classico' | 'noir'

/** Pontos fixos onde um tema pode prender um enfeite. */
export type NomeEncaixe = 'ingresso-canto' | 'mural-topo'

export interface PropsBarraNavegacao {
  /** As abas de destino, na ordem em que aparecem. */
  abas: AbaNavegacao[]
  /** A ação central de publicar. */
  abaNova: AbaNavegacao
}

export interface PropsCabecalhoPagina {
  titulo: string
  /** Para onde o voltar leva quando não há histórico (ex.: '/cinema'). */
  fallback: string
  /** Conteúdo opcional alinhado à direita (ex.: engrenagem). */
  acao?: ReactNode
}

/** Os slots: componentes que cada tema desenha do seu jeito. */
export interface ComponentesTema {
  BarraNavegacao: ComponentType<PropsBarraNavegacao>
  CabecalhoPagina: ComponentType<PropsCabecalhoPagina>
  TelaAbertura: ComponentType
  /** Decoração sobre a tela inteira (neve, luzinhas…). Sem adereço: `() => null`. */
  CamadaAderecos: ComponentType
}

/** Microcopy que varia por tema. Os textos em si moram em `lib/textos.ts`. */
export interface TextosTema {
  saudacao: (nomes: string[]) => string
}

/** Tema completo: implementa todos os slots. Pode ser o padrão ou uma base. */
export interface TemaCompleto {
  id: IdTema
  componentes: ComponentesTema
  encaixes: Partial<Record<NomeEncaixe, ComponentType>>
  textos: TextosTema
}

/** Tema de evento: sobrescreve só o que muda; o resto vem da base. */
export interface TemaParcial {
  id: IdTema
  componentes?: Partial<ComponentesTema>
  encaixes?: Partial<Record<NomeEncaixe, ComponentType>>
  textos?: Partial<TextosTema>
}
