import { useCasalComMembros } from '../hooks/useCasal'
import { textos } from '../lib/textos'

/**
 * Placeholder do Mural — o feed de verdade chega na Fase 3.
 * Já mostra o casal conectado (ou a dica do código, se falta o par).
 */
export function PaginaMural() {
  const { data, isLoading } = useCasalComMembros()

  return (
    <main className="px-5 pt-8">
      <h1 className="font-voz text-3xl text-neve">{textos.mural.titulo}</h1>

      {isLoading && <p className="mt-4 text-cinza">{textos.comuns.carregando}</p>}

      {data && (
        <>
          <p className="mt-1 text-rosa-suave">
            {textos.mural.juntos(data.membros.map((membro) => membro.nomeExibicao))}
          </p>
          {data.membros.length < 2 && (
            <p className="mt-4 rounded-xl bg-cartao p-4 text-sm text-nevoa">
              {textos.mural.esperandoPar}
            </p>
          )}
          <p className="mt-8 rounded-xl border border-linha p-4 text-center text-sm text-cinza">
            {textos.mural.emBreve}
          </p>
        </>
      )}
    </main>
  )
}
