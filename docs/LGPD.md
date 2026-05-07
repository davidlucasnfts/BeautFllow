# BeautyFlow — Compliance LGPD

> Documento de conformidade com a Lei Geral de Protecao de Dados (Lei 13.709/2018).

---

## 1. Dados Pessoais Tratados

| Categoria | Dados | Finalidade |
|-----------|-------|------------|
| Identificacao | Nome, e-mail, telefone, CPF | Cadastro de clientes do salao |
| Contato | Endereco, WhatsApp | Comunicacao e agendamentos |
| Saude | Alergias, condicoes esteticas | Prestacao segura de servicos |
| Financeiro | Historico de pagamentos | Faturamento e relatorios |
| Comportamental | Logs de acesso, agendamentos | Auditoria e seguranca |

## 2. Base Legal

- **Execucao de contrato:** prestacao de servicos entre salao e cliente
- **Consentimento:** termos de uso e politica de privacidade (modulo Consent)
- **Interesse legitimo:** prevencao de fraudes, seguranca do sistema

## 3. Direitos do Titular

O titular dos dados pode solicitar:
1. **Confirmacao** da existencia de tratamento
2. **Acesso** aos dados pessoais
3. **Correcao** de dados incompletos ou desatualizados
4. **Anonimizacao, bloqueio ou eliminacao** de dados desnecessarios
5. **Portabilidade** dos dados a outro fornecedor
6. **Revogacao do consentimento**

## 4. Fluxo de Solicitacao do Titular

```
Titular solicita via e-mail ou formulario no app
    |
    v
Salao recebe notificacao no BeautyFlow
    |
    v
Salao valida identidade do titular
    |
    v
Salao executa acao (exporta, corrige, anonimiza, deleta)
    |
    v
Registro em audit_logs com tipo 'lgpd_request'
    |
    v
Resposta ao titular em ate 15 dias uteis
```

## 5. Retencao de Dados

| Tipo de Dado | Prazo de Retencao | Justificativa |
|--------------|-------------------|---------------|
| Dados de clientes ativos | Durante a relacao + 5 anos | Obrigacoes fiscais |
| Dados de clientes inativos | 5 anos apos ultimo agendamento | Obrigacoes fiscais |
| Logs de auditoria | 2 anos | Seguranca e compliance |
| Dados anonimizados | Indefinido | Analise estatistica |

## 6. Medidas de Seguranca

- Criptografia em transito (TLS 1.2+)
- Isolamento de dados por salao (multi-tenancy)
- Autenticacao OAuth 2.0 + JWT
- RBAC (user/admin)
- Audit logs para operacoes sensiveis
- Backups automaticos (Supabase)

## 7. Responsavel (DPO)

> **Nota:** Em fase de MVP, o DPO e o proprietario do salao (usuario admin). Futuramente, designar DPO formal para BeautyFlow como controlador.

## 8. Termos de Uso e Politica de Privacidade

- Modulo `Consent` no BeautyFlow gerencia termos e assinaturas
- Novos termos exigem nova assinatura dos titulares
- Historico de versoes preservado
