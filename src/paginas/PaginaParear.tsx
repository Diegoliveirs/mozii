import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
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

  // Depois de criar: só o código, grande, e o botão de seguir.
  if (codigoCriado) {
    return (
      <main className="entrada-pagina area-segura-topo mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-4 px-6 text-center">
        <h1 className="font-voz text-3xl text-neve">{textos.parear.codigoCriadoTitulo}</h1>
        <p className="text-nevoa">{textos.parear.codigoCriadoDica}</p>
        <p
          data-testid="codigo-convite"
          className="rounded-2xl bg-cartao px-8 py-4 font-mono text-4xl tracking-[0.3em] text-rosa-suave"
        >
          {codigoCriado}
        </p>
        <button
          type="button"
          onClick={() => navegar('/', { replace: true })}
          className="mt-4 w-full rounded-xl bg-rosa py-3 font-medium text-neve"
        >
          {textos.parear.irParaApp}
        </button>
      </main>
    )
  }

  return (
    <main className="entrada-pagina area-segura-topo mx-auto flex min-h-dvh max-w-md flex-col justify-center px-6">
      <h1 className="font-voz text-3xl text-neve">{textos.parear.titulo}</h1>
      <p className="mt-2 text-nevoa">{textos.parear.subtitulo}</p>

      <section className="mt-8 rounded-2xl bg-cartao p-5">
        <h2 className="font-medium text-neve">{textos.parear.criarTitulo}</h2>
        <button
          type="button"
          onClick={aoCriar}
          disabled={criar.isPending}
          className="mt-3 w-full rounded-xl bg-rosa py-3 font-medium text-neve disabled:opacity-60"
        >
          {criar.isPending ? textos.parear.criando : textos.parear.criarBotao}
        </button>
      </section>

      <p className="my-4 text-center text-sm text-cinza">{textos.parear.ou}</p>

      <section className="rounded-2xl bg-cartao p-5">
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
              className="rounded-xl border border-linha bg-veu px-4 py-3 text-center font-mono text-2xl tracking-[0.3em] text-neve outline-none focus:border-rosa"
            />
          </label>
          <button
            type="submit"
            disabled={!codigoCompleto(codigo) || entrar.isPending}
            className="rounded-xl border border-rosa py-3 font-medium text-rosa-suave disabled:opacity-50"
          >
            {entrar.isPending ? textos.parear.entrando : textos.parear.entrarBotao}
          </button>
        </form>
      </section>

      {erro && <p className="mt-4 text-center text-sm text-rosa-suave">{erro}</p>}
    </main>
  )
}
