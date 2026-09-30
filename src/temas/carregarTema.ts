import type { IdTema, TemaCompleto } from './contrato'
import { mesclarTema } from './mesclarTema'
import type { Registro } from './registro'

/**
 * Baixa o tema (código + CSS) e devolve sempre um tema completo. A base
 * carrega ANTES do evento, para o CSS do evento entrar depois e vencer.
 */
export async function carregarTema(id: IdTema, registro: Registro): Promise<TemaCompleto> {
  const entrada = registro[id]
  if (!('base' in entrada)) return entrada.carregar()

  const base = await carregarTema(entrada.base, registro)
  return mesclarTema(base, await entrada.carregar())
}
