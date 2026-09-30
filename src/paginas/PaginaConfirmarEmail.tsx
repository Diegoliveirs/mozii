import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { SeloEnvelope } from '../componentes/ui/SeloEnvelope'
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
    <main className="entrada-pagina pt-seguro-24 mx-auto flex min-h-dvh max-w-md flex-col items-center px-6 pb-8 text-center">
      <SeloEnvelope />
      <h1 className="mt-10 titulo text-3xl tracking-tight text-texto">
        {textos.confirmarEmail.linkInvalidoTitulo}
      </h1>
      <p className="mt-4 text-texto-secundario">{textos.confirmarEmail.linkInvalidoDescricao}</p>
      <Link to="/entrar" className={`mt-auto w-full ${classesBotao('primario', true)}`}>
        {textos.confirmarEmail.voltarParaEntrar}
      </Link>
    </main>
  )
}
