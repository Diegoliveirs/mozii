/**
 * Imprime o corpo do push de novidades a partir da nota mais nova de
 * `textos.novidades.notas` — usado pelo workflow avisar-novidades.yml:
 *
 *   node scripts/nota-mais-nova.mjs
 *   → {"tipo":"novidades","versao":"2.1","titulo":"O Mozii ficou Noir"}
 *
 * O Node (≥ 23.6) lê o .ts direto: o textos.ts só tem `import type`.
 */
import { textos } from '../src/lib/textos.ts'

const [nota] = textos.novidades.notas
console.log(
  JSON.stringify({
    tipo: 'novidades',
    versao: nota.versao,
    titulo: `${nota.tituloInicio} ${nota.tituloDestaque}`,
  }),
)
