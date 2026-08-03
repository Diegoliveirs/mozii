import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Botao } from '../componentes/ui/Botao'
import { Campo } from '../componentes/ui/Campo'
import { IconeCoracao } from '../componentes/ui/icones'
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
    <main className="entrada-pagina area-segura-topo mx-auto flex min-h-dvh max-w-md flex-col justify-center px-6">
      <div className="text-center">
        <IconeCoracao size={34} weight="fill" className="mx-auto text-rosa" aria-hidden />
        <p className="mt-1 font-voz text-2xl font-semibold text-neve">{textos.app.nome}</p>
        <p className="text-sm text-cinza">{textos.app.slogan}</p>
      </div>

      <h1 className="mt-9 font-voz text-2xl font-semibold tracking-tight text-neve">
        {textos.entrar.titulo}
      </h1>

      <form onSubmit={aoEnviar} className="mt-5 flex flex-col gap-4">
        <label className="flex flex-col gap-1.5 text-sm text-nevoa">
          {textos.entrar.email}
          <Campo
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm text-nevoa">
          {textos.entrar.senha}
          <Campo
            type="password"
            required
            autoComplete="current-password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
          />
        </label>

        {erro && <p className="text-sm text-erro">{erro}</p>}

        <Botao type="submit" carregando={entrar.isPending} className="mt-2">
          {textos.entrar.botao}
        </Botao>
      </form>

      <p className="mt-6 text-center text-sm text-cinza">
        {textos.entrar.semConta}{' '}
        <Link to="/cadastro" className="text-rosa-suave underline">
          {textos.entrar.linkCadastro}
        </Link>
      </p>
    </main>
  )
}
