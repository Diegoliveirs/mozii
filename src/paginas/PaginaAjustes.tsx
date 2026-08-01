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
import { AvatarPerfil } from '../componentes/mural/AvatarPerfil'
import { DialogoConfirmar } from '../componentes/ui/DialogoConfirmar'
import { textos } from '../lib/textos'

export function PaginaAjustes() {
  const navegar = useNavigate()
  const perfil = useMeuPerfil()
  const casal = useCasalComMembros()
  const atualizarNome = useAtualizarNomeExibicao()
  const atualizarAvatar = useAtualizarAvatar()
  const sairConta = useSair()
  const campoAvatar = useRef<HTMLInputElement>(null)
  const sairCasal = useSairDoCasal()
  const solicitarExclusao = useSolicitarExclusaoConta()

  const [nome, setNome] = useState<string | null>(null)
  const [nomeSalvo, setNomeSalvo] = useState(false)
  const [confirmando, setConfirmando] = useState<'sair-casal' | 'excluir-conta' | null>(null)

  const nomeAtual = nome ?? perfil.data?.nomeExibicao ?? ''

  async function aoSalvarNome(evento: FormEvent) {
    evento.preventDefault()
    await atualizarNome.mutateAsync(nomeAtual.trim())
    setNomeSalvo(true)
    setTimeout(() => setNomeSalvo(false), 2500)
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
    <main className="px-5 pt-8">
      <h1 className="font-voz text-3xl text-neve">{textos.ajustes.titulo}</h1>

      {/* Foto e nome de exibição */}
      <form onSubmit={aoSalvarNome} className="mt-6 rounded-2xl bg-cartao p-5">
        <div className="mb-4 flex items-center gap-4">
          <AvatarPerfil
            nome={perfil.data?.nomeExibicao ?? ''}
            indice={0}
            caminhoAvatar={perfil.data?.urlAvatar ?? null}
            tamanho="grande"
          />
          <button
            type="button"
            onClick={() => campoAvatar.current?.click()}
            disabled={atualizarAvatar.isPending}
            className="rounded-xl border border-linha-forte px-4 py-2 text-sm text-nevoa disabled:opacity-60"
          >
            {textos.ajustes.avatarRotulo}
          </button>
          <input
            ref={campoAvatar}
            type="file"
            accept="image/*"
            hidden
            onChange={(evento) => {
              const arquivo = evento.target.files?.[0]
              if (arquivo) atualizarAvatar.mutate(arquivo)
            }}
          />
          {atualizarAvatar.isSuccess && (
            <span className="text-sm text-rosa-suave">{textos.ajustes.avatarSalvo}</span>
          )}
        </div>
        <label className="flex flex-col gap-1.5 text-sm text-nevoa">
          {textos.ajustes.nomeRotulo}
          <input
            type="text"
            required
            maxLength={40}
            value={nomeAtual}
            onChange={(e) => setNome(e.target.value)}
            className="rounded-xl border border-linha bg-veu px-4 py-3 text-neve outline-none focus:border-rosa"
          />
        </label>
        <button
          type="submit"
          disabled={atualizarNome.isPending || nomeAtual.trim().length === 0}
          className="mt-3 rounded-xl bg-rosa px-5 py-2.5 text-sm font-medium text-neve disabled:opacity-60"
        >
          {textos.comuns.salvar}
        </button>
        {nomeSalvo && (
          <span className="ml-3 text-sm text-rosa-suave">{textos.ajustes.nomeSalvo}</span>
        )}
      </form>

      {/* Nosso espaço */}
      {casal.data && (
        <section className="mt-4 rounded-2xl bg-cartao p-5">
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
              <p className="mt-1 w-fit rounded-xl bg-veu px-4 py-2 font-mono text-2xl tracking-[0.3em] text-rosa-suave">
                {casal.data.casal.codigoConvite}
              </p>
              <p className="mt-1 text-xs text-cinza">{textos.ajustes.codigoDica}</p>
            </div>
          )}
        </section>
      )}

      {/* Sair da conta */}
      <button
        type="button"
        onClick={aoSairDaConta}
        className="mt-4 w-full rounded-2xl border border-linha-forte py-3 text-nevoa"
      >
        {textos.ajustes.sairConta}
      </button>

      {/* Zona de perigo */}
      <section className="mt-8 rounded-2xl border border-rosa/40 p-5">
        <h2 className="text-sm font-medium tracking-wide text-rosa-suave uppercase">
          {textos.ajustes.zonaPerigo}
        </h2>

        <div className="mt-4">
          <button
            type="button"
            onClick={() => setConfirmando('sair-casal')}
            className="text-rosa-suave underline"
          >
            {textos.ajustes.sairCasal}
          </button>
          <p className="mt-1 text-xs text-cinza">{textos.ajustes.sairCasalExplicacao}</p>
        </div>

        <div className="mt-4">
          <button
            type="button"
            onClick={() => setConfirmando('excluir-conta')}
            className="text-rosa-suave underline"
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
        aoConfirmar={aoConfirmar}
        aoCancelar={() => setConfirmando(null)}
      />
    </main>
  )
}
