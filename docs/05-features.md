# 05 — Features

Estado de cada função do app. Uma feature só muda para ✅ com esta página atualizada e os testes verdes.

| #   | Feature                                                  | Fase | Status |
| --- | -------------------------------------------------------- | ---- | ------ |
| 1   | Autenticação (e-mail + senha)                            | 1    | ✅     |
| 2   | Pareamento por código de convite (máx. 2)                | 1    | ✅     |
| 3   | Mural (feed do casal, 4 tipos de publicação)             | 3    | ✅     |
| 4   | Reações por emoji livre + comentários                    | 3    | ✅     |
| 5   | Listas de filmes (ilimitadas)                            | 2    | ✅     |
| 6   | Busca TMDB + página do filme + onde assistir             | 2    | ✅     |
| 7   | Sorteio "O que ver hoje" (caça-níquel)                   | 2    | ✅     |
| 8   | Momentos (diário de fotos do casal)                      | 4    | ✅     |
| 9   | Perfil estilo Letterboxd + favoritos + histograma        | 4    | ✅     |
| 10  | Cartão de compartilhar (Stories 1080×1920, 3 temas)      | 4    | ✅     |
| 11  | Tempo real (mudanças do par sem recarregar)              | 3    | ✅     |
| 12  | Ajustes (nome, avatar, sair, excluir conta com carência) | 1/4  | ✅     |
| 13  | **Sessão de cinema agendada** (nova)                     | 5    | 🔜     |

## Detalhes por feature

### 1. Autenticação (entregue na Fase 1)

Cadastro (nome + e-mail + senha, mínimo 8) e entrada por e-mail/senha. O trigger do banco cria o perfil na hora do cadastro. Sem sessão, qualquer rota privada volta para `/entrar`; com sessão e sem casal, volta para `/parear`.

### 2. Pareamento (entregue na Fase 1)

Uma pessoa cria o casal e recebe um código de 6 caracteres (sem 0/O/1/I); a outra entra com o código. Força bruta bloqueada: 5 tentativas falhas a cada 15 minutos. Código inválido retorna `NULL` da RPC (o app mostra "código inválido"); casal cheio e excesso de tentativas retornam erro com mensagem em português. O máximo de 2 pessoas é garantido pelo banco em três camadas — ver [02-banco-e-seguranca.md](02-banco-e-seguranca.md).

### 5–7. Cinema: listas, busca e sorteio (entregues na Fase 2)

O hub Cinema tem duas abas guardadas na URL (`?aba=listas`). A busca consulta o TMDB em pt-BR com debounce de 400 ms; a página do filme traz backdrop, sinopse, gêneros, duração e **Onde assistir** (streaming ou aluguel na região BR + link JustWatch, atribuição exigida pelo TMDB). Filmes entram em listas pela folha "Em qual lista?" — que também cria listas na hora — e cada filme tocado é gravado no cache `filmes` via RPC validada. Na lista: marcar assistido, remover, excluir a lista e o **sorteio caça-níquel** (roda só entre os não-assistidos, pôsteres desfocados com atrasos crescentes até travar no sorteado, com "Sortear de novo").

### 3, 4 e 11. Mural, reações/comentários e tempo real (entregues na Fase 3)

O Mural é o feed infinito do casal (cursor por `criado_em`, páginas de 20). Quatro tipos de publicação: **texto** (com foto opcional, redimensionada para WebP no navegador e guardada no bucket privado), **avaliação** (filme + nota com meia estrela + texto), **atividade** (linha discreta gerada pelo app ao mexer nas listas) e **momento** (espelho do diário, chega na Fase 4). Reações por **emoji livre** (chips agrupados, fileira rápida + campo para qualquer emoji; tocar de novo desfaz) e comentários inline — os dois com update otimista e rollback. O composer fica no botão rosa central; a publicação tem página própria com conversa aberta, edição (avaliações, só do autor) e exclusão (só do autor). O **tempo real** monta um canal por casal na casca do app: cada mudança do par invalida as queries certas e a tela atualiza sozinha — comprovado por E2E com duas janelas.

### 12. Ajustes e exclusão de conta (entregue na Fase 1, sem avatar)

Ajustes traz: editar o nome, ver quem está no espaço (com o código de convite enquanto falta o par), sair da conta e a zona de perigo (sair do espaço / excluir conta, ambos com diálogo de confirmação). O upload de avatar chega na Fase 4 junto com o Storage — decisão registrada para não criar bucket antes da migration 005.

Pedir exclusão grava `exclusao_solicitada_em`; um job do pg_cron apaga a conta de verdade após 30 minutos. Entrar no app dentro da carência cancela automaticamente (o app chamará `cancelar_exclusao_conta()` a cada entrada). Cascata: excluir a conta leva o perfil junto (e, nas próximas fases, publicações, listas e momentos).

### 8–10. Momentos, perfil e cartão de compartilhar (entregues na Fase 4)

**Momentos**: diário do casal com linha do tempo agrupada por dia e ordenada por `aconteceu_em` (data retroativa permitida); memórias com várias fotos (lightbox com teclado e contador), marcos de aniversário calculados a partir da data guardada no casal, e espelho no Mural com desfazer atômico. **Perfil**: seletor entre os dois, 4 estatísticas calculadas no cliente, 5 favoritos por pessoa (limite estrutural no banco), avaliações recentes, histograma de notas e as "Pegadas". **Cartão**: 1080×1920 desenhado em canvas puro com 3 temas, estrelas fracionárias, validação de blob em branco e Web Share com fallback de download. Avatar (400px WebP) editável nos Ajustes.

### 13. Sessão de cinema agendada (desenho aprovado)

O casal agenda um filme para uma data/hora: pela página do filme, pelo item da lista ou direto do resultado do sorteio ("Agendar este!"). Um cartão fixo no topo do Mural mostra o pôster e a contagem regressiva. Passado o horário, vira "E aí, como foi? 🍿" com atalho para avaliar (a avaliação conclui a sessão e marca o filme como assistido na lista de origem). Lembrete via "Adicionar ao calendário" (`.ics`). Detalhes no plano aprovado e na futura migration 006.

_As demais features serão detalhadas aqui quando forem entregues, nas suas fases._
