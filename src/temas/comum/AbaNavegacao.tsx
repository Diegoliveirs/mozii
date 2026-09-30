import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import type { AbaNavegacao as DadosAba } from './abasNavegacao'

/**
 * O link de uma aba, com a a11y resolvida: o nome acessível é SEMPRE o
 * rótulo (mesmo quando o tema mostra só o ícone). O tema decide só a pele.
 */
export function AbaNavegacao({
  aba,
  className,
  children,
}: {
  aba: DadosAba
  className: (ativa: boolean) => string
  children: (ativa: boolean) => ReactNode
}) {
  return (
    <NavLink
      to={aba.para}
      end={aba.para === '/'}
      aria-label={aba.rotulo}
      className={({ isActive }) => className(isActive)}
    >
      {({ isActive }) => children(isActive)}
    </NavLink>
  )
}
