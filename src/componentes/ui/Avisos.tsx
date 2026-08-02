import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { IconeAlerta, IconeConfirmado } from './icones'

type TipoAviso = 'sucesso' | 'erro'

type Aviso = { id: number; mensagem: string; tipo: TipoAviso }

const ContextoAvisos = createContext<((mensagem: string, tipo?: TipoAviso) => void) | null>(null)

/**
 * Toasts do app: mensagens curtas que sobem perto do rodapé e somem
 * sozinhas. Sucesso confirma ações; erro dá voz às mutations que hoje
 * falhariam em silêncio.
 */
export function ProvedorAvisos({ children }: { children: ReactNode }) {
  const [avisos, setAvisos] = useState<Aviso[]>([])
  const proximoId = useRef(0)

  const avisar = useCallback((mensagem: string, tipo: TipoAviso = 'sucesso') => {
    const id = proximoId.current++
    setAvisos((atuais) => [...atuais, { id, mensagem, tipo }])
    setTimeout(() => {
      setAvisos((atuais) => atuais.filter((aviso) => aviso.id !== id))
    }, 3200)
  }, [])

  const valor = useMemo(() => avisar, [avisar])

  return (
    <ContextoAvisos.Provider value={valor}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-24 z-[60] flex flex-col items-center gap-2 px-6"
      >
        {avisos.map((aviso) => (
          <div
            key={aviso.id}
            className={`entrada-aviso flex w-full max-w-sm items-center gap-2.5 rounded-xl border bg-cartao px-4 py-3 text-sm text-neve shadow-cartao ${
              aviso.tipo === 'erro' ? 'border-erro/40' : 'border-linha'
            }`}
          >
            {aviso.tipo === 'erro' ? (
              <IconeAlerta size={18} weight="fill" className="shrink-0 text-erro" />
            ) : (
              <IconeConfirmado size={18} weight="fill" className="shrink-0 text-sucesso" />
            )}
            {aviso.mensagem}
          </div>
        ))}
      </div>
    </ContextoAvisos.Provider>
  )
}

/** Dispara um aviso: `const avisar = useAviso(); avisar('Sessão agendada')`. */
export function useAviso() {
  const avisar = useContext(ContextoAvisos)
  if (!avisar) throw new Error('useAviso precisa do ProvedorAvisos no topo da árvore')
  return avisar
}
