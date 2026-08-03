import type { PreferenciasNotificacao } from '../../dados/repositorios'
import {
  useAtivarNotificacoes,
  useDesativarNotificacoes,
  useInscricaoAtual,
  usePreferencias,
  useSalvarPreferencias,
} from '../../hooks/useNotificacoes'
import { ambiente } from '../../lib/ambiente'
import { estadoPermissao, suporteDePush } from '../../lib/notificacoes'
import { textos } from '../../lib/textos'
import { Alternador } from '../ui/Alternador'
import { IconeSino } from '../ui/icones'

const TIPOS: (keyof PreferenciasNotificacao)[] = [
  'comentarios',
  'publicacoes',
  'curtidas',
  'memorias',
  'listas',
  'casal',
]

/**
 * Notificações nos Ajustes: o toggle geral é o GESTO que pede a permissão
 * nativa e inscreve este aparelho; por tipo, cada um escolhe o que recebe.
 */
export function SecaoNotificacoes() {
  const suporte = suporteDePush()
  const inscricao = useInscricaoAtual()
  const ativar = useAtivarNotificacoes()
  const desativar = useDesativarNotificacoes()

  const ativas = Boolean(inscricao.data) && estadoPermissao() === 'granted'
  const preferencias = usePreferencias(ativas)
  const salvar = useSalvarPreferencias()

  const indisponivelPorque =
    suporte === 'precisa-instalar'
      ? textos.notificacoes.precisaInstalarIos
      : suporte === 'indisponivel'
        ? textos.notificacoes.indisponivel
        : !ambiente.chavePublicaVapid
          ? textos.notificacoes.semChave
          : null

  return (
    <section className="mt-4 rounded-2xl border border-linha bg-cartao p-5 shadow-cartao">
      <div className="flex items-center gap-2.5">
        <IconeSino
          size={18}
          weight={ativas ? 'fill' : 'regular'}
          className="text-rosa-suave"
          aria-hidden
        />
        <h2 className="flex-1 font-medium text-neve">{textos.notificacoes.titulo}</h2>
        {!indisponivelPorque && (
          <Alternador
            ligado={ativas}
            rotulo={textos.notificacoes.titulo}
            desabilitado={ativar.isPending || desativar.isPending || inscricao.isPending}
            aoMudar={(novo) => (novo ? ativar.mutate() : desativar.mutate())}
          />
        )}
      </div>
      <p className="mt-1.5 text-xs text-cinza">
        {indisponivelPorque ?? textos.notificacoes.descricao}
      </p>

      {ativas && (
        <ul className="mt-3">
          {TIPOS.map((tipo) => (
            <li
              key={tipo}
              className="flex items-center justify-between border-b border-linha py-2.5 last:border-b-0"
            >
              <span className="text-sm text-nevoa">{textos.notificacoes.tipos[tipo]}</span>
              <Alternador
                ligado={preferencias.data?.[tipo] ?? true}
                rotulo={textos.notificacoes.tipos[tipo]}
                desabilitado={preferencias.isPending || salvar.isPending}
                aoMudar={(novo) => salvar.mutate({ [tipo]: novo })}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
