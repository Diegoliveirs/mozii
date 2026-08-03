import { useState } from 'react'
import { useAtivarNotificacoes } from '../../hooks/useNotificacoes'
import { ambiente } from '../../lib/ambiente'
import { estadoPermissao, suporteDePush } from '../../lib/notificacoes'
import { textos } from '../../lib/textos'
import { Botao } from '../ui/Botao'
import { IconeSinoTocando } from '../ui/icones'

const CHAVE_DISPENSA = 'mozii-convite-notificacoes-dispensado'

/**
 * Convite único no Mural para ativar as notificações — só aparece quando
 * o aparelho suporta, a permissão nunca foi pedida e o casal está completo.
 * "Agora não" dispensa para sempre (localStorage); os Ajustes continuam lá.
 */
export function ConviteNotificacoes({ casalCompleto }: { casalCompleto: boolean }) {
  const ativar = useAtivarNotificacoes()
  const [dispensado, setDispensado] = useState(() => localStorage.getItem(CHAVE_DISPENSA) === 'sim')

  const cabivel =
    casalCompleto &&
    !dispensado &&
    ambiente.chavePublicaVapid !== null &&
    suporteDePush() === 'suportado' &&
    estadoPermissao() === 'default'

  if (!cabivel) return null

  function dispensar() {
    localStorage.setItem(CHAVE_DISPENSA, 'sim')
    setDispensado(true)
  }

  return (
    <div className="mt-4 rounded-2xl border border-rosa/40 bg-cartao p-4 shadow-cartao">
      <div className="flex items-center gap-3">
        <IconeSinoTocando size={22} className="shrink-0 text-rosa-suave" aria-hidden />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-neve">{textos.notificacoes.conviteTitulo}</p>
          <p className="mt-0.5 text-xs text-cinza">{textos.notificacoes.conviteDescricao}</p>
        </div>
      </div>
      <div className="mt-3 flex gap-2">
        <Botao
          carregando={ativar.isPending}
          onClick={() => ativar.mutate(undefined, { onSettled: dispensar })}
          className="flex-1 py-2.5 text-xs"
        >
          {textos.notificacoes.conviteAtivar}
        </Botao>
        <Botao variante="fantasma" onClick={dispensar} className="flex-1 py-2.5 text-xs">
          {textos.notificacoes.conviteDepois}
        </Botao>
      </div>
    </div>
  )
}
