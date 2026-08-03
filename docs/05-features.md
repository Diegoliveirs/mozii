# 05 — Features

Estado de cada função do app. Uma feature só muda para ✅ com esta página atualizada e os testes verdes.

| #   | Feature                                                   | Fase | Status |
| --- | --------------------------------------------------------- | ---- | ------ |
| 1   | Autenticação (e-mail + senha)                             | 1    | ✅     |
| 2   | Pareamento por código de convite (máx. 2)                 | 1    | ✅     |
| 3   | Mural (feed do casal, 4 tipos de publicação)              | 3    | ✅     |
| 4   | Curtida (like de coração) + comentários                   | 3/R  | ✅     |
| 5   | Listas de filmes (ilimitadas)                             | 2    | ✅     |
| 6   | Busca TMDB + página do filme + onde assistir              | 2    | ✅     |
| 7   | Sorteio "O que ver hoje" (caça-níquel)                    | 2    | ✅     |
| 8   | Momentos (diário de fotos do casal)                       | 4    | ✅     |
| 9   | Perfil estilo Letterboxd + favoritos + histograma         | 4    | ✅     |
| 10  | Cartão de compartilhar (Stories 1080×1920, 3 temas)       | 4    | ✅     |
| 11  | Tempo real (mudanças do par sem recarregar)               | 3    | ✅     |
| 12  | Ajustes (nome, avatar, sair, excluir conta com carência)  | 1/4  | ✅     |
| 13  | Sessão de cinema agendada                                 | 5    | ✅     |
| 14  | **Redesign "cara de app"** (design system, ícones, fonte) | R    | ✅     |

> **Fase R** = redesign UX/UI de 02/08/2026 (aprovado por mockups no chat).

## Detalhes por feature

### 1. Autenticação (entregue na Fase 1)

Cadastro (nome + e-mail + senha, mínimo 8) e entrada por e-mail/senha. O trigger do banco cria o perfil na hora do cadastro. Sem sessão, qualquer rota privada volta para `/entrar`; com sessão e sem casal, volta para `/parear`.

**Confirmação de e-mail** (ativada pelo Diego no dashboard em 02/08/2026): quando o `signUp` volta sem sessão, o cadastro mostra a tela "Confirma seu e-mail 💌" com o endereço, botão de reenvio (`auth.resend`) e link para entrar. Tentar entrar antes de confirmar mostra mensagem específica (código `email_not_confirmed`), não "e-mail ou senha incorretos". A detecção é dinâmica (`signUp` sem sessão ⇒ tela de confirmação). Detalhe do Supabase com confirmação ativa: cadastrar e-mail repetido volta como "sucesso" sem `identities` (anti-enumeração) — o repositório traduz isso para o erro de "e-mail já tem conta".

### 2. Pareamento (entregue na Fase 1)

Uma pessoa cria o casal e recebe um código de 6 caracteres (sem 0/O/1/I); a outra entra com o código. Força bruta bloqueada: 5 tentativas falhas a cada 15 minutos. Código inválido retorna `NULL` da RPC (o app mostra "código inválido"); casal cheio e excesso de tentativas retornam erro com mensagem em português. O máximo de 2 pessoas é garantido pelo banco em três camadas — ver [02-banco-e-seguranca.md](02-banco-e-seguranca.md).

### 5–7. Cinema: listas, busca e sorteio (entregues na Fase 2)

O hub Cinema tem duas abas guardadas na URL (`?aba=listas`). A busca consulta o TMDB em pt-BR com debounce de 400 ms; a página do filme traz backdrop, sinopse, gêneros, duração e **Onde assistir** (streaming ou aluguel na região BR + link JustWatch, atribuição exigida pelo TMDB). Filmes entram em listas pela folha "Em qual lista?" — que também cria listas na hora — e cada filme tocado é gravado no cache `filmes` via RPC validada. Na lista: marcar assistido, remover, excluir a lista e o **sorteio caça-níquel** (roda só entre os não-assistidos, pôsteres desfocados com atrasos crescentes até travar no sorteado, com "Sortear de novo").

### 3, 4 e 11. Mural, reações/comentários e tempo real (entregues na Fase 3)

