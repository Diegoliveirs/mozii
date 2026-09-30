import { useEffect, useState } from 'react'
import { estadoPermissao, suporteDePush } from '../../lib/notificacoes'
import { textos } from '../../lib/textos'
import {
  IconeAlerta,
  IconeConfirmado,
  IconeFoto,
  IconeInfo,
  IconeNeutro,
  IconeSino,
} from '../ui/icones'

/**
 * O "lembrete" das permissões do aparelho: o app mostra o que o sistema
 * concedeu ou negou e ensina o caminho de volta. Recheca quando o app
 * volta ao primeiro plano — quem mudou nos ajustes do celular vê o estado
 * novo sem recarregar.
 */
/** Cor do ícone de estado — a decisão é pelo tom, nunca pelo nome da classe. */
const COR_DO_TOM = {
  neutro: 'text-texto-discreto',
  ok: 'text-sucesso',
  perigo: 'text-perigo-texto',
} as const

export function SecaoPermissoes() {
  const [permissaoNotificacoes, setPermissaoNotificacoes] = useState(estadoPermissao())
  const precisaInstalar = suporteDePush() === 'precisa-instalar'

  useEffect(() => {
    function rechecar() {
      if (document.visibilityState === 'visible') setPermissaoNotificacoes(estadoPermissao())
    }
    document.addEventListener('visibilitychange', rechecar)
    return () => document.removeEventListener('visibilitychange', rechecar)
  }, [])

  const notificacoes = precisaInstalar
    ? {
        texto: textos.notificacoes.precisaInstalarIos,
        Icone: IconeNeutro,
        tom: 'neutro' as const,
      }
    : permissaoNotificacoes === 'granted'
      ? { texto: textos.notificacoes.estadoConcedida, Icone: IconeConfirmado, tom: 'ok' as const }
      : permissaoNotificacoes === 'denied'
        ? { texto: textos.notificacoes.estadoNegada, Icone: IconeAlerta, tom: 'perigo' as const }
        : { texto: textos.notificacoes.estadoNaoPedida, Icone: IconeNeutro, tom: 'neutro' as const }

  return (
    <section className="cartao mt-4 p-5">
      <h2 className="rotulo-secao">{textos.notificacoes.permissoesTitulo}</h2>

      <ul className="mt-2">
        <li className="flex items-center gap-3 border-b border-borda py-2.5">
          <IconeSino size={17} className="shrink-0 text-texto-secundario" aria-hidden />
          <span className="min-w-0 flex-1">
            <span className="block text-sm text-texto">
              {textos.notificacoes.permissaoNotificacoes}
            </span>
            <span className="block text-xs text-texto-discreto">{notificacoes.texto}</span>
          </span>
          <notificacoes.Icone
            size={17}
            weight={notificacoes.tom === 'neutro' ? 'regular' : 'fill'}
            className={`shrink-0 ${COR_DO_TOM[notificacoes.tom]}`}
            aria-hidden
          />
        </li>
        <li className="flex items-center gap-3 py-2.5">
          <IconeFoto size={17} className="shrink-0 text-texto-secundario" aria-hidden />
          <span className="min-w-0 flex-1">
            <span className="block text-sm text-texto">
              {textos.notificacoes.permissaoCameraFotos}
            </span>
            <span className="block text-xs text-texto-discreto">
              {textos.notificacoes.cameraGerenciadaPeloSistema}
            </span>
          </span>
          <IconeNeutro size={17} className="shrink-0 text-texto-discreto" aria-hidden />
        </li>
      </ul>

      <p className="mt-2 flex items-start gap-1.5 rounded-xl bg-vidro px-3 py-2.5 text-xs text-texto-discreto">
        <IconeInfo size={14} className="mt-0.5 shrink-0" aria-hidden />
        {textos.notificacoes.dicaReativar}
      </p>
    </section>
  )
}
