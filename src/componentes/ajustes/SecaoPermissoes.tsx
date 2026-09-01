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
        cor: 'text-cinza',
      }
    : permissaoNotificacoes === 'granted'
      ? { texto: textos.notificacoes.estadoConcedida, Icone: IconeConfirmado, cor: 'text-sucesso' }
      : permissaoNotificacoes === 'denied'
        ? { texto: textos.notificacoes.estadoNegada, Icone: IconeAlerta, cor: 'text-erro' }
        : { texto: textos.notificacoes.estadoNaoPedida, Icone: IconeNeutro, cor: 'text-cinza' }

  return (
    <section className="mt-4 rounded-2xl border border-linha bg-cartao p-5 shadow-cartao">
      <h2 className="text-xs font-medium tracking-wide text-rosa-suave uppercase">
        {textos.notificacoes.permissoesTitulo}
      </h2>

      <ul className="mt-2">
        <li className="flex items-center gap-3 border-b border-linha py-2.5">
          <IconeSino size={17} className="shrink-0 text-nevoa" aria-hidden />
          <span className="min-w-0 flex-1">
            <span className="block text-sm text-neve">
              {textos.notificacoes.permissaoNotificacoes}
            </span>
            <span className="block text-xs text-cinza">{notificacoes.texto}</span>
          </span>
          <notificacoes.Icone
            size={17}
            weight={notificacoes.cor === 'text-cinza' ? 'regular' : 'fill'}
            className={`shrink-0 ${notificacoes.cor}`}
            aria-hidden
          />
        </li>
        <li className="flex items-center gap-3 py-2.5">
          <IconeFoto size={17} className="shrink-0 text-nevoa" aria-hidden />
          <span className="min-w-0 flex-1">
            <span className="block text-sm text-neve">
              {textos.notificacoes.permissaoCameraFotos}
            </span>
            <span className="block text-xs text-cinza">
              {textos.notificacoes.cameraGerenciadaPeloSistema}
            </span>
          </span>
          <IconeNeutro size={17} className="shrink-0 text-cinza" aria-hidden />
        </li>
      </ul>

      <p className="mt-2 flex items-start gap-1.5 rounded-xl bg-veu px-3 py-2.5 text-xs text-cinza">
        <IconeInfo size={14} className="mt-0.5 shrink-0" aria-hidden />
        {textos.notificacoes.dicaReativar}
      </p>
    </section>
  )
}
