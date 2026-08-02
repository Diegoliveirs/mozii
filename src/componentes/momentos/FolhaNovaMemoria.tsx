import { useRef, useState, type FormEvent } from 'react'
import { useCriarMomento } from '../../hooks/useMomentos'
import { hojeParaCampoData } from '../../lib/datas'
import { textos } from '../../lib/textos'
import { Botao } from '../ui/Botao'
import { AreaTexto } from '../ui/Campo'
import { FolhaBase } from '../ui/FolhaBase'
import { IconeFoto } from '../ui/icones'

/** Folha para registrar uma memória: fotos + legenda + quando aconteceu. */
export function FolhaNovaMemoria({ aoFechar }: { aoFechar: () => void }) {
  const criar = useCriarMomento()
  const [legenda, setLegenda] = useState('')
  const [data, setData] = useState(hojeParaCampoData())
  const [fotos, setFotos] = useState<File[]>([])
  const [erro, setErro] = useState<string | null>(null)
  const campoFotos = useRef<HTMLInputElement>(null)

  async function aoSalvar(evento: FormEvent) {
    evento.preventDefault()
    setErro(null)
    const texto = legenda.trim() || null

    if (!texto && fotos.length === 0) {
      setErro(textos.momentos.faltaConteudo)
      return
    }

    try {
      await criar.mutateAsync({ legenda: texto, aconteceuEm: data, fotos })
      aoFechar()
    } catch {
      setErro(textos.comuns.erroInesperado)
    }
  }

  return (
    <FolhaBase rotulo={textos.momentos.nova} titulo={textos.momentos.nova} aoFechar={aoFechar}>
      <form onSubmit={aoSalvar}>
        <AreaTexto
          rows={3}
          maxLength={2000}
          placeholder={textos.momentos.legendaDica}
          value={legenda}
          onChange={(evento) => setLegenda(evento.target.value)}
          className="mt-4 resize-none"
        />

        <label className="mt-3 flex items-center gap-3 text-sm text-nevoa">
          {textos.momentos.dataRotulo}
          <input
            type="date"
            required
            max={hojeParaCampoData()}
            value={data}
            onChange={(evento) => setData(evento.target.value)}
            className="rounded-xl border border-linha bg-veu px-3 py-2 text-neve outline-none transition-colors focus:border-rosa"
          />
        </label>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Botao variante="fantasma" onClick={() => campoFotos.current?.click()} className="py-2.5">
            <IconeFoto size={17} aria-hidden />
            {textos.momentos.fotosRotulo}
          </Botao>
          <input
            ref={campoFotos}
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={(evento) => setFotos([...(evento.target.files ?? [])])}
          />
          {fotos.map((foto) => (
            <img
              key={foto.name}
              src={URL.createObjectURL(foto)}
              alt=""
              className="h-12 w-12 rounded-lg object-cover"
            />
          ))}
        </div>

        {erro && <p className="mt-3 text-sm text-erro">{erro}</p>}

        <Botao type="submit" carregando={criar.isPending} className="mt-4 w-full">
          {textos.momentos.salvar}
        </Botao>
      </form>
    </FolhaBase>
  )
}
