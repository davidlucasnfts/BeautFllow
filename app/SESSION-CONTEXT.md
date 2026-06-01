# BeautyFlow — Contexto da Sessão Atual

> Estado da sessão, decisões pendentes e próximos passos.  
> **Regra:** nunca duplicar informação do `MEMORY.md`.

---

## Sessão Atual

**Data:** 01/06/2026  
**Tema:** Criação de material de apresentação comercial para cliente potencial

---

## O que foi feito nesta sessão

1. Criada página `/proposta` (`src/pages/Proposal.tsx`) — landing page de proposta comercial
   - Sem necessidade de login (rota pública)
   - Inclui: desafios, solução, funcionalidades, módulos, planos, cronograma, garantias, CTA
   - Estilo visual consistente com a landing page principal (`Home.tsx`)
2. Criado documento formal `PROPOSTA.md` — proposta comercial em Markdown (pronto para PDF)
3. Rota `/proposta` registrada em `src/App.tsx`
4. Build testado e validado (`npm run build`) — sucesso
5. Servidor local testado na porta 3001 (porta 3000 ocupada no ambiente de teste)

---

## Decisões Pendentes ⚠️

| # | Decisão | Onde fazer | Como fazer |
|---|---------|-----------|------------|
| 1 | **Escolher formato de apresentação externa** | Próxima sessão ou com David | Opções: (a) Deploy na Vercel (`npx vercel --prod`), (b) Servidor local com `npx serve dist/public`, (c) PDF via conversão do `PROPOSTA.md` |
| 2 | **Personalizar PROPOSTA.md** | Editar arquivo na raiz | Substituir `[NOME DO SALÃO]` e dados de contato antes de enviar |
| 3 | **Customizar página `/proposta`** | `src/pages/Proposal.tsx` | Adicionar nome real do salão da cliente, ajustar preços se necessário |

---

## Próximos Passos Sugeridos

1. Definir qual opção de apresentação usar (deploy, local ou PDF)
2. Personalizar `PROPOSTA.md` com dados da cliente
3. Fazer deploy na Vercel quando aprovado
4. Agendar demonstração ao vivo navegando pelas telas reais do sistema

---

## Notas Técnicas

- Porta do Vite: **3000** (configurada em `vite.config.ts`)
- Build output: `dist/public/`
- Página de proposta: **não requer autenticação** (`AuthLayout` não aplicado)
- O projeto já possui `vercel.json` configurado para SPA routing e deploy
