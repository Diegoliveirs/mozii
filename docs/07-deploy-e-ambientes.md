# 07 — Deploy e ambientes

## Ambientes

| Ambiente        | Frontend                       | Backend                                                      | Quem administra |
| --------------- | ------------------------------ | ------------------------------------------------------------ | --------------- |
| Desenvolvimento | `npm run dev` (localhost:5173) | Supabase CLI local (`supabase start`) ou o projeto hospedado | Diego           |
| Produção        | Vercel (build estático)        | Projeto Supabase próprio do Mozii 2.0                        | Diego           |

**Importante:** o projeto Supabase e o deploy do Mozii 2.0 são **novos e exclusivos** — nada é compartilhado com o fable/Mozi comercial.

## Variáveis de ambiente (frontend)

Todas com prefixo `VITE_` (vão para o bundle — nenhuma é secreta):

| Variável                 | O que é                                       |
| ------------------------ | --------------------------------------------- |
| `VITE_SUPABASE_URL`      | URL do projeto Supabase                       |
| `VITE_SUPABASE_ANON_KEY` | chave pública `anon` (a RLS protege os dados) |
| `VITE_TMDB_API_KEY`      | chave v3 do TMDB (pública por design)         |

Local: copiar `.env.example` → `.env.local`. Vercel: _Settings → Environment Variables_.

## CI (GitHub Actions)

- `ci.yml` — a cada push/PR: oxlint → Prettier (conferência) → `tsc -b` → Vitest → build.
- `manter-ativo.yml` — cron diário que faz uma consulta mínima via REST no Supabase: o plano gratuito **pausa projetos após ~7 dias sem atividade**, e este ping evita a pausa. Requer os segredos `SUPABASE_URL` e `SUPABASE_ANON_KEY` no repositório GitHub (_Settings → Secrets and variables → Actions_) — o Diego cadastra.

## PWA

- `vite-plugin-pwa` com `registerType: 'prompt'`: quando sai versão nova, o app mostra o `AvisoAtualizacao` em vez de trocar sozinho (evita o clássico bug de service worker servindo bundle velho).
- Ícones 192/512 + maskable + apple-touch-icon em `public/`, gerados por `node scripts/gerar-icones.mjs` (rasteriza o `icone.svg` com o Edge do Playwright — rodar de novo quando o ícone mudar).
- Cache de pôsteres do TMDB: `CacheFirst`, 30 dias, máx. 200 entradas.
- Dados do Supabase ficam **fora** do service worker — cache de dados é papel do TanStack Query.

## Checklist de deploy (Usuário executa)

1. **GitHub:** criar o repositório e subir (`git remote add origin … && git push -u origin main`). Em _Settings → Secrets and variables → Actions_, cadastrar `SUPABASE_URL` e `SUPABASE_ANON_KEY` (para o `manter-ativo.yml`).
2. **Vercel:** criar o projeto apontando para o repositório; framework Vite é detectado sozinho. Cadastrar as 3 variáveis `VITE_*` (as mesmas do `.env.local`).
3. **Supabase (Auth):** em _Authentication → URL Configuration_, colocar o domínio canônico da Vercel em **Site URL** e `https://<dominio>/confirmar-email` em **Redirect URLs**. Em _Authentication → Email Templates → Confirm signup_, usar assunto `Confirme seu e-mail no Mozii 💌` e um botão que aponte para `{{ .ConfirmationURL }}`. O link leva ao callback do app, cria a sessão e entra automaticamente.
4. **Conferir os headers publicados:** `curl -sI https://<dominio>` — a CSP do `vercel.json` deve aparecer (com `image.tmdb.org` no `connect-src`, senão o cartão de Stories sai em branco).
5. **Confirm email:** recomendação — ligar em _Authentication → Sign In / Providers_ **só depois** de vocês dois criarem as contas reais (os 3 usuários E2E já existem, então a suíte continua passando).
6. **Instalar o PWA** no iPhone (Compartilhar → Adicionar à Tela de Início) e no Android (aviso de instalação) e conferir: notch respeitado, sem zoom por pinça/toque duplo, voltar em todas as telas internas.
7. **Sessão:** entrar, fechar completamente o PWA e abri-lo de novo; a sessão deve continuar. Atualizar o PWA também não deve deslogar. Limpar os dados do site/PWA deve voltar ao login.

### Template de confirmação do e-mail

Em _Authentication → Email Templates → Confirm signup_, usar o assunto `Confirme seu e-mail no Mozii 💌` e colar este HTML. O `ConfirmationURL` é obrigatório: ele preserva o token do Supabase e redireciona para `/confirmar-email` informado pelo app.

```html
<div
  style="margin:0;background:#16131c;padding:32px 16px;font-family:Arial,sans-serif;color:#f8f5f7"
>
  <div
    style="margin:0 auto;max-width:480px;border:1px solid #594c5d;border-radius:20px;background:#211c25;padding:32px;text-align:center"
  >
    <p style="margin:0;color:#f2a6bb;font-size:24px">♥</p>
    <h1 style="margin:10px 0 8px;font-size:28px">Mozii</h1>
    <p style="margin:0;color:#c8becb">vocês, em um só lugar</p>
    <h2 style="margin:30px 0 12px;font-size:22px">Confirma seu e-mail 💌</h2>
    <p style="margin:0 0 28px;color:#e0d9e2;line-height:1.5">
      Confirme seu e-mail para entrar no cantinho de vocês.
    </p>
    <a
      href="{{ .ConfirmationURL }}"
      style="display:inline-block;border-radius:12px;background:#df6f91;padding:14px 22px;color:#fff;text-decoration:none;font-weight:700"
      >Confirmar meu e-mail</a
    >
    <p style="margin:28px 0 0;color:#a99eab;font-size:12px;line-height:1.5">
      Se você não criou uma conta no Mozii, pode ignorar este e-mail.
    </p>
  </div>
</div>
```