O Mural é o feed infinito do casal (cursor por `criado_em`, páginas de 20). Quatro tipos de publicação: **texto** (com foto opcional, redimensionada para WebP no navegador e guardada no bucket privado), **avaliação** (filme + nota com meia estrela + texto), **atividade** (linha discreta gerada pelo app ao mexer nas listas) e **momento** (espelho do diário, chega na Fase 4). Interação estilo Threads (desde o redesign): **curtida de coração** (toggle com animação de pulso; grava sempre `'❤️'` na tabela de reações — sem migration) e **balão de comentário** que abre a visão detalhada, onde a conversa fica sempre aberta — os dois com update otimista e rollback. O cartão inteiro é clicável e leva ao detalhe; a foto é o foco (sangra de borda a borda). O composer fica no botão rosa central; o detalhe da publicação tem compartilhar e **lixeira** no topo (exclusão só do autor, com confirmação), além de edição de avaliações (só do autor). O **tempo real** monta um canal por casal na casca do app: cada mudança do par invalida as queries certas e a tela atualiza sozinha — comprovado por E2E com duas janelas.

### 12. Ajustes e exclusão de conta (Fases 1 e 4)

Ajustes traz: trocar a foto de perfil (400px WebP, entregue na Fase 4 junto com o Storage), editar o nome, ver quem está no espaço (com o código de convite enquanto falta o par), sair da conta e a zona de perigo (sair do espaço / excluir conta, ambos com diálogo de confirmação).

Pedir exclusão grava `exclusao_solicitada_em`; um job do pg_cron apaga a conta de verdade após 30 minutos. Entrar no app dentro da carência cancela automaticamente (o app chamará `cancelar_exclusao_conta()` a cada entrada). Cascata: excluir a conta leva o perfil junto (e, nas próximas fases, publicações, listas e momentos).

### 8–10. Momentos, perfil e cartão de compartilhar (entregues na Fase 4)

**Momentos**: diário do casal com linha do tempo agrupada por dia e ordenada por `aconteceu_em` (data retroativa permitida); memórias com várias fotos (lightbox com teclado e contador), marcos de aniversário calculados a partir da data guardada no casal, e espelho no Mural com desfazer atômico. **Perfil**: seletor entre os dois, 4 estatísticas calculadas no cliente, 5 favoritos por pessoa (limite estrutural no banco), avaliações recentes, histograma de notas e as "Pegadas". **Cartão**: 1080×1920 desenhado em canvas puro com 3 temas, estrelas fracionárias, validação de blob em branco e Web Share com fallback de download. Avatar (400px WebP) editável nos Ajustes.

### 13. Sessão de cinema agendada (entregue na Fase 5)

O casal agenda um filme para uma data/hora por três caminhos: página do filme, botão de pipoca no item da lista ou "Agendar este!" no resultado do sorteio. Desde o redesign, as sessões **moram no Cinema**: a próxima sessão futura é um **ingresso perfurado** em destaque no topo da tela (canhoto com a data e a **contagem regressiva ao vivo** — "em 3 dias" → "em 5 h" → "é agora! 🍿"), de onde saem o "Calendário" (`.ics` com alarme de 30 min — o calendário do celular lembra, zero infra), reagendar e cancelar. Passado o horário, a sessão desce para a seção **"Sessões passadas"** (fim da aba Listas): não avaliada ganha a pill **"Como foi?"** (avaliar abre o composer pré-preenchido e publicar chama a RPC `concluir_sessao` — assistida + vínculo com a avaliação + `assistido` no item de origem, numa transação; ou "só marcar como assistida"); concluída vira linha apagada com check. Agendar publica a atividade no Mural, e o tempo real leva tudo ao par. Reagendar/cancelar/concluir é ação de **qualquer membro**, não só de quem criou.

### 14. Redesign "cara de app" (entregue na Fase R — 02/08/2026)

Sistema de design próprio no lugar do look "gerado por IA": ícones **Phosphor** com nomes PT (`componentes/ui/icones.tsx`; fill = ativo), fonte de voz **Fraunces variável** self-hosted, grão de filme sutil no fundo, tokens novos (`erro`, `sucesso`, `cartao-alto`, `shadow-cartao`) e primitivas compartilhadas (`Botao` com spinner, `Campo`, `FolhaBase` com alça/Esc/trava de scroll, `ProvedorAvisos` com toasts, `Esqueleto`, `EstadoVazio`, `ControleSegmentado`). Assinatura visual: o **ingresso perfurado** (próxima sessão e código de convite). Splash mínima no boot (coração pulsando), tab bar com rótulos, estados vazios com convite + ação, splash screens iOS e ícone novo da PWA em formato de bilhete. Mockups aprovados no chat antes do código.
