/** Destino único de cadastro e reenvio após o Supabase validar o e-mail. */
export function urlDeConfirmacaoEmail(origem: string): string {
  return new URL('/confirmar-email', origem).toString()
}
