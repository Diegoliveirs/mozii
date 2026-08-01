import { useRegisterSW } from 'virtual:pwa-register/react'
import { textos } from '../../lib/textos'

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
      <div className="entrada-folha flex w-full max-w-md items-center gap-3 rounded-2xl border border-linha-forte bg-cartao p-4 shadow-lg">
        <p className="min-w-0 flex-1 text-sm text-nevoa">{textos.atualizacao.disponivel}</p>
        <button
          type="button"
          onClick={() => updateServiceWorker(true)}
          className="rounded-xl bg-rosa px-4 py-2 text-sm font-medium text-neve"
        >
          {textos.atualizacao.atualizar}
        </button>
      </div>
    </div>
  )
}
