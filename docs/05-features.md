# 05 — Features

Estado de cada função do app. Uma feature só muda para ✅ com esta página atualizada e os testes verdes.

| #   | Feature                                                  | Fase | Status                          |
| --- | -------------------------------------------------------- | ---- | ------------------------------- |
| 1   | Autenticação (e-mail + senha)                            | 1    | 🔜                              |
| 2   | Pareamento por código de convite (máx. 2)                | 1    | 🧱 banco pronto (001), falta UI |
| 3   | Mural (feed do casal, 4 tipos de publicação)             | 3    | 🔜                              |
| 4   | Reações por emoji livre + comentários                    | 3    | 🔜                              |
| 5   | Listas de filmes (ilimitadas)                            | 2    | 🔜                              |
| 6   | Busca TMDB + página do filme + onde assistir             | 2    | 🔜                              |
| 7   | Sorteio "O que ver hoje" (caça-níquel)                   | 2    | 🔜                              |
| 8   | Momentos (diário de fotos do casal)                      | 4    | 🔜                              |
| 9   | Perfil estilo Letterboxd + favoritos + histograma        | 4    | 🔜                              |
| 10  | Cartão de compartilhar (Stories 1080×1920, 3 temas)      | 4    | 🔜                              |
| 11  | Tempo real (mudanças do par sem recarregar)              | 3    | 🔜                              |
| 12  | Ajustes (nome, avatar, sair, excluir conta com carência) | 1/6  | 🧱 banco pronto (001), falta UI |
| 13  | **Sessão de cinema agendada** (nova)                     | 5    | 🔜                              |

## Detalhes por feature

### 2. Pareamento (banco pronto)

Uma pessoa cria o casal e recebe um código de 6 caracteres (sem 0/O/1/I); a outra entra com o código. Força bruta bloqueada: 5 tentativas falhas a cada 15 minutos. Código inválido retorna `NULL` da RPC (o app mostra "código inválido"); casal cheio e excesso de tentativas retornam erro com mensagem em português. O máximo de 2 pessoas é garantido pelo banco em três camadas — ver [02-banco-e-seguranca.md](02-banco-e-seguranca.md).

### 12. Exclusão de conta (banco pronto)

Pedir exclusão grava `exclusao_solicitada_em`; um job do pg_cron apaga a conta de verdade após 30 minutos. Entrar no app dentro da carência cancela automaticamente (o app chamará `cancelar_exclusao_conta()` a cada entrada). Cascata: excluir a conta leva o perfil junto (e, nas próximas fases, publicações, listas e momentos).

### 13. Sessão de cinema agendada (desenho aprovado)

O casal agenda um filme para uma data/hora: pela página do filme, pelo item da lista ou direto do resultado do sorteio ("Agendar este!"). Um cartão fixo no topo do Mural mostra o pôster e a contagem regressiva. Passado o horário, vira "E aí, como foi? 🍿" com atalho para avaliar (a avaliação conclui a sessão e marca o filme como assistido na lista de origem). Lembrete via "Adicionar ao calendário" (`.ics`). Detalhes no plano aprovado e na futura migration 006.

_As demais features serão detalhadas aqui quando forem entregues, nas suas fases._
