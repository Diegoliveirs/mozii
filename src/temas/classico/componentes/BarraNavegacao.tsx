import type { PropsBarraNavegacao } from '../../contrato'
import { AbaNavegacao } from '../../comum/AbaNavegacao'
import type { AbaNavegacao as DadosAba } from '../../comum/abasNavegacao'

function Aba({ aba }: { aba: DadosAba }) {
  return (
    <AbaNavegacao
      aba={aba}
      className={(ativa) =>
        `flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] ${
          ativa ? 'text-afeto-claro' : 'text-texto-discreto'
        }`
      }
    >
      {(ativa) => (
        <>
          {/* Peso fill na aba ativa: convenção de app nativo */}
          <aba.Icone size={22} weight={ativa ? 'fill' : 'regular'} aria-hidden />
          {aba.rotulo}
        </>
      )}
    </AbaNavegacao>
  )
}

/** Clássico: barra fixa colada no rodapé, com o botão central de publicar. */
export function BarraNavegacao({ abas, abaNova }: PropsBarraNavegacao) {
  const meio = Math.ceil(abas.length / 2)
  return (
    <nav className="fixed inset-x-0 bottom-0 border-t border-borda bg-fundo-profundo/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
      <div className="mx-auto flex max-w-md items-center">
        {abas.slice(0, meio).map((aba) => (
          <Aba key={aba.para} aba={aba} />
        ))}
        <AbaNavegacao
          aba={abaNova}
          className={() =>
            'mx-2 -mt-4 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primario text-primario-texto shadow-cartao transition-transform active:scale-95'
          }
        >
          {() => <abaNova.Icone size={24} weight="bold" aria-hidden />}
        </AbaNavegacao>
        {abas.slice(meio).map((aba) => (
          <Aba key={aba.para} aba={aba} />
        ))}
      </div>
    </nav>
  )
}
