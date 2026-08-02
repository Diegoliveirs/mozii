import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Botao } from '../componentes/ui/Botao'
import { IconeCoracao } from '../componentes/ui/icones'
import { useCriarCasal, useEntrarNoCasal } from '../hooks/useCasal'
import { codigoCompleto, normalizarCodigo } from '../lib/codigo'
import { textos } from '../lib/textos'

/**
 * Tela de pareamento: criar o espaço do casal OU entrar com o código.
 * Erros do banco (casal cheio, muitas tentativas) já chegam em português
 * e são mostrados como vieram; código inválido chega como NULL.
 */
export function PaginaParear() {
  const navegar = useNavigate()
  const criar = useCriarCasal()
  const entrar = useEntrarNoCasal()
  const [codigoCriado, setCodigoCriado] = useState<string | null>(null)
  const [codigo, setCodigo] = useState('')
  const [erro, setErro] = useState<string | null>(null)

  async function aoCriar() {
    setErro(null)
    try {
      const casal = await criar.mutateAsync()
      setCodigoCriado(casal.codigoConvite)
    } catch (excecao) {
      setErro(excecao instanceof Error ? excecao.message : textos.comuns.erroInesperado)
    }
  }

  async function aoEntrar(evento: FormEvent) {
    evento.preventDefault()
    setErro(null)
    try {
      const casal = await entrar.mutateAsync(codigo)
      if (!casal) {
        setErro(textos.parear.codigoInvalido)
        return
      }
      navegar('/', { replace: true })
    } catch (excecao) {
      setErro(excecao instanceof Error ? excecao.message : textos.comuns.erroInesperado)
    }
  }

  // Depois de criar: o código vira um bilhete de cinema para o par.
  if (codigoCriado) {
    return (
      <main className="entrada-pagina area-segura-topo mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-4 px-6 text-center">
        <h1 className="font-voz text-3xl font-semibold tracking-tight text-neve">
          {textos.parear.codigoCriadoTitulo}
        </h1>
        <p className="text-nevoa">{textos.parear.codigoCriadoDica}</p>

        <div className="relative w-full overflow-hidden rounded-2xl border border-linha bg-cartao shadow-cartao">
          <p className="px-8 pt-6 text-xs font-medium tracking-wide text-rosa-suave uppercase">
            {textos.ajustes.codigoConvite}
          </p>
          <p
            data-testid="codigo-convite"
            className="px-8 pt-2 pb-5 font-mono text-4xl tracking-[0.3em] text-rosa-suave"
          >
            {codigoCriado}
          </p>
          <div className="relative border-t-2 border-dashed border-linha-forte">
            <span
              aria-hidden
              className="absolute top-0 -left-2 h-4 w-4 -translate-y-1/2 rounded-full border border-linha bg-noite"
            />
            <span
              aria-hidden
              className="absolute top-0 -right-2 h-4 w-4 -translate-y-1/2 rounded-full border border-linha bg-noite"
            />
            <p className="px-8 py-3 text-xs text-cinza">{textos.parear.codigoCriadoDica}</p>
          </div>
        </div>

        <Botao onClick={() => navegar('/', { replace: true })} className="mt-2 w-full">
          {textos.parear.irParaApp}
        </Botao>
      </main>
    )
  }

  return (
    <main className="entrada-pagina area-segura-topo mx-auto flex min-h-dvh max-w-md flex-col justify-center px-6">
      <h1 className="flex items-center gap-2 font-voz text-3xl font-semibold tracking-tight text-neve">
        {textos.parear.titulo}
        <IconeCoracao size={22} weight="fill" className="text-rosa" aria-hidden />
      </h1>
      <p className="mt-2 text-nevoa">{textos.parear.subtitulo}</p>

      <section className="mt-8 rounded-2xl border border-linha bg-cartao p-5 shadow-cartao">
        <h2 className="font-medium text-neve">{textos.parear.criarTitulo}</h2>
        <Botao onClick={aoCriar} carregando={criar.isPending} className="mt-3 w-full">
          {textos.parear.criarBotao}
        </Botao>
      </section>

      <div className="my-4 flex items-center gap-3 text-sm text-cinza">
        <span aria-hidden className="h-px flex-1 bg-linha" />
        {textos.parear.ou}
        <span aria-hidden className="h-px flex-1 bg-linha" />
      </div>

      <section className="rounded-2xl border border-linha bg-cartao p-5 shadow-cartao">
        <h2 className="font-medium text-neve">{textos.parear.entrarTitulo}</h2>
        <form onSubmit={aoEntrar} className="mt-3 flex flex-col gap-3">
          <label className="flex flex-col gap-1.5 text-sm text-nevoa">
            {textos.parear.entrarRotulo}
            <input
              type="text"
              inputMode="text"
              autoCapitalize="characters"
              value={codigo}
              onChange={(e) => setCodigo(normalizarCodigo(e.target.value))}
              className="rounded-xl border border-linha bg-veu px-4 py-3 text-center font-mono text-2xl tracking-[0.3em] text-neve outline-none transition-colors focus:border-rosa focus:ring-2 focus:ring-rosa/25"
            />
          </label>
          <Botao
            type="submit"
            variante="secundario"
            carregando={entrar.isPending}
            disabled={!codigoCompleto(codigo)}
          >
            {textos.parear.entrarBotao}
          </Botao>
        </form>
      </section>

      {erro && <p className="mt-4 text-center text-sm text-erro">{erro}</p>}
    </main>
  )
}
