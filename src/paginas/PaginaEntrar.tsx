import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Botao } from '../componentes/ui/Botao'
import { Campo } from '../componentes/ui/Campo'
import { ColagemPosteres } from '../componentes/ui/ColagemPosteres'
import { IconeAvancar } from '../componentes/ui/icones'
import { useEntrar } from '../hooks/useAutenticacao'
import { textos } from '../lib/textos'

export function PaginaEntrar() {
  const navegar = useNavigate()
  const entrar = useEntrar()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState<string | null>(null)

  async function aoEnviar(evento: FormEvent) {
    evento.preventDefault()
    setErro(null)
    try {
      await entrar.mutateAsync({ email, senha })
      navegar('/', { replace: true })
    } catch (excecao) {
      const codigo =
        excecao && typeof excecao === 'object' && 'code' in excecao ? String(excecao.code) : ''
      const mensagem = excecao instanceof Error ? excecao.message : ''
      setErro(
        codigo === 'email_not_confirmed' || mensagem.includes('not confirmed')
          ? textos.entrar.emailNaoConfirmado
          : textos.entrar.credenciaisInvalidas,
      )
    }
  }

  return (
    <main className="entrada-pagina pt-seguro-6 mx-auto flex min-h-dvh max-w-md flex-col overflow-hidden px-6 pb-8">
      <ColagemPosteres />

      <p className="titulo text-6xl leading-none tracking-tight text-texto">{textos.app.nome}</p>

      <h1 className="mt-8 titulo text-2xl text-texto">{textos.entrar.titulo}</h1>

      <form onSubmit={aoEnviar} className="mt-4 flex flex-col gap-2.5">
        <Campo
          rotulo={textos.entrar.email}
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Campo
          rotulo={textos.entrar.senha}
          type="password"
          required
          autoComplete="current-password"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
        />

        {erro && <p className="text-sm text-perigo-texto">{erro}</p>}

        <Botao type="submit" carregando={entrar.isPending} grande className="mt-3">
          {textos.entrar.botao}
          <IconeAvancar size={16} weight="bold" aria-hidden />
        </Botao>
      </form>

      <p className="mt-auto pt-8 text-center text-sm text-texto-discreto">
        {textos.entrar.semConta}{' '}
        <Link
          to="/cadastro"
          className="text-texto underline decoration-texto/30 underline-offset-4"
        >
          {textos.entrar.linkCadastro}
        </Link>
      </p>
    </main>
  )
}
