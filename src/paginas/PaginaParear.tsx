import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Botao } from '../componentes/ui/Botao'
import { Campo } from '../componentes/ui/Campo'
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
        <h1 className="titulo text-3xl tracking-tight text-texto">
          {textos.parear.codigoCriadoTitulo}
        </h1>
        <p className="text-texto-secundario">{textos.parear.codigoCriadoDica}</p>

        <div className="relative w-full overflow-hidden ingresso">
          <p className="px-8 pt-6 rotulo-secao">{textos.ajustes.codigoConvite}</p>
          <p
            data-testid="codigo-convite"
            className="px-8 pt-2 pb-5 font-mono text-4xl tracking-[0.3em] text-afeto-claro"
          >
            {codigoCriado}
          </p>
          <div className="relative border-t-2 border-dashed border-borda-forte">
            <span
              aria-hidden
              className="absolute top-0 -left-2 h-4 w-4 -translate-y-1/2 rounded-full border border-borda bg-fundo"
            />
            <span
              aria-hidden
              className="absolute top-0 -right-2 h-4 w-4 -translate-y-1/2 rounded-full border border-borda bg-fundo"
            />
            <p className="px-8 py-3 text-xs text-texto-discreto">
              {textos.parear.codigoCriadoDica}
            </p>
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
      <h1 className="flex items-center gap-2 titulo text-3xl tracking-tight text-texto">
        {textos.parear.titulo}
        <IconeCoracao size={22} weight="fill" className="text-afeto" aria-hidden />
      </h1>
      <p className="mt-2 text-texto-secundario">{textos.parear.subtitulo}</p>

      <section className="cartao mt-8 p-5">
        <h2 className="font-medium text-texto">{textos.parear.criarTitulo}</h2>
        <Botao onClick={aoCriar} carregando={criar.isPending} className="mt-3 w-full">
          {textos.parear.criarBotao}
        </Botao>
      </section>

      <div className="my-4 flex items-center gap-3 text-sm text-texto-discreto">
        <span aria-hidden className="h-px flex-1 bg-borda" />
        {textos.parear.ou}
        <span aria-hidden className="h-px flex-1 bg-borda" />
      </div>

      <section className="cartao p-5">
        <h2 className="font-medium text-texto">{textos.parear.entrarTitulo}</h2>
        <form onSubmit={aoEntrar} className="mt-3 flex flex-col gap-3">
          <label className="flex flex-col gap-1.5 text-sm text-texto-secundario">
            {textos.parear.entrarRotulo}
            <Campo
              type="text"
              inputMode="text"
              autoCapitalize="characters"
              value={codigo}
              onChange={(e) => setCodigo(normalizarCodigo(e.target.value))}
              className="text-center font-mono text-2xl tracking-[0.3em]"
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

      {erro && <p className="mt-4 text-center text-sm text-perigo-texto">{erro}</p>}
    </main>
  )
}
