import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Botao } from '../componentes/ui/Botao'
import { Campo } from '../componentes/ui/Campo'
import { TituloAfetivo } from '../componentes/ui/TituloAfetivo'
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
        <h1 className="titulo text-4xl tracking-tight text-texto">
          {textos.parear.codigoCriadoTitulo}
        </h1>
        <p className="text-texto-secundario">{textos.parear.codigoCriadoDica}</p>

        <div className="relative w-full overflow-hidden ingresso">
          <p className="px-8 pt-6 rotulo-secao">{textos.ajustes.codigoConvite}</p>
          <p
            data-testid="codigo-convite"
            className="px-8 pt-2 pb-5 font-mono text-4xl tracking-[0.3em] text-texto"
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

        <Botao onClick={() => navegar('/', { replace: true })} grande className="mt-2 w-full">
          {textos.parear.irParaApp}
        </Botao>
      </main>
    )
  }

  return (
    <main className="entrada-pagina pt-seguro-16 mx-auto flex min-h-dvh max-w-md flex-col px-6 pb-8">
      <p className="rotulo-secao">{textos.parear.antetitulo}</p>
      <h1 className="mt-3 titulo text-5xl leading-none tracking-tight text-texto">
        <TituloAfetivo
          inicio={textos.parear.tituloInicio}
          destaque={textos.parear.tituloDestaque}
        />
      </h1>
      <p className="mt-4 text-texto-secundario">{textos.parear.subtitulo}</p>

      <section className="ingresso mt-8 p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="titulo text-xl text-texto">{textos.parear.criarTitulo}</h2>
          <IconeCoracao size={22} weight="fill" className="shrink-0 text-afeto" aria-hidden />
        </div>
        <Botao onClick={aoCriar} carregando={criar.isPending} grande className="mt-4 w-full">
          {textos.parear.criarBotao}
        </Botao>
      </section>

      <div className="my-5 flex items-center gap-3 font-titulo text-texto-discreto italic">
        <span aria-hidden className="h-px flex-1 bg-borda" />
        {textos.parear.ou}
        <span aria-hidden className="h-px flex-1 bg-borda" />
      </div>

      <section className="cartao p-5">
        <h2 className="titulo text-xl text-texto">{textos.parear.entrarTitulo}</h2>
        <form onSubmit={aoEntrar} className="mt-4 flex flex-col gap-3">
          <Campo
            rotulo={textos.parear.entrarRotulo}
            type="text"
            inputMode="text"
            autoCapitalize="characters"
            value={codigo}
            onChange={(e) => setCodigo(normalizarCodigo(e.target.value))}
            className="[&_input]:text-center [&_input]:font-mono [&_input]:text-2xl [&_input]:tracking-[0.3em]"
          />
          <Botao
            type="submit"
            variante="secundario"
            carregando={entrar.isPending}
            disabled={!codigoCompleto(codigo)}
            grande
          >
            {textos.parear.entrarBotao}
          </Botao>
        </form>
      </section>

      {erro && <p className="mt-4 text-center text-sm text-perigo-texto">{erro}</p>}
    </main>
  )
}
