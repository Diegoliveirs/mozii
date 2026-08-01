import { Navigate, Outlet } from 'react-router-dom'
import { useMeuPerfil } from '../../hooks/useCasal'

/** O app só existe dentro de um casal: sem `casalId`, vai parear primeiro. */
export function ExigirCasal() {
  const { data: perfil, isLoading } = useMeuPerfil()

  if (isLoading) return null
  if (!perfil?.casalId) return <Navigate to="/parear" replace />
  return <Outlet />
}
