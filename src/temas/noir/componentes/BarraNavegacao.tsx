import type { PropsBarraNavegacao } from '../../contrato'
import { AbaNavegacao } from '../../comum/AbaNavegacao'
import type { AbaNavegacao as DadosAba } from '../../comum/abasNavegacao'

function Aba({ aba }: { aba: DadosAba }) {
  return (
    <AbaNavegacao
      aba={aba}
      className={(ativa) =>
        `flex h-11 items-center justify-center gap-2 rounded-full text-[13px] font-medium transition-colors ${
          ativa ? 'bg-texto/10 px-4 text-texto' : 'w-12 text-texto-discreto'
        }`
      }
    >
      {(ativa) => (
        <>
          <aba.Icone size={21} weight={ativa ? 'fill' : 'regular'} aria-hidden />
          {/* Só a aba ativa mostra o nome; o nome acessível existe sempre. */}
          {ativa && <span aria-hidden>{aba.rotulo}</span>}
        </>
      )}
    </AbaNavegacao>
  )
}

/** Noir: pílula de vidro flutuando sobre o conteúdo, só ícones. */
export function BarraNavegacao({ abas, abaNova }: PropsBarraNavegacao) {
  const meio = Math.ceil(abas.length / 2)
  return (
    <nav className="fixed inset-x-0 bottom-0 px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
      <div className="mx-auto flex h-16 max-w-md items-center justify-between rounded-full border border-vidro-borda bg-superficie/80 px-2 shadow-[0_20px_40px_-12px_rgb(0_0_0/0.8)] backdrop-blur-vidro backdrop-saturate-150">
        {abas.slice(0, meio).map((aba) => (
          <Aba key={aba.para} aba={aba} />
        ))}
        <AbaNavegacao
          aba={abaNova}
          className={() =>
            'flex h-11 w-11 items-center justify-center rounded-full bg-primario text-primario-texto transition-transform active:scale-95'
          }
        >
          {() => <abaNova.Icone size={21} weight="bold" aria-hidden />}
        </AbaNavegacao>
        {abas.slice(meio).map((aba) => (
          <Aba key={aba.para} aba={aba} />
        ))}
      </div>
    </nav>
  )
}
