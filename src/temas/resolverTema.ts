import type { IdTema } from './contrato'
import type { Registro } from './registro'

/** 'MM-DD' de uma data, no fuso do aparelho. */
function mesDia(data: Date): string {
  const mes = String(data.getMonth() + 1).padStart(2, '0')
  const dia = String(data.getDate()).padStart(2, '0')
  return `${mes}-${dia}`
}

/** Janela anual inclusiva; se `inicio` > `fim`, ela atravessa o ano novo. */
export function dentroDaJanela(hoje: string, inicio: string, fim: string): boolean {
  return inicio <= fim ? hoje >= inicio && hoje <= fim : hoje >= inicio || hoje <= fim
}

/**
 * Qual tema vale agora: o pedido pela URL (`?tema=`) se existir no
 * registro; senão o primeiro evento cuja janela contém hoje; senão o padrão.
 */
export function resolverTema(
  agora: Date,
  registro: Registro,
  padrao: IdTema,
  pedido?: string | null,
): IdTema {
  if (pedido && Object.hasOwn(registro, pedido)) return pedido as IdTema

  const hoje = mesDia(agora)
  const evento = (Object.keys(registro) as IdTema[]).find((id) => {
    const entrada = registro[id]
    return 'base' in entrada && dentroDaJanela(hoje, entrada.inicio, entrada.fim)
  })
  return evento ?? padrao
}

/** A pilha de temas ativos: a base primeiro, o evento por cima. */
export function pilhaDoTema(id: IdTema, registro: Registro): IdTema[] {
  const entrada = registro[id]
  return 'base' in entrada ? [entrada.base, id] : [id]
}
