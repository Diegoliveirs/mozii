import { useRegisterSW } from 'virtual:pwa-register/react'
import { textos } from '../../lib/textos'
import { Botao } from './Botao'

/**
 * Aviso de versão nova do app: o service worker baixou o bundle atualizado
 * e espera o "Atualizar" — nada troca sozinho embaixo do usuário.
 */
export function AvisoAtualizacao() {
  const {
    needRefresh: [precisaAtualizar],
    updateServiceWorker,
  } = useRegisterSW()

  if (!precisaAtualizar) return null

  return (
    <div className="fixed inset-x-0 bottom-20 z-50 flex justify-center px-5">
      <div className="entrada-folha flex w-full max-w-md items-center gap-3 rounded-cartao border border-borda-forte bg-superficie p-4 shadow-cartao">
        <p className="min-w-0 flex-1 text-sm text-texto-secundario">
          {textos.atualizacao.disponivel}
        </p>
        <Botao onClick={() => updateServiceWorker(true)}>{textos.atualizacao.atualizar}</Botao>
      </div>
    </div>
  )
}
