/**
 * Ouvinte de autenticação que chama `limpar` sempre que a conta muda —
 * inclusive logout em outra aba, sessão expirada ou login de outra pessoa.
 * O primeiro aviso (sessão inicial) só registra quem está logado.
 * Lógica pura, testada.
 */
export function aoTrocarDeConta(limpar: () => void) {
  let anterior: string | null | undefined
  return (usuario: { id: string } | null) => {
    const atual = usuario?.id ?? null
    if (anterior !== undefined && atual !== anterior) limpar()
    anterior = atual
  }
}
