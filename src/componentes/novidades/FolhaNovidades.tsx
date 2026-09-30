import type { NotaDeAtualizacao } from '../../dominio/tipos'
import { textos } from '../../lib/textos'
import { Botao } from '../ui/Botao'
import { FolhaBase } from '../ui/FolhaBase'
import { CartaoNota } from './CartaoNota'

/** A folha que sobe depois de atualizar: as notas novas e o "Bora ver". */
export function FolhaNovidades({
  notas,
  aoFechar,
}: {
  notas: readonly NotaDeAtualizacao[]
  aoFechar: () => void
}) {
  return (
    <FolhaBase rotulo={textos.novidades.rotuloNota} aoFechar={aoFechar}>
      <div className="space-y-10">
        {notas.map((nota) => (
          <CartaoNota key={nota.versao} nota={nota} sobre="superficie" />
        ))}
      </div>
      <Botao onClick={aoFechar} grande className="mt-8 w-full">
        {textos.novidades.fechar}
      </Botao>
    </FolhaBase>
  )
}
