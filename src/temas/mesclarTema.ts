import type { TemaCompleto, TemaParcial } from './contrato'

/** O tema de evento por cima da base: o que ele não define, a base fornece. */
export function mesclarTema(base: TemaCompleto, evento: TemaParcial): TemaCompleto {
  return {
    id: evento.id,
    componentes: { ...base.componentes, ...evento.componentes },
    encaixes: { ...base.encaixes, ...evento.encaixes },
    textos: { ...base.textos, ...evento.textos },
  }
}
