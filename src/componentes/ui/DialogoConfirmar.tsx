import { textos } from '../../lib/textos'
import { Botao } from './Botao'
import { ModalBase } from './ModalBase'

/**
 * Confirmação para ações sérias (excluir publicação, sair do espaço…).
 * `perigosa` pinta o botão de confirmação com a cor de erro — rosa é
 * afeto, nunca destruição.
 */
export function DialogoConfirmar({
  aberto,
  titulo,
  descricao,
  rotuloConfirmar,
  perigosa = false,
  confirmando = false,
  aoConfirmar,
  aoCancelar,
}: {
  aberto: boolean
  titulo: string
  descricao: string
  rotuloConfirmar: string
  perigosa?: boolean
  confirmando?: boolean
  aoConfirmar: () => void
  aoCancelar: () => void
}) {
  if (!aberto) return null

  return (
    <ModalBase rotulo={titulo} aoFechar={aoCancelar} className="max-w-sm">
      <h2 className="font-titulo text-xl text-texto">{titulo}</h2>
      <p className="mt-2 text-sm text-texto-secundario">{descricao}</p>
      <div className="mt-5 flex gap-3">
        <Botao variante="fantasma" onClick={aoCancelar} className="flex-1">
          {textos.comuns.cancelar}
        </Botao>
        <Botao
          variante={perigosa ? 'perigo' : 'primario'}
          carregando={confirmando}
          onClick={aoConfirmar}
          className="flex-1"
        >
          {rotuloConfirmar}
        </Botao>
      </div>
    </ModalBase>
  )
}
