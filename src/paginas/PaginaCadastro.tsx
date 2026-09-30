import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAviso } from '../componentes/ui/Avisos'
import { Botao } from '../componentes/ui/Botao'
import { Campo } from '../componentes/ui/Campo'
import { IconeVoltar } from '../componentes/ui/icones'
import { SeloEnvelope } from '../componentes/ui/SeloEnvelope'
import { TituloAfetivo } from '../componentes/ui/TituloAfetivo'
import { classesBotao } from '../componentes/ui/estiloBotao'
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
      <main className="entrada-pagina area-segura-topo mx-auto flex min-h-dvh max-w-md flex-col items-center px-6 pt-24 pb-8 text-center">
        <SeloEnvelope />
        <p className="mt-10 rotulo-secao">{textos.confirmarEmail.antetitulo}</p>
        <h1 className="mt-3 titulo text-3xl tracking-tight text-texto">
          {textos.confirmarEmail.titulo}
        </h1>
        <p className="mt-4 text-texto-secundario">{textos.confirmarEmail.explicacaoAntes}</p>
        <span className="mt-2 rounded-full border border-vidro-borda bg-vidro px-4 py-2 font-medium text-texto">
          {emailParaConfirmar}
        </span>
        <p className="mt-4 max-w-72 text-texto-secundario">
          {textos.confirmarEmail.explicacaoDepois}
        </p>

        <div className="mt-auto flex w-full flex-col gap-2.5 pt-8">
          <Link to="/entrar" className={classesBotao('primario', true)}>
            {textos.confirmarEmail.jaConfirmei}
          </Link>
          <Botao
            variante="secundario"
            carregando={reenviar.isPending}
            onClick={() =>
              reenviar.mutate(emailParaConfirmar, {
                onSuccess: () => avisar(textos.confirmarEmail.reenviado),
                onError: () => avisar(textos.comuns.erroInesperado, 'erro'),
              })
            }
            grande
          >
            {textos.confirmarEmail.reenviar}
          </Botao>
        </div>
      </main>
    )
  }

  return (
    <main className="entrada-pagina area-segura-topo mx-auto flex min-h-dvh max-w-md flex-col px-6 pt-4 pb-8">
      <div className="flex items-center justify-between">
        <Link
          to="/entrar"
          aria-label={textos.comuns.voltar}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-vidro-borda bg-vidro text-texto"
        >
          <IconeVoltar size={18} aria-hidden />
        </Link>
        <span className="titulo text-xl tracking-tight text-texto">{textos.app.nome}</span>
        <span aria-hidden className="w-11" />
      </div>

      <h1 className="mt-10 titulo text-4xl leading-tight tracking-tight text-texto">
        <TituloAfetivo
          inicio={textos.cadastro.tituloInicio}
          destaque={textos.cadastro.tituloDestaque}
        />
      </h1>
      <p className="mt-3 text-texto-secundario">{textos.cadastro.subtitulo}</p>

      <form onSubmit={aoEnviar} className="mt-8 flex flex-col gap-2.5">
        <Campo
          rotulo={textos.cadastro.nome}
          type="text"
          required
          maxLength={40}
          placeholder={textos.cadastro.nomeDica}
          value={nome}
          onChange={(e) => setNome(e.target.value)}
        />
        <Campo
          rotulo={textos.cadastro.email}
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Campo
          rotulo={textos.cadastro.senha}
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
        />

        {erro && <p className="text-sm text-perigo-texto">{erro}</p>}

        <Botao type="submit" carregando={cadastrar.isPending} grande className="mt-3">
          {textos.cadastro.botao}
        </Botao>
      </form>

      <p className="mt-auto pt-8 text-center text-sm text-texto-discreto">
        {textos.cadastro.jaTemConta}{' '}
        <Link to="/entrar" className="text-texto underline decoration-texto/30 underline-offset-4">
          {textos.cadastro.linkEntrar}
        </Link>
      </p>
    </main>
  )
}
