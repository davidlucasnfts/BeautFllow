# ADR-006: Notificações de novos agendamentos — Push vs. WhatsApp

**Data:** 06/11/2026  
**Status:** Proposta / Parcialmente implementada  
**Decisores:** David Lucas

## Contexto

O StudioFlow precisa avisar o dono do estabelecimento quando uma cliente realiza um agendamento pelo link online. A notificação deve conter nome da cliente, procedimento, data e horário, para que o dono acompanhe em tempo real sem abrir o app.

Duas abordagens são possíveis:

- **Opção A — Push notification do navegador/PWA:** nativo, sem custo por mensagem, mas com limitações no iOS.
- **Opção B — Mensagem automática no WhatsApp do dono:** funciona em qualquer celular, é o canal principal do público-alvo, mas depende de provedor de API.

## Decisão

Implementar a **Opção A (push)** agora, pois o app já é PWA e a base técnica existe. A **Opção B (WhatsApp)** será planejada e implementada em seguida, pois tem maior alcance no Brasil e pode substituir ou complementar o push.

## Alternativas Consideradas

| Alternativa | Prós | Contras |
|-------------|------|---------|
| **A — Push nativo** | Sem custo por mensagem; chega na tela do celular; já integrado ao PWA | iOS limita push em PWA (só funciona bem se app instalado e Safari atualizado); depende de permissão do usuário |
| **B — WhatsApp** | Funciona em 100% dos celulares; canal que o dono já usa; maior taxa de leitura | Custo por mensagem ou infraestrutura própria; depende de provedor (Evolution API, Z-API, Wati, Twilio) |
| **C — E-mail** | Fácil e rápido (Resend já configurado) | Dono pode não olhar e-mail com frequência; não atende à necessidade de "tempo real" |

## Consequências

- Positivas: o dono já pode receber alertas imediatos no celular enquanto a Opção B não está pronta.
- Trade-offs: push pode falhar em iPhones não configurados corretamente.
- Negativas: aumenta a complexidade do service worker e exige VAPID keys em produção.

## Próximos passos para Opção B (WhatsApp)

1. **Escolher provedor:**
   - **Evolution API** (self-hosted, custo baixo, requer VPS)
   - **Z-API** (SaaS brasileiro, paga por mensagem, API simples)
   - **Wati** (mais maduro, preço maior)
   - **Twilio** (confiável, mas WhatsApp Business API exige Meta Business)

2. **Decidir origem da mensagem:**
   - Enviar do próprio número do salão (mais pessoal, mas precisa de API conectada ao número)
   - Enviar de um número fixo do StudioFlow (mais simples, mas menos pessoal)

3. **Conteúdo da mensagem:**
   > "Novo agendamento no StudioFlow: Maria Silva marcou Corte feminino para 05/11 às 14:00. Acesse: https://..."

4. **Dados a guardar:**
   - Tabela `whatsapp_notification_logs` (salonId, appointmentId, provider, status, sentAt)
   - Configuração do provedor na tabela `salons.settings`

5. **Implementação técnica:**
   - Novo módulo `server/lib/whatsapp.ts` com adapter por provedor
   - Chamada no `publicRouter.book` após criar agendamento
   - Tela em Configurações para conectar número/provedor

## Variáveis de ambiente necessárias para push (Opção A)

```
VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
VAPID_SUBJECT=mailto:contato@studioflow.com.br
```

Gerar com: `npx web-push generate-vapid-keys`
