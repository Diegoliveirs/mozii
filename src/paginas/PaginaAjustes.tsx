import { useRef, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSair } from '../hooks/useAutenticacao'
import {
  useAtualizarAvatar,
  useAtualizarNomeExibicao,
  useCasalComMembros,
  useMeuPerfil,
  useSairDoCasal,
  useSolicitarExclusaoConta,
} from '../hooks/useCasal'
import { SecaoNotificacoes } from '../componentes/ajustes/SecaoNotificacoes'
import { SecaoPermissoes } from '../componentes/ajustes/SecaoPermissoes'
import { CabecalhoPagina } from '../componentes/layout/CabecalhoPagina'
import { AvatarPerfil } from '../componentes/mural/AvatarPerfil'
import { useAviso } from '../componentes/ui/Avisos'
import { Botao } from '../componentes/ui/Botao'
import { Campo } from '../componentes/ui/Campo'
import { DialogoConfirmar } from '../componentes/ui/DialogoConfirmar'
import { IconeAvancar, IconeComemoracao, IconeFoto, IconeSair } from '../componentes/ui/icones'
import { textos } from '../lib/textos'

export function PaginaAjustes() {
  const navegar = useNavigate()
  const avisar = useAviso()
  const perfil = useMeuPerfil()
  const casal = useCasalComMembros()
  const atualizarNome = useAtualizarNomeExibicao()
  const atualizarAvatar = useAtualizarAvatar()
  const sairConta = useSair()
  const campoAvatar = useRef<HTMLInputElement>(null)
  const sairCasal = useSairDoCasal()
  const solicitarExclusao = useSolicitarExclusaoConta()

  const [nome, setNome] = useState<string | null>(null)
  const [confirmando, setConfirmando] = useState<'sair-casal' | 'excluir-conta' | null>(null)

  const nomeAtual = nome ?? perfil.data?.nomeExibicao ?? ''

  async function aoSalvarNome(evento: FormEvent) {
    evento.preventDefault()
    await atualizarNome.mutateAsync(nomeAtual.trim())
    avisar(textos.ajustes.nomeSalvo)
  }

  async function aoSairDaConta() {
    await sairConta.mutateAsync()
    navegar('/entrar', { replace: true })
  }

  async function aoConfirmar() {
    if (confirmando === 'sair-casal') {
      await sairCasal.mutateAsync()
      navegar('/parear', { replace: true })
    }
    if (confirmando === 'excluir-conta') {
      await solicitarExclusao.mutateAsync()
      await sairConta.mutateAsync()
      navegar('/entrar', { replace: true })
    }
    setConfirmando(null)
  }

  return (
    <main className="pb-4">
      <CabecalhoPagina titulo={textos.ajustes.titulo} fallback="/perfil" />
      <div className="px-5">
        {/* Foto e nome de exibição */}
        <form onSubmit={aoSalvarNome} className="cartao mt-6 p-5">
          <div className="mb-4 flex items-center gap-4">
            <AvatarPerfil
              nome={perfil.data?.nomeExibicao ?? ''}
              indice={0}
              caminhoAvatar={perfil.data?.urlAvatar ?? null}
              tamanho="grande"
            />
            <Botao
              variante="fantasma"
              carregando={atualizarAvatar.isPending}
              onClick={() => campoAvatar.current?.click()}
              className="py-2"
            >
              <IconeFoto size={16} aria-hidden />
              {textos.ajustes.avatarRotulo}
            </Botao>
            <input
              ref={campoAvatar}
              type="file"
              accept="image/*"
              hidden
              onChange={(evento) => {
                const arquivo = evento.target.files?.[0]
                if (arquivo)
                  atualizarAvatar.mutate(arquivo, {
                    onSuccess: () => avisar(textos.ajustes.avatarSalvo),
                  })
              }}
            />
          </div>
          <Campo
            rotulo={textos.ajustes.nomeRotulo}
            type="text"
            required
            maxLength={40}
            value={nomeAtual}
            onChange={(e) => setNome(e.target.value)}
          />
          <Botao
            type="submit"
            carregando={atualizarNome.isPending}
            disabled={nomeAtual.trim().length === 0}
            className="mt-3 px-5 py-2.5"
          >
            {textos.comuns.salvar}
          </Botao>
        </form>

        {/* Nosso espaço */}
        {casal.data && (
          <section className="cartao mt-4 p-5">
            <h2 className="rotulo-secao">{textos.ajustes.casalTitulo}</h2>

            <p className="mt-3 text-sm text-texto-secundario">{textos.ajustes.membros}</p>
            <ul className="mt-1 space-y-1">
              {casal.data.membros.map((membro) => (
                <li key={membro.id} className="text-texto">
                  {membro.nomeExibicao}
                  {membro.id === perfil.data?.id && (
                    <span className="text-texto-discreto"> (você)</span>
                  )}
                </li>
              ))}
            </ul>

            {casal.data.membros.length < 2 && (
              <div className="mt-4">
                <div className="ingresso px-5 py-4">
                  <p className="text-[11px] tracking-[0.14em] text-texto-secundario uppercase">
                    {textos.ajustes.codigoConvite}
                  </p>
                  <p className="mt-1.5 font-mono text-3xl tracking-[0.3em] text-texto">
                    {casal.data.casal.codigoConvite}
                  </p>
                </div>
                <p className="mt-2 text-xs text-texto-discreto">{textos.ajustes.codigoDica}</p>
              </div>
            )}
          </section>
        )}

        {/* Notificações e permissões do aparelho */}
        <SecaoNotificacoes />
        <SecaoPermissoes />

        {/* Histórico das notas de atualização */}
        <Link to="/novidades" className="cartao mt-4 flex items-center gap-3 px-5 py-4">
          <IconeComemoracao size={20} className="text-metal" aria-hidden />
          <span className="min-w-0 flex-1 font-medium text-texto">
            {textos.novidades.abrirAjustes}
          </span>
          <IconeAvancar size={16} className="text-texto-discreto" aria-hidden />
        </Link>

        {/* Sair da conta */}
        <Botao variante="fantasma" onClick={aoSairDaConta} className="mt-4 w-full">
          <IconeSair size={17} aria-hidden />
          {textos.ajustes.sairConta}
        </Botao>

        {/* Zona de perigo */}
        <section className="mt-8 rounded-cartao border border-perigo/30 p-5">
          <h2 className="rotulo-secao">
            <span className="text-perigo-texto">{textos.ajustes.zonaPerigo}</span>
          </h2>

          <div className="mt-4">
            <Botao
              variante="fantasma"
              onClick={() => setConfirmando('sair-casal')}
              className="w-full"
            >
              {textos.ajustes.sairCasal}
            </Botao>
            <p className="mt-2 text-xs text-texto-discreto">{textos.ajustes.sairCasalExplicacao}</p>
          </div>

          <div className="mt-5 border-t border-borda pt-5">
            <Botao
              variante="perigo"
              onClick={() => setConfirmando('excluir-conta')}
              className="w-full"
            >
              {textos.ajustes.excluirConta}
            </Botao>
            <p className="mt-2 text-xs text-texto-discreto">
              {textos.ajustes.excluirContaExplicacao}
            </p>
          </div>
        </section>

        <DialogoConfirmar
          aberto={confirmando !== null}
          titulo={
            confirmando === 'sair-casal'
              ? textos.ajustes.sairCasalConfirmar
              : textos.ajustes.excluirContaConfirmar
          }
          descricao={
            confirmando === 'sair-casal'
              ? textos.ajustes.sairCasalExplicacao
              : textos.ajustes.excluirContaExplicacao
          }
          rotuloConfirmar={textos.comuns.confirmar}
          perigosa
          aoConfirmar={aoConfirmar}
          aoCancelar={() => setConfirmando(null)}
        />
      </div>
    </main>
  )
}
