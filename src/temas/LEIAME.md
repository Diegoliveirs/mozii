# Temas do Mozii

Todo visual do app é uma pasta aqui dentro. Um tema é um **pacote completo**:

- **tokens** (`tokens.css`): cores, fontes, raios, sombras e vidro;
- **slots** (`componentes/`): barra de navegação, cabeçalho, tela de abertura e camada de adereços;
- **encaixes**: enfeites presos em pontos fixos (canto do ingresso, topo do Mural);
- **textos**: microcopy do tema, que mora em `src/lib/textos.ts → temas.<id>`;
- **ativos** (`ativos/`): svg e png do tema, importados pelo código.

O tema **só renderiza**. Dados, rotas, acessibilidade e textos vêm de lugares compartilhados (`comum/`, `lib/textos.ts`). As primitivas de UI (`Botao`, `Campo`, `ModalBase`…) e as páginas **não são temáveis**: elas reagem aos tokens.

## Peças

| Arquivo              | Papel                                                                         |
| -------------------- | ----------------------------------------------------------------------------- |
| `contrato.ts`        | Tipos: `IdTema`, slots, encaixes, `TemaCompleto`, `TemaParcial`               |
| `registro.ts`        | **Único** lugar para registrar temas e escolher o `TEMA_PADRAO`               |
| `resolverTema.ts`    | Qual tema vale agora (`?tema=` › janela de datas › padrão)                    |
| `carregarTema.ts`    | `import()` da base e do evento; devolve sempre um tema completo               |
| `mesclarTema.ts`     | Evento por cima da base                                                       |
| `aplicarTema.ts`     | `data-tema="noir natal"` no `<html>` + cor da barra do navegador              |
| `ProvedorTema.tsx`   | Entrega o tema (`useTema()`) e monta a camada de adereços                     |
| `EncaixeAdereco.tsx` | Ponto de encaixe de enfeite                                                   |
| `materiais.css`      | Receitas agnósticas (`cartao`, `vidro`, `titulo`, `rotulo-secao`, `ingresso`) |
| `comum/`             | Abas da navegação, link de aba acessível, lógica de voltar                    |

## Trocar o tema padrão

Uma linha em `registro.ts`:

```ts
export const TEMA_PADRAO: IdTema = 'noir' // ou 'classico'
```

Para ver qualquer tema sem trocar o padrão, abra o app com `?tema=classico`.

## Receita: tema de evento (ex.: Natal)

Um tema de evento herda tudo de um tema completo (`base`) e declara só o que muda.

1. Crie `src/temas/natal/tokens.css` só com o que muda:

   ```css
   [data-tema~='natal'] {
     --afeto: #c94b4b;
     --metal: #e6c873;
   }
   ```

2. Crie `src/temas/natal/tema.tsx`:

   ```tsx
   import { textos } from '../../lib/textos'
   import type { TemaParcial } from '../contrato'
   import { Neve } from './componentes/Neve'
   import { Laco } from './componentes/Laco'
   import './tokens.css'

   export const tema: TemaParcial = {
     id: 'natal',
     componentes: { CamadaAderecos: Neve },
     encaixes: { 'ingresso-canto': Laco },
     textos: textos.temas.natal,
   }
   ```

3. Adicione a saudação em `lib/textos.ts`, em `temas.natal`: `saudacao: (nomes) => \`Feliz Natal, ${nomes.join(' & ')}\``.
4. Em `contrato.ts`, acrescente `'natal'` a `IdTema`.
5. Em `registro.ts`, registre:

   ```ts
   natal: {
     base: 'noir',
     inicio: '12-01', // 'MM-DD'; a janela pode atravessar o ano
     fim: '12-26',
     carregar: (): Promise<TemaParcial> => import('./natal/tema').then((m) => m.tema),
   },
   ```

6. Rode `npm run testes:unitarios`. O teste de contraste cobre o `tokens.css` novo sozinho.
7. Confira com `npm run dev` e `?tema=natal`, a 390×844.

**Regras dos adereços:** a `CamadaAderecos` já é `aria-hidden`, sem toque e sem animação com `prefers-reduced-motion`, então o tema não precisa se preocupar com isso. Um enfeite de encaixe se posiciona com `absolute` (o pai já é `relative`). Fonte nova vai para `fontes.css` do tema, com o woff2 e a licença em `public/fontes/`, porque a CSP só aceita fonte local.

**O que o tema não muda:** ícone do app, splash e manifest. O iOS lê esses três só na instalação.

## Receita: tema completo novo (ex.: Liquid Glass)

1. Copie `noir/` para `vidro-liquido/` e troque o seletor para `[data-tema~='vidro-liquido']`.
2. Ajuste os tokens de material: `--desfoque-vidro: 40px`, `--saturacao-vidro: 1.8`, `--brilho-especular: inset 0 1px 0 rgb(255 255 255 / 0.35)`.
3. Reescreva só os slots que mudam, por exemplo uma `BarraNavegacao` em "ilha". Use `AbaNavegacao` e receba as mesmas `abas`, para que a acessibilidade e os testes continuem iguais.
4. Registre o tema em `contrato.ts` (`IdTema`), em `registro.ts` e em `lib/textos.ts` (`temas.<id>`).

## Receita: slot novo

1. Adicione o slot em `ComponentesTema` (`contrato.ts`).
2. O TypeScript vai obrigar cada tema completo a implementá-lo.
3. No ponto de uso, troque o import direto por `useTema().componentes.X`.

## Receita: encaixe novo

1. Adicione o nome em `NomeEncaixe` (`contrato.ts`).
2. Coloque `<EncaixeAdereco nome="…" />` dentro de um pai `relative`.

Sem enfeite para aquele ponto, o encaixe não renderiza nada.
