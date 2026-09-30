import { textos } from '../../lib/textos'
import type { VariavelObrigatoria } from '../../lib/ambiente'

/**
 * Tela mostrada quando o .env.local está incompleto.
 * Aparece no lugar do app inteiro — melhor uma instrução clara
 * do que uma tela em branco com erro no console.
 */
export function FaltaConfiguracao({ faltando }: { faltando: VariavelObrigatoria[] }) {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-4 px-6">
      <h1 className="font-titulo text-2xl text-afeto-claro">{textos.configuracao.titulo}</h1>
      <p className="text-texto-secundario">{textos.configuracao.explicacao}</p>
      <div className="rounded-xl bg-superficie p-4">
        <p className="mb-2 text-sm text-texto-discreto">{textos.configuracao.variaveisFaltando}</p>
        <ul className="space-y-1">
          {faltando.map((nome) => (
            <li key={nome} className="font-mono text-sm text-texto">
              {nome}
            </li>
          ))}
        </ul>
      </div>
    </main>
  )
}
