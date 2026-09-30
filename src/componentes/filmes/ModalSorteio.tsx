import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import type { ItemLista } from '../../dominio/tipos'
import { ATRASOS_ROLAGEM, sequenciaDeRolagem, sortearIndice } from '../../lib/sorteio'
import { textos } from '../../lib/textos'
import { Botao } from '../ui/Botao'
import { classesBotao } from '../ui/estiloBotao'
import { ModalBase } from '../ui/ModalBase'
import { Poster } from './Poster'

/**
 * O caça-níquel do "O que ver hoje": rola os pôsteres dos filmes ainda
 * não assistidos com atrasos crescentes até travar no sorteado.
 * A lógica pura (sequência e sorteio) vive em lib/sorteio.ts, testada.
 */
export function ModalSorteio({
  naoAssistidos,
  aoFechar,
  aoAgendar,
}: {
  naoAssistidos: ItemLista[]
  aoFechar: () => void
  /** "Agendar este!": fecha o ciclo do sorteio marcando a sessão. */
  aoAgendar: (item: ItemLista) => void
}) {
  const [fase, setFase] = useState<'rolando' | 'revelado'>('rolando')
  const [indiceExibido, setIndiceExibido] = useState(0)
  const temporizadores = useRef<number[]>([])

  const rolar = useCallback(() => {
    temporizadores.current.forEach(clearTimeout)
    temporizadores.current = []
    setFase('rolando')

    const vencedor = sortearIndice(naoAssistidos.length)
    const sequencia = sequenciaDeRolagem(naoAssistidos.length, vencedor)

    let momento = 0
    sequencia.forEach((indice, quadro) => {
      momento += ATRASOS_ROLAGEM[quadro]
      temporizadores.current.push(
        window.setTimeout(() => {
          setIndiceExibido(indice)
          if (quadro === sequencia.length - 1) setFase('revelado')
        }, momento),
      )
    })
  }, [naoAssistidos.length])

  useEffect(() => {
    rolar()
    return () => temporizadores.current.forEach(clearTimeout)
  }, [rolar])

  const item = naoAssistidos[indiceExibido]

  return (
    <ModalBase rotulo={textos.sorteio.titulo} aoFechar={aoFechar} className="max-w-xs text-center">
      <h2 className="titulo text-2xl text-texto">{textos.sorteio.titulo}</h2>

      <div className="mx-auto mt-5 w-40">
        {fase === 'rolando' ? (
          <div aria-hidden className="opacity-70 blur-[1px]">
            <Poster caminho={item.filme.caminhoPoster} titulo="" largura={342} />
          </div>
        ) : (
          <div className="entrada-pop">
            <Poster caminho={item.filme.caminhoPoster} titulo={item.filme.titulo} largura={342} />
          </div>
        )}
      </div>

      <p className="mt-4 min-h-12 font-medium text-texto">
        {fase === 'rolando' ? (
          <span className="text-texto-discreto">{textos.sorteio.rolando}</span>
        ) : (
          <>
            {item.filme.titulo}
            {item.filme.anoLancamento && (
              <span className="text-texto-discreto"> ({item.filme.anoLancamento})</span>
            )}
          </>
        )}
      </p>

      <div className="mt-4 flex flex-col gap-2">
        <Link
          to={`/filme/${item.filme.tmdbId}`}
          aria-disabled={fase === 'rolando'}
          className={`${classesBotao('primario')} ${
            fase === 'rolando' ? 'pointer-events-none opacity-40' : ''
          }`}
        >
          {textos.sorteio.verFilme}
        </Link>
        <Botao variante="secundario" onClick={() => aoAgendar(item)} disabled={fase === 'rolando'}>
          {textos.sessao.agendarDoSorteio}
        </Botao>
        <Botao variante="fantasma" onClick={rolar} disabled={fase === 'rolando'}>
          {textos.sorteio.sortearDeNovo}
        </Botao>
      </div>
    </ModalBase>
  )
}
