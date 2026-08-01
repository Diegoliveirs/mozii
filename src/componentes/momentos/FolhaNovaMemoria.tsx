import { useRef, useState, type FormEvent } from 'react'
import { useCriarMomento } from '../../hooks/useMomentos'
import { hojeParaCampoData } from '../../lib/datas'
import { textos } from '../../lib/textos'

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
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-abismo/80"
      role="dialog"
      aria-modal="true"
      aria-label={textos.momentos.nova}
      onClick={aoFechar}
    >
      <form
        onSubmit={aoSalvar}
        className="entrada-folha w-full max-w-md rounded-t-2xl bg-cartao p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]"
        onClick={(evento) => evento.stopPropagation()}
      >
        <h2 className="font-voz text-xl text-neve">{textos.momentos.nova}</h2>

        <textarea
          rows={3}
          maxLength={2000}
          placeholder={textos.momentos.legendaDica}
          value={legenda}
          onChange={(evento) => setLegenda(evento.target.value)}
          className="mt-4 w-full resize-none rounded-xl border border-linha bg-veu px-4 py-3 text-neve outline-none placeholder:text-cinza focus:border-rosa"
        />

        <label className="mt-3 flex items-center gap-3 text-sm text-nevoa">
          {textos.momentos.dataRotulo}
          <input
            type="date"
            required
            max={hojeParaCampoData()}
            value={data}
            onChange={(evento) => setData(evento.target.value)}
            className="rounded-xl border border-linha bg-veu px-3 py-2 text-neve outline-none focus:border-rosa"
          />
        </label>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => campoFotos.current?.click()}
            className="rounded-xl border border-linha-forte px-4 py-2.5 text-sm text-nevoa"
          >
            {textos.momentos.fotosRotulo}
          </button>
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

        {erro && <p className="mt-3 text-sm text-rosa-suave">{erro}</p>}

        <button
          type="submit"
          disabled={criar.isPending}
          className="mt-4 w-full rounded-xl bg-rosa py-3 font-medium text-neve disabled:opacity-60"
        >
          {criar.isPending ? textos.momentos.salvando : textos.momentos.salvar}
        </button>
      </form>
    </div>
  )
}
