# 06 — Frontend

## Nomenclatura em português

Regra do projeto: **tudo em pt-BR**, inclusive identificadores. Exemplos do padrão:

| Tipo        | Padrão                                             | Exemplos                                                     |
| ----------- | -------------------------------------------------- | ------------------------------------------------------------ |
| Pastas      | substantivo, minúsculas                            | `src/paginas`, `src/componentes`, `src/dominio`, `src/dados` |
| Páginas     | `Pagina*`                                          | `PaginaInicial`, `PaginaMural`, `PaginaAjustes`              |
| Componentes | substantivo composto                               | `CartaoSessao`, `FaltaConfiguracao`, `BarraNavegacao`        |
| Hooks       | `use` + pt-BR (prefixo `use` é exigência do React) | `useCasal`, `useMural`, `useSessoes`                         |
| Funções SQL | verbo no infinitivo                                | `criar_casal()`, `entrar_no_casal()`, `gravar_filme()`       |
| Testes      | `*.teste.ts` (unitário), `*.spec.ts` (E2E)         | `ambiente.teste.ts`, `fumaca.spec.ts`                        |

## Tema visual (Tailwind v4, inline em `src/index.css`)

Mesma identidade do Mozii original: fundo escuro quente, rosa como cor de afeto, dourado nas estrelas. Os tokens viram classes automaticamente (`--color-noite` → `bg-noite`).

| Token                         | Valor                             | Uso                                |
| ----------------------------- | --------------------------------- | ---------------------------------- |
| `noite`                       | `#16131c`                         | fundo padrão                       |
| `abismo`                      | `#0e0b12`                         | fundo atrás de modais/navegação    |
| `cartao`                      | `#221d2b`                         | superfícies elevadas               |
| `veu`                         | `#2e2839`                         | chips e campos sobre o cartão      |
| `linha` / `linha-forte`       | `#2a2533` / `#3a3346`             | divisores                          |
| `rosa` / `rosa-suave`         | `#d4537e` / `#ed93b1`             | ações principais / detalhes        |
| `estrela` / `estrela-apagada` | `#efb927` / `#4a4356`             | notas                              |
| `erro` / `sucesso`            | `#e56b6b` / `#6bbf8e`             | estados (rosa é afeto, não erro)   |
| `cartao-alto`                 | `#2a2435`                         | superfícies sobre o cartão         |
| `neve` / `nevoa` / `cinza`    | `#f2edf5` / `#c3bccd` / `#8d8499` | textos (forte → discreto)          |
| `--font-voz`                  | Fraunces variável (self-hosted)   | títulos afetivos (`font-voz`)      |
| `--shadow-cartao`             | sombra dupla suave                | cartões elevados (`shadow-cartao`) |

Desde o redesign (02/08/2026): ícones são **Phosphor** via `componentes/ui/icones.tsx` (nomes PT; fill = ativo, regular = inativo) — emoji só como afeto em textos; a Fraunces mora em `public/fontes/` (`@font-face` no `index.css`, CSP `font-src 'self'`); o grão de filme é um `body::before` com SVG em data-URI; primitivas de UI em `componentes/ui/` (`Botao`, `Campo`/`AreaTexto`, `FolhaBase`, `DialogoConfirmar`, `ProvedorAvisos`/`useAviso`, `Esqueleto`, `EstadoVazio`, `ControleSegmentado`) — **nenhum componente escreve classes de botão/campo/folha à mão**.

## iOS (regras do Diego — não relaxar)

1. **Notch:** o app usa `viewport-fit=cover` (desenha sob o recorte). A classe `.area-segura-topo` (`padding-top: env(safe-area-inset-top)`) vai em toda tela raiz/pública e no `CabecalhoPagina`; controles de overlay no topo (ex.: fechar do lightbox) usam `top: max(1rem, env(safe-area-inset-top))`. **Nada importante fica embaixo do notch.**
2. **Zoom desativado de verdade:** o viewport declara `maximum-scale=1, user-scalable=no`, mas o Safari do iPhone ignora isso na pinça e no toque duplo — `lib/travarZoom.ts` bloqueia os dois gestos (chamado no `main.tsx`). Campos com 16px evitam o terceiro caso (auto-zoom ao focar).
3. **Voltar em toda tela interna:** `CabecalhoPagina` (botão ← + título) nas telas Filme, Lista, Publicação, Nova publicação e Ajustes — o usuário cancela qualquer ação sem precisar voltar à página inicial. Sem histórico (link direto/PWA), o voltar cai na rota-mãe (`fallback`). As 4 raízes da navegação não têm voltar.

## Convenções de componente

- **Mobile-first sempre:** layout `max-w-md` centralizado; o app é desenhado para 390×844.
- **Textos só em `src/lib/textos.ts`** — nenhum texto de interface direto no JSX.
- Zoom travado (viewport + campos com 16px) para comportamento de app nativo.
- Animações são funções do produto, não enfeite: `entrada-pagina` na troca de rota; o efeito caça-níquel do sorteio virá com sua própria justificativa.
- Estado de tela é `useState` local; estado de servidor é TanStack Query; o único contexto global de UI é o `ProvedorAvisos` (toasts).

## Estrutura de src/

```
src/
├── api/            # clientes de APIs externas (tmdb.ts) — fora da camada de repositórios
├── dominio/        # tipos puros do domínio (sem nada de Supabase)
├── dados/          # repositorios.ts (interfaces) + supabase/ (única pasta que importa supabase-js)
├── hooks/          # wrappers TanStack Query por área
├── componentes/    # ui/ layout/ mural/ filmes/ cinema/ momentos/ perfil/ compartilhar/ sessoes/
├── paginas/        # 1 arquivo por rota
└── lib/            # textos, datas, imagem, ics... + __testes__/
```
