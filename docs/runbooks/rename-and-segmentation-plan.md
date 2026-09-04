# Plano de Renomeação e Segmentação do App

> **Data:** 24/08/2026
> **Status:** Executado — 24/08/2026
> **Escopo:** Renomear o app de `BeautyFlow` para `StudioFlow` e estruturar segmentação por tenant para 3 nichos: salão de beleza, barbearia e clínica de estética.

---

## 1. Decisão de produto

### Nichos atendidos
| Segmento | Público | Termo do profissional | Termo do cliente |
|---|---|---|---|
| Salão de Beleza | Donos de salão de beleza | Profissional | Cliente |
| Barbearia | Donos de barbearia | Barbeiro | Cliente |
| Clínica de Estética | Donos de clínicas de estética | Terapeuta / Esteticista | Paciente |

### Por que 3 segmentos
- Compartilham a mesma lógica de agendamento, CRM, financeiro, comissão e LGPD.
- Formam o universo de **cuidados pessoais e estética**.
- São adjacentes o suficiente para o mesmo produto, mas distintos o suficiente para exigir branding e copy diferenciados.

### O que NÃO entra no escopo inicial
- Pet shops, academias, restaurantes, clínicas médicas, oficinas mecânicas ou qualquer segmento fora de cuidados pessoais.
- Expansão para outros segmentos (tattoo, esmalteria, spa) só após consolidação dos 3 iniciais.

---

## 2. Novo nome

**Nome a definir:** `[NOVO_NOME]`

### Critérios de escolha
- Curto, fácil de pronunciar e soletrar.
- Neutro: não associe apenas ao feminino nem apenas ao masculino.
- Transmita cuidado, atenção, exclusividade ou estilo.
- Funcione para os 3 segmentos.
- Disponibilidade de domínio `.com.br` ou `.com` a verificar.

### Sugestões curadas
| Nome | Destaque |
|---|---|
| CuidaFlow | Cuidado + fluxo organizado |
| EstiloFlow | Estilo, moderno, abrangente |
| StudioFlow | Profissional, abrange todos os studios |
| AtendeFlow | Foco em atendimento |
| VemCuidar | Calor humano, convidativo |

---

## 3. Arquivos que precisam mudar com a renomeação

### Documentação
- [x] `README.md`
- [x] `AGENTS.md` (referências ao nome)
- [x] `MestreBeaut.md` → renomeado para `MestreStudioFlow.md`
- [x] `MEMORY.md`
- [x] `ROADMAP.md`
- [x] `SESSION-CONTEXT.md`
- [x] `docs/documentacao-estrutura.md`
- [x] `docs/requirements/PRD.md`
- [x] `docs/requirements/RF-*.md`
- [x] `docs/adr/*.md`
- [x] `docs/runbooks/*.md`
- [x] `docs/DOR.md`
- [x] `docs/DOD.md`
- [x] `docs/LGPD.md`

### Aplicação
- [x] `app/package.json` (`name`: `studioflow`)
- [x] `app/index.html` (`<title>`, meta tags)
- [x] `app/src/main.tsx` (título, metadados)
- [x] `app/src/pages/Home.tsx` (landing page com seletor de segmento)
- [x] `app/src/components/landing/*.tsx`
- [x] `app/src/const.ts`
- [x] `app/api/boot.ts` (headers, CORS, health)
- [x] `app/api/lib/env.ts`
- [x] `app/.env.example`
- [x] `app/vercel.json` (rewrites, headers)
- [x] `app/vite.config.ts`
- [x] `app/drizzle.config.ts`

### Configurações
- [ ] `.github/workflows/ci.yml` (nomes, se houver)
- [ ] `.husky/pre-commit` / `.husky/pre-push` (se referenciarem nome)
- [ ] `docker-compose.yml`, `Dockerfile` (se houver)

### Marketing futuro
- [ ] Landing pages por segmento
- [x] Meta tags / SEO
- [ ] Textos de anúncios (futuro)

---

## 4. Mudanças técnicas de segmentação

> ✅ Implementado em 24/08/2026.

### 4.1 Banco de dados
Adicionar enum e coluna no schema:

```ts
export const salonSegmentEnum = pgEnum("salon_segment", [
  "beauty_salon",
  "barbershop",
  "aesthetic_clinic",
]);

export const salons = pgTable("salons", {
  // ... campos existentes
  segment: salonSegmentEnum("segment").default("beauty_salon").notNull(),
});
```

