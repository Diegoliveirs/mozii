import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCadastrar } from '../hooks/useAutenticacao'
import { textos } from '../lib/textos'

export function PaginaCadastro() {
  const navegar = useNavigate()
  const cadastrar = useCadastrar()
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState<string | null>(null)

  async function aoEnviar(evento: FormEvent) {
    evento.preventDefault()
    setErro(null)
    try {
      await cadastrar.mutateAsync({ email, senha, nomeExibicao: nome })
      navegar('/', { replace: true })
    } catch (excecao) {
      const mensagem = excecao instanceof Error ? excecao.message : ''
      setErro(
        mensagem.includes('already registered')
          ? textos.cadastro.emailJaExiste
          : textos.comuns.erroInesperado,
      )
    }
  }

  return (
    <main className="entrada-pagina area-segura-topo mx-auto flex min-h-dvh max-w-md flex-col justify-center px-6">
      <h1 className="font-voz text-3xl text-neve">{textos.cadastro.titulo}</h1>
      <p className="mt-1 text-rosa-suave">{textos.app.slogan}</p>

      <form onSubmit={aoEnviar} className="mt-8 flex flex-col gap-4">
        <label className="flex flex-col gap-1.5 text-sm text-nevoa">
          {textos.cadastro.nome}
          <input
            type="text"
            required
            maxLength={40}
            placeholder={textos.cadastro.nomeDica}
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="rounded-xl border border-linha bg-veu px-4 py-3 text-neve outline-none placeholder:text-cinza focus:border-rosa"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm text-nevoa">
          {textos.cadastro.email}
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
          {textos.cadastro.senha}
          <input
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            className="rounded-xl border border-linha bg-veu px-4 py-3 text-neve outline-none focus:border-rosa"
          />
        </label>

        {erro && <p className="text-sm text-rosa-suave">{erro}</p>}

        <button
          type="submit"
          disabled={cadastrar.isPending}
          className="mt-2 rounded-xl bg-rosa py-3 font-medium text-neve disabled:opacity-60"
        >
          {cadastrar.isPending ? textos.cadastro.criando : textos.cadastro.botao}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-cinza">
        {textos.cadastro.jaTemConta}{' '}
        <Link to="/entrar" className="text-rosa-suave underline">
          {textos.cadastro.linkEntrar}
        </Link>
      </p>
    </main>
  )
}
