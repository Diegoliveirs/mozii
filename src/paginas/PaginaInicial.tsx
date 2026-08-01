import { textos } from '../lib/textos'

/**
 * Página provisória da Fase 0 — confirma que o scaffold funciona de ponta a ponta.
 * Será substituída pelo Mural na Fase 3.
 */
export function PaginaInicial() {
  return (
    <main className="entrada-pagina mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-3 px-6 text-center">
      <h1 className="font-voz text-4xl text-neve">{textos.inicial.boasVindas}</h1>
      <p className="text-lg text-rosa-suave">{textos.app.slogan}</p>
      <p className="text-nevoa">{textos.inicial.descricao}</p>
      <p className="mt-6 rounded-full bg-cartao px-4 py-2 text-sm text-cinza">
        {textos.inicial.faseAtual}
      </p>
    </main>
  )
}
