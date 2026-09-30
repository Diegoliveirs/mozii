import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { IconeCoracao, IconeEmail } from '../componentes/ui/icones'
import { classesBotao } from '../componentes/ui/estiloBotao'
import { TelaAbertura } from '../componentes/ui/TelaAbertura'
import { useConfirmarEmail } from '../hooks/useAutenticacao'
import { textos } from '../lib/textos'

/** Recebe o retorno do Supabase e leva a pessoa diretamente para o app. */
export function PaginaConfirmarEmail() {
  const navegar = useNavigate()
  const { mutate } = useConfirmarEmail()
  const [erro, setErro] = useState(false)

  useEffect(() => {
    const parametros = new URLSearchParams(window.location.search)
    const fragmento = new URLSearchParams(window.location.hash.slice(1))
    if (parametros.has('error') || fragmento.has('error')) {
      setErro(true)
      return
    }

    mutate(undefined, {
      onSuccess: () => navegar('/', { replace: true }),
      onError: () => setErro(true),
    })
  }, [mutate, navegar])

  if (!erro) return <TelaAbertura />

  return (
    <main className="entrada-pagina area-segura-topo mx-auto flex min-h-dvh max-w-md flex-col justify-center px-6 text-center">
      <div>
        <IconeCoracao size={30} weight="fill" className="mx-auto text-afeto" aria-hidden />
        <p className="mt-1 titulo text-2xl text-texto">{textos.app.nome}</p>
      </div>
      <span className="mx-auto mt-9 flex h-18 w-18 items-center justify-center rounded-full border border-afeto/40 bg-afeto/15">
        <IconeEmail size={32} className="text-afeto-claro" aria-hidden />
      </span>
      <h1 className="mt-5 titulo text-2xl tracking-tight text-texto">
        {textos.confirmarEmail.linkInvalidoTitulo}
      </h1>
      <p className="mt-3 text-sm text-texto-secundario">
        {textos.confirmarEmail.linkInvalidoDescricao}
      </p>
      <Link to="/entrar" className={`mt-7 ${classesBotao('secundario')}`}>
        {textos.confirmarEmail.voltarParaEntrar}
      </Link>
    </main>
  )
}
