import { useState, type FormEvent } from 'react'
import type { RefFilme } from '../../dominio/tipos'
import { useAgendarSessao } from '../../hooks/useSessoes'
import { useAviso } from '../ui/Avisos'
import { textos } from '../../lib/textos'
import { Botao } from '../ui/Botao'
import { Campo } from '../ui/Campo'
import { FolhaBase } from '../ui/FolhaBase'
import { Poster } from '../filmes/Poster'

/**
 * Agendamento de sessão: data/hora nativa do celular + combinados.
 * Chamado da página do filme, do item da lista e do resultado do sorteio.
 */
export function ModalAgendarSessao({
  filme,
  itemListaId,
  aoFechar,
}: {
  filme: RefFilme
  itemListaId: string | null
  aoFechar: () => void
}) {
  const agendar = useAgendarSessao()
  const avisar = useAviso()
  const [quando, setQuando] = useState('')
  const [observacao, setObservacao] = useState('')
  const [erro, setErro] = useState<string | null>(null)

  async function aoAgendar(evento: FormEvent) {
    evento.preventDefault()
    setErro(null)
    try {
      await agendar.mutateAsync({
        filme,
        agendadaPara: new Date(quando).toISOString(),
        observacao: observacao.trim() || null,
        itemListaId,
      })
      avisar(textos.sessao.agendadaAviso)
      aoFechar()
    } catch {
      setErro(textos.comuns.erroInesperado)
    }
  }

  return (
    <FolhaBase
      rotulo={textos.sessao.modalTitulo}
      titulo={textos.sessao.modalTitulo}
      aoFechar={aoFechar}
    >
      <form onSubmit={aoAgendar}>
        <div className="mt-4 flex items-center gap-3">
          <Poster
            caminho={filme.caminhoPoster}
            titulo={filme.titulo}
            largura={185}
            className="w-12"
          />
          <p className="font-medium text-neve">
            {filme.titulo}
            {filme.anoLancamento && <span className="text-cinza"> ({filme.anoLancamento})</span>}
          </p>
        </div>

        <label className="mt-4 flex flex-col gap-1.5 text-sm text-nevoa">
          {textos.sessao.quandoRotulo}
          <Campo
            type="datetime-local"
            required
            value={quando}
            onChange={(evento) => setQuando(evento.target.value)}
          />
        </label>

        <Campo
          type="text"
          maxLength={280}
          placeholder={textos.sessao.observacaoDica}
          value={observacao}
          onChange={(evento) => setObservacao(evento.target.value)}
          className="mt-3"
        />

        {erro && <p className="mt-3 text-sm text-erro">{erro}</p>}

        <Botao
          type="submit"
          carregando={agendar.isPending}
          disabled={!quando}
          className="mt-4 w-full"
        >
          {textos.sessao.agendar}
        </Botao>
      </form>
    </FolhaBase>
  )
}