Migration:
```sql
-- Migration 003: Adiciona segmento do salão
CREATE TYPE salon_segment AS ENUM ('beauty_salon', 'barbershop', 'aesthetic_clinic');
ALTER TABLE salons ADD COLUMN segment salon_segment NOT NULL DEFAULT 'beauty_salon';
```

### 4.2 Backend
- Criar helper de labels por segmento em `app/contracts/segment-labels.ts`.
- Criar helper de paletas por segmento em `app/contracts/segment-palettes.ts`.
- Criar templates de serviço por segmento em `app/contracts/segment-services.ts`.
- Criar templates de comunicação por segmento em `app/contracts/segment-messages.ts`.

### 4.3 Frontend
- Atualizar onboarding para incluir seleção de segmento.
- Ajustar labels dinâmicos com base no segmento do salão ativo.
- Aplicar paleta de cores sugerida no onboarding (customizável depois).
- Ajustar landing page pública do salão (`/s/[slug]`) por segmento.

### 4.4 Marketing
- Criar landing page genérica (`/`).
- Criar landing pages por segmento:
  - `/salao-de-beleza`
  - `/barbearia`
  - `/estetica`

---

## 5. Checklist de execução

### Fase 1 — Decisão
- [x] Escolher o novo nome entre as sugestões: **StudioFlow**.
- [ ] Verificar disponibilidade de domínio `.com.br` e `.com`.
- [x] Decidir se manteremos `Flow` no nome: sim.

### Fase 2 — Renomeação
- [x] Renomear todos os arquivos de documentação que referenciam `BeautyFlow`.
- [x] Renomear `MestreBeaut.md` para `MestreStudioFlow.md`.
- [x] Atualizar `README.md`.
- [x] Atualizar `package.json`.
- [x] Atualizar metadados do app (`index.html`, `main.tsx`).
- [x] Atualizar landing page.
- [x] Atualizar `.env.example` e variáveis de ambiente.

### Fase 3 — Segmentação
- [x] Criar migration `003-salon-segment.sql`.
- [x] Atualizar schema Drizzle.
- [x] Criar helpers de segmento (labels, paletas, serviços, mensagens).
- [x] Atualizar onboarding com seleção de segmento.
- [x] Atualizar UI para labels dinâmicos.
- [x] Atualizar templates de comunicação.

### Fase 4 — Landing pages de marketing
- [x] Criar página genérica com seletor de segmento (`/`).
- [ ] Criar página `/salao-de-beleza` (futuro).
- [ ] Criar página `/barbearia` (futuro).
- [ ] Criar página `/estetica` (futuro).

### Fase 5 — Validação
- [x] `npm run quality` passando.
- [x] `npm run build` passando.
- [x] Testes existentes passando (24 testes).
- [x] Revisão de todos os arquivos por `grep -r "BeautyFlow"`.

### Fase 6 — Deploy
- [ ] Configurar novo projeto na Vercel (se o domínio mudar).
- [ ] Atualizar `VERCEL_TOKEN` no GitHub Secrets (se necessário).
- [x] Configurar env vars na Vercel (`CORS_ORIGIN` com URL de produção).
- [ ] Redirecionar URL antiga se houver tráfego.

---

## 6. Ações manuais pendentes

- [x] Escolher novo nome: **StudioFlow**.
- [ ] Verificar disponibilidade de domínio.
- [ ] Configurar novo domínio na Vercel (se for usar domínio próprio).
- [ ] Atualizar `CORS_ORIGIN` na Vercel com a URL de produção real.
- [ ] Rodar migration `003-salon-segment.sql` no Supabase.

---

## 7. Decisões pendentes

- [x] Novo nome definido: **StudioFlow**.
- [ ] Verificar disponibilidade de domínio e decidir se compra.
- [ ] Data de deploy da renomeação.

---

## 8. Próximos passos

1. Verificar disponibilidade de domínio `studioflow.com.br` / `studioflow.com`.
2. Rodar migration `003-salon-segment.sql` no Supabase.
3. Configurar `CORS_ORIGIN` na Vercel com a URL de produção.
4. Deploy.
5. Criar landing pages específicas por segmento (`/salao-de-beleza`, `/barbearia`, `/estetica`).
