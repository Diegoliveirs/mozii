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

## Temas (`src/temas/`)

Todo visual é uma pasta em `src/temas/<id>/`. O padrão é o **Noir**, e o visual de 02/08 continua disponível como **Clássico**. Receitas, peças e regras estão em [`src/temas/LEIAME.md`](../src/temas/LEIAME.md). Um tema traz:

- tokens (`tokens.css`);
- slots (barra, cabeçalho, abertura, camada de adereços);
- encaixes de enfeite;
- textos (`textos.temas.<id>`).

**Como funciona:**

- Os tokens têm nome de **função**, nunca de cor.
- O `@theme inline` do `index.css` mapeia cada classe para a variável que o tema ativo define em `[data-tema~='id']`: `--color-fundo: var(--fundo)` gera `bg-fundo`.
- Opacidade funciona normalmente (`bg-afeto/20`).

| Token (classe)                                                          | Noir                       | Clássico              | Uso                                   |
| ----------------------------------------------------------------------- | -------------------------- | --------------------- | ------------------------------------- |
| `fundo`                                                                 | `#0c0a0f`                  | `#16131c`             | fundo da tela                         |
| `fundo-profundo`                                                        | `#07060a`                  | `#0e0b12`             | atrás de modais e navegação           |
| `superficie`                                                            | `#16131b`                  | `#221d2b`             | cartões                               |
| `vidro` / `vidro-borda`                                                 | branco 4,5% / 8%           | `#2e2839` / `#3a3346` | campos, chips, botões de vidro        |
| `borda` / `borda-forte`                                                 | branco 6% / 12%            | `#2a2533` / `#3a3346` | divisores                             |
| `texto` / `texto-secundario` / `texto-discreto` / `texto-apagado`       | marfim → cinzas            | neve → cinzas         | textos, do forte ao decorativo        |
| `primario` / `primario-texto`                                           | marfim / quase preto       | rosa / neve           | **ação** (botão principal, "+", foco) |
| `afeto` / `afeto-claro`                                                 | `#e48aa6` / `#f0a9bf`      | `#d4537e` / `#ed93b1` | coração, ingresso, detalhes afetivos  |
| `metal` / `metal-apagado`                                               | champanhe                  | dourado               | estrelas                              |
| `perigo` / `perigo-texto` / `sucesso`                                   |                            |                       | estados (afeto nunca é erro)          |
| `avatar-1(-texto)` / `avatar-2(-texto)`                                 |                            |                       | inicial do avatar por pessoa          |
| `font-titulo` / `font-corpo`                                            | Fraunces / Instrument Sans | Fraunces / system-ui  | tipografia                            |
| `rounded-botao` / `rounded-campo` / `rounded-cartao` / `rounded-poster` | pílula / 18 / 24 / 12 px   | 12 / 12 / 16 / 8 px   | formas                                |
| `shadow-cartao` / `shadow-poster` / `backdrop-blur-vidro`               |                            |                       | profundidade e vidro                  |

**Receitas de `src/temas/materiais.css`** (combinam tokens, então valem em qualquer tema):

| Utility        | O que é                          |
| -------------- | -------------------------------- |
| `cartao`       | cartão elevado                   |
| `vidro`        | vidro fosco                      |
| `titulo`       | família e peso do título do tema |
| `rotulo-secao` | caixa-alta de seção              |
| `ingresso`     | a assinatura do ingresso         |

**Tokens de componente:** o que muda de natureza entre temas vira token de componente. É o caso de `--botao-secundario-*` (contorno no Clássico, vidro no Noir) e de `--respiro-navegacao` (a barra flutuante pede mais espaço).

**Base do redesign (continua valendo):**

- Ícones são **Phosphor** via `componentes/ui/icones.tsx` (nomes PT; fill = ativo, regular = inativo). Emoji só como afeto em textos.
- As fontes moram em `public/fontes/`, com as licenças OFL. O `@font-face` fica no `fontes.css` de cada tema, e a CSP é `font-src 'self'`.
- O grão de filme é um `body::before`.
- As primitivas ficam em `componentes/ui/`: `Botao` (e `classesBotao` para `<Link>`), `Campo`/`AreaTexto`, `FolhaBase`, `ModalBase`, `DialogoConfirmar`, `ProvedorAvisos`/`useAviso`, `Esqueleto`, `EstadoVazio`, `ControleSegmentado`.
- **Variações das primitivas:**
  - `Botao grande`, o botão principal de uma tela;
  - `Campo rotulo="…"`, com o rótulo dentro da moldura (nome acessível = rótulo);
  - `AreaTexto livre`, sem moldura, usada no compositor.
- **Peças de composição do layout Noir:**
  - `TituloAfetivo`, o título em duas vozes com o destaque em itálico afetivo;
  - `ColagemPosteres`, a vitrine decorativa do Entrar;
  - `SeloEnvelope`, o envelope das telas de e-mail;
  - `CapaEmLeque`, as capas de lista abertas em leque.

  As páginas usam essa estrutura em todos os temas (decisão de 29/09/2026, caminho A); o tema muda só a pele.

- **Nenhum componente escreve classes de botão, campo ou modal à mão.** A exceção é o compositor de comentário, que é em pílula de propósito.
- **Página nunca pergunta qual é o tema.** Estrutura diferente vira slot ou encaixe (`useTema()`, `<EncaixeAdereco>`).

## Nota de atualização (a cada merge)

Todo merge que muda algo visível ganha uma nota. Ela vira o popup depois do botão Atualizar e entra no histórico de Ajustes › Novidades.

1. Em `src/lib/textos.ts`, acrescente uma entrada **no topo** de `novidades.notas`:
   - `versao`: maior que a anterior, ex. `'2.2'`;
   - `data`: `AAAA-MM-DD`;
   - `tituloInicio` + `tituloDestaque`: o título em duas vozes, ex. "Chegou o" + _Natal_;
   - `novidades`, `correcoes` e `avisos`: listas de frases curtas, em linguagem de gente, com até ~5 itens por seção. Seção vazia não aparece.
2. Rode `npm run testes:unitarios`. O `novidades.teste.ts` confere que as versões são únicas, que as datas são válidas e estão em ordem, e que nenhuma nota fica vazia.
3. Um merge sem nota nova simplesmente não mostra o popup.

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
├── temas/          # um tema por pasta (noir/, classico/) + contrato, registro, comum/
└── lib/            # textos, datas, imagem, ics... + __testes__/
```
