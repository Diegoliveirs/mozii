import type { RepositorioArquivos } from '../dados/repositorios'
import { redimensionarFoto } from './imagem'

/**
 * Sobe as fotos (redimensionadas, na ordem escolhida) e grava o registro que
 * aponta para elas. Se qualquer passo falhar — um upload no meio, ou a
 * gravação —, apaga o que já subiu: foto sem publicação/memória não fica
 * perdida no bucket.
 *
 * ponytail: se a gravação der certo no banco mas a resposta se perder na
 * rede, as fotos são apagadas e o registro fica sem elas; raríssimo num
 * app de 2 pessoas — se aparecer, conferir no banco antes de apagar.
 */
export async function gravarComFotos<T>(
  arquivos: RepositorioArquivos,
  fotos: File[],
  gravar: (caminhos: string[]) => Promise<T>,
): Promise<T> {
  const caminhos: string[] = []
  try {
    for (const foto of fotos) {
      caminhos.push(await arquivos.enviarFoto(await redimensionarFoto(foto)))
    }
    return await gravar(caminhos)
  } catch (erro) {
    // Melhor esforço: a falha original é a que importa para quem chamou.
    await arquivos.apagarFotos(caminhos).catch(() => {})
    throw erro
  }
}
