import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
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
    } catch {
      setErro(textos.entrar.credenciaisInvalidas)
    }
  }

  return (
    <main className="entrada-pagina mx-auto flex min-h-dvh max-w-md flex-col justify-center px-6">
      <h1 className="font-voz text-3xl text-neve">{textos.entrar.titulo}</h1>
      <p className="mt-1 text-rosa-suave">{textos.app.slogan}</p>

      <form onSubmit={aoEnviar} className="mt-8 flex flex-col gap-4">
        <label className="flex flex-col gap-1.5 text-sm text-nevoa">
          {textos.entrar.email}
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-xl border border-linha bg-veu px-4 py-3 text-neve outline-none focus:border-rosa"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm text-nevoa">
          {textos.entrar.senha}
          <input
            type="password"
            required
            autoComplete="current-password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            className="rounded-xl border border-linha bg-veu px-4 py-3 text-neve outline-none focus:border-rosa"
          />
        </label>

        {erro && <p className="text-sm text-rosa-suave">{erro}</p>}

        <button
          type="submit"
          disabled={entrar.isPending}
          className="mt-2 rounded-xl bg-rosa py-3 font-medium text-neve disabled:opacity-60"
        >
          {entrar.isPending ? textos.entrar.entrando : textos.entrar.botao}
        </button>
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
