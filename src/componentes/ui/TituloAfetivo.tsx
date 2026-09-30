/**
 * Título em duas vozes: o começo normal e o destaque em itálico na cor de
 * afeto, na linha de baixo ("Criar sua / *conta*"). Vai DENTRO do heading;
 * o nome acessível continua sendo a frase inteira.
 */
export function TituloAfetivo({ inicio, destaque }: { inicio: string; destaque: string }) {
  return (
    <>
      {inicio} <br />
      <em className="font-light text-afeto">{destaque}</em>
    </>
  )
}
