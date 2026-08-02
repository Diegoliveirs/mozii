import { Navigate, Outlet } from 'react-router-dom'
import { useMeuPerfil } from '../../hooks/useCasal'
import { TelaAbertura } from '../ui/TelaAbertura'

/** O app só existe dentro de um casal: sem `casalId`, vai parear primeiro. */
export function ExigirCasal() {
  const { data: perfil, isPending } = useMeuPerfil()

  // isPending (e não isLoading): enquanto a sessão não resolve, a query do
  // perfil fica DESABILITADA — e query desabilitada tem isLoading = false.
  // Com isLoading, a guarda expulsava para /parear antes de o perfil chegar.
  if (isPending) return <TelaAbertura />
  if (!perfil?.casalId) return <Navigate to="/parear" replace />
  return <Outlet />
}
