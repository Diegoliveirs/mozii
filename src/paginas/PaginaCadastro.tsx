import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAviso } from '../componentes/ui/Avisos'
import { Botao } from '../componentes/ui/Botao'
import { Campo } from '../componentes/ui/Campo'
import { IconeCoracao, IconeEmail } from '../componentes/ui/icones'
import { useCadastrar, useReenviarConfirmacao } from '../hooks/useAutenticacao'
import { textos } from '../lib/textos'

export function PaginaCadastro() {
  const navegar = useNavigate()
  const avisar = useAviso()
  const cadastrar = useCadastrar()
  const reenviar = useReenviarConfirmacao()
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState<string | null>(null)
  const [emailParaConfirmar, setEmailParaConfirmar] = useState<string | null>(null)

  async function aoEnviar(evento: FormEvent) {
    evento.preventDefault()
    setErro(null)
    try {
      const { precisaConfirmarEmail } = await cadastrar.mutateAsync({
        email,
        senha,
        nomeExibicao: nome,
      })
      if (precisaConfirmarEmail) {
        setEmailParaConfirmar(email)
        return
      }
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

  // Cadastro feito com confirmação de e-mail ativa: falta tocar no link.
  if (emailParaConfirmar) {
    return (
      <main className="entrada-pagina area-segura-topo mx-auto flex min-h-dvh max-w-md flex-col justify-center px-6 text-center">
        <div>
          <IconeCoracao size={30} weight="fill" className="mx-auto text-rosa" aria-hidden />
          <p className="mt-1 font-voz text-2xl font-semibold text-neve">{textos.app.nome}</p>
        </div>

        <span className="mx-auto mt-9 flex h-18 w-18 items-center justify-center rounded-full border border-rosa/40 bg-rosa/15">
          <IconeEmail size={32} className="text-rosa-suave" aria-hidden />
        </span>

        <h1 className="mt-5 font-voz text-2xl font-semibold tracking-tight text-neve">
          {textos.confirmarEmail.titulo}
        </h1>
        <p className="mt-3 text-sm text-nevoa">
          {textos.confirmarEmail.explicacaoAntes}
          <br />
          <span className="font-medium text-neve">{emailParaConfirmar}</span>
          <br />
          {textos.confirmarEmail.explicacaoDepois}
        </p>

        <Botao
          variante="secundario"
          carregando={reenviar.isPending}
          onClick={() =>
            reenviar.mutate(emailParaConfirmar, {
              onSuccess: () => avisar(textos.confirmarEmail.reenviado),
              onError: () => avisar(textos.comuns.erroInesperado, 'erro'),
            })
          }
          className="mt-7 w-full"
        >
          {textos.confirmarEmail.reenviar}
        </Botao>

        <Link to="/entrar" className="mt-5 text-sm text-rosa-suave underline">
          {textos.confirmarEmail.jaConfirmei}
        </Link>
      </main>
    )
  }

  return (
    <main className="entrada-pagina area-segura-topo mx-auto flex min-h-dvh max-w-md flex-col justify-center px-6">
      <div className="text-center">
        <IconeCoracao size={34} weight="fill" className="mx-auto text-rosa" aria-hidden />
        <p className="mt-1 font-voz text-2xl font-semibold text-neve">{textos.app.nome}</p>
        <p className="text-sm text-cinza">{textos.app.slogan}</p>
      </div>

      <h1 className="mt-9 font-voz text-2xl font-semibold tracking-tight text-neve">
        {textos.cadastro.titulo}
      </h1>

      <form onSubmit={aoEnviar} className="mt-5 flex flex-col gap-4">
        <label className="flex flex-col gap-1.5 text-sm text-nevoa">
          {textos.cadastro.nome}
          <Campo
            type="text"
            required
            maxLength={40}
            placeholder={textos.cadastro.nomeDica}
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm text-nevoa">
          {textos.cadastro.email}
          <Campo
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm text-nevoa">
          {textos.cadastro.senha}
          <Campo
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
          />
        </label>

        {erro && <p className="text-sm text-erro">{erro}</p>}

        <Botao type="submit" carregando={cadastrar.isPending} className="mt-2">
          {textos.cadastro.botao}
        </Botao>
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
