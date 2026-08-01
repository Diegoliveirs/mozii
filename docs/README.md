# Documentação do Mozii 2.0

O Mozii é o cantinho de filmes do casal: listas do que ver, avaliações, diário de momentos e sessões de cinema agendadas — para exatamente duas pessoas, sem nada pago.

Esta pasta é a **fonte da verdade** do projeto. Nenhuma feature é considerada pronta sem a documentação correspondente atualizada.

## Como ler

| Documento                                            | O que responde                                                               |
| ---------------------------------------------------- | ---------------------------------------------------------------------------- |
| [01-arquitetura.md](01-arquitetura.md)               | Como o app é montado e por quê (inclui o registro de decisões)               |
| [02-banco-e-seguranca.md](02-banco-e-seguranca.md)   | Tabelas, RLS e as convenções de migration                                    |
| [03-roteiros-sql.md](03-roteiros-sql.md)             | **Passo a passo para o Diego aplicar cada migration** e conferir o resultado |
| [04-integracoes.md](04-integracoes.md)               | TMDB, Storage e Realtime                                                     |
| [05-features.md](05-features.md)                     | O que o app faz, feature por feature, e o status de cada uma                 |
| [06-frontend.md](06-frontend.md)                     | Tema visual, convenções de componente e nomenclatura em pt-BR                |
| [07-deploy-e-ambientes.md](07-deploy-e-ambientes.md) | Vercel, Supabase, CI, manter-ativo e CSP                                     |
| [08-testes.md](08-testes.md)                         | Estratégia de testes (Vitest + Playwright)                                   |

## Regra de ouro do fluxo com o banco

O assistente de IA **escreve** SQL; o **Diego aplica** — sempre pelo roteiro em [03-roteiros-sql.md](03-roteiros-sql.md), que termina com queries de conferência. Nada é executado no Supabase sem o Diego saber.
