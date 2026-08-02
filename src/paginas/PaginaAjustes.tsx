import { useRef, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSair } from '../hooks/useAutenticacao'
import {
  useAtualizarAvatar,
  useAtualizarNomeExibicao,
  useCasalComMembros,
  useMeuPerfil,
  useSairDoCasal,
  useSolicitarExclusaoConta,
} from '../hooks/useCasal'
import { CabecalhoPagina } from '../componentes/layout/CabecalhoPagina'
import { AvatarPerfil } from '../componentes/mural/AvatarPerfil'
import { useAviso } from '../componentes/ui/Avisos'
import { Botao } from '../componentes/ui/Botao'
import { Campo } from '../componentes/ui/Campo'
import { DialogoConfirmar } from '../componentes/ui/DialogoConfirmar'
import { IconeFoto, IconeSair } from '../componentes/ui/icones'
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
        <form
          onSubmit={aoSalvarNome}
          className="mt-6 rounded-2xl border border-linha bg-cartao p-5 shadow-cartao"
        >
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
          <label className="flex flex-col gap-1.5 text-sm text-nevoa">
            {textos.ajustes.nomeRotulo}
            <Campo
              type="text"
              required
              maxLength={40}
              value={nomeAtual}
              onChange={(e) => setNome(e.target.value)}
            />
          </label>
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
          <section className="mt-4 rounded-2xl border border-linha bg-cartao p-5 shadow-cartao">
            <h2 className="font-medium text-neve">{textos.ajustes.casalTitulo}</h2>

            <p className="mt-3 text-sm text-nevoa">{textos.ajustes.membros}</p>
            <ul className="mt-1 space-y-1">
              {casal.data.membros.map((membro) => (
                <li key={membro.id} className="text-neve">
                  {membro.nomeExibicao}
                  {membro.id === perfil.data?.id && <span className="text-cinza"> (você)</span>}
                </li>
              ))}
            </ul>

            {casal.data.membros.length < 2 && (
              <div className="mt-4">
                <p className="text-sm text-nevoa">{textos.ajustes.codigoConvite}</p>
                <p className="mt-1 w-fit rounded-xl border border-dashed border-linha-forte bg-veu px-4 py-2 font-mono text-2xl tracking-[0.3em] text-rosa-suave">
                  {casal.data.casal.codigoConvite}
                </p>
                <p className="mt-1 text-xs text-cinza">{textos.ajustes.codigoDica}</p>
              </div>
            )}
          </section>
        )}

        {/* Sair da conta */}
        <Botao variante="fantasma" onClick={aoSairDaConta} className="mt-4 w-full">
          <IconeSair size={17} aria-hidden />
          {textos.ajustes.sairConta}
        </Botao>

        {/* Zona de perigo */}
        <section className="mt-8 rounded-2xl border border-erro/40 p-5">
          <h2 className="text-sm font-medium tracking-wide text-erro uppercase">
            {textos.ajustes.zonaPerigo}
          </h2>

          <div className="mt-4">
            <button
              type="button"
              onClick={() => setConfirmando('sair-casal')}
              className="text-erro underline"
            >
              {textos.ajustes.sairCasal}
            </button>
            <p className="mt-1 text-xs text-cinza">{textos.ajustes.sairCasalExplicacao}</p>
          </div>

          <div className="mt-4">
            <button
              type="button"
              onClick={() => setConfirmando('excluir-conta')}
              className="text-erro underline"
            >
              {textos.ajustes.excluirConta}
            </button>
            <p className="mt-1 text-xs text-cinza">{textos.ajustes.excluirContaExplicacao}</p>
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
