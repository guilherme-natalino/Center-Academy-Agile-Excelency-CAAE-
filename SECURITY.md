# Segurança — Academia Agile

Este projeto adota uma camada de segurança no frontend inspirada no **OWASP Top 10:2025**. O Top 10 é um documento de conscientização e não transforma automaticamente um frontend estático em uma aplicação segura: controles críticos precisam existir também no backend, banco e infraestrutura.

## Mapeamento aplicado

| OWASP 2025 | Aplicação no projeto |
|---|---|
| A01 — Broken Access Control | IDs de usuário são validados; tabelas REST são allowlist; autorização real deve ser reforçada por RLS no Supabase. |
| A02 — Security Misconfiguration | `_headers` adiciona CSP, HSTS, `nosniff`, Referrer-Policy, Permissions-Policy, COOP e CORP. |
| A03 — Software Supply Chain Failures | Projeto sem dependências externas de runtime; scripts são locais e o material de terceiros é restrito a hosts aprovados. |
| A04 — Cryptographic Failures | Apenas HTTPS é aceito para materiais externos; não há senha armazenada pela aplicação; nunca inserir service-role key no frontend. |
| A05 — Injection | Textos dinâmicos são escapados; URLs externas passam por allowlist; tabelas REST são allowlist. |
| A06 — Insecure Design | Segurança está separada em `security.js`; estado externo é normalizado antes de entrar no domínio. |
| A07 — Authentication Failures | Supabase Auth é usado para autenticação; email e senha recebem validação client-side; mensagens de erro não expõem detalhes sensíveis. |
| A08 — Software or Data Integrity Failures | Perfil e dados de domínio são validados, limitados e normalizados antes de serem usados. |
| A09 — Security Logging and Alerting Failures | Logs locais não incluem tokens, senhas ou emails; eventos são reduzidos ao necessário para diagnóstico. Alertas de produção precisam ser implementados no backend. |
| A10 — Mishandling of Exceptional Conditions | `safeFetch`, `safeJson`, validação de dados e tratamento de erros evitam estados inesperados e vazamento de detalhes. |

## Limitação importante

A aplicação é uma SPA estática. Portanto, **controle de acesso, RLS, rate limiting, gerenciamento de segredos, validação server-side e auditoria/alertas de produção não podem ser garantidos apenas por JavaScript no navegador**.

No Supabase, as tabelas `profiles`, `mastery` e `sessions` devem ter RLS habilitado e políticas que comparem `auth.uid()` com `user_id`. A chave `anon` pode aparecer no frontend; a `service_role` nunca deve aparecer.

Fonte: OWASP Top 10:2025, documentação oficial: https://owasp.org/Top10/2025/
