/**
 * Modelos prontos de termos de autorização (Opção A — biblioteca de modelos).
 * Textos fixos no frontend: todo tenant usa os mesmos modelos como base e
 * cada uso gera uma cópia na tabela `consent_forms` do próprio salão.
 * Os campos [NOME DO CLIENTE] etc. são preenchidos à mão no momento da assinatura.
 */
export interface ConsentTemplate {
  id: string;
  label: string;
  title: string;
  content: string;
}

export const CONSENT_TEMPLATES: ConsentTemplate[] = [
  {
    id: "lgpd",
    label: "Uso de Dados Pessoais (LGPD)",
    title: "Autorização de Uso de Dados Pessoais (LGPD)",
    content: `Eu, [NOME DO CLIENTE], CPF [___], autorizo o [NOME DO ESTABELECIMENTO] a coletar, armazenar e utilizar meus dados pessoais (nome, telefone, e-mail, histórico de atendimentos e registros fotográficos de procedimentos) exclusivamente para: agendamento de atendimentos, histórico técnico dos serviços realizados, comunicações sobre meus agendamentos e envio de ofertas e novidades (quando autorizado).

Declaro que fui informado(a) de que:
1. Meus dados são protegidos conforme a Lei Geral de Proteção de Dados (Lei nº 13.709/2018);
2. Posso solicitar a qualquer momento a correção, a portabilidade ou a exclusão dos meus dados, bastando solicitar ao estabelecimento;
3. Imagens de antes/depois só serão usadas para divulgação com autorização específica e separada.

Estou ciente de que a assinatura deste termo é válida por prazo indeterminado, podendo ser revogada a qualquer momento.`,
  },
  {
    id: "capilares-quimicos",
    label: "Procedimentos Capilares Químicos",
    title: "Termo de Ciência e Autorização — Procedimentos Capilares Químicos",
    content: `Eu, [NOME DO CLIENTE], declaro que fui informado(a) sobre as características do procedimento químico a ser realizado (coloração, descoloração, alisamento ou relaxamento) e estou ciente de que:

1. Cabelos anteriormente processados (colorações, alisamentos, descolorações) podem apresentar resultados diferentes e reações imprevisíveis;
2. Foi realizada a avaliação de mecha quando solicitado, e seu resultado foi esclarecido;
3. É recomendado não lavar o cabelo nas 24h anteriores e posteriores ao procedimento;
4. Durabilidade e resultado podem variar conforme tipo de fio, rotina de cuidados e exposição solar;
5. O não cumprimento das orientações de cuidado pode comprometer o resultado.

Autorizo a realização do procedimento e isento o estabelecimento de responsabilidade por reações decorrentes de informações incorretas sobre histórico químico do meu cabelo, declarado por mim neste atendimento.`,
  },
  {
    id: "esteticos",
    label: "Procedimentos Estéticos",
    title: "Termo de Ciência e Autorização — Procedimentos Estéticos",
    content: `Eu, [NOME DO CLIENTE], declaro estar ciente e de acordo com a realização do procedimento estético [DESCREVER PROCEDIMENTO], tendo recebido as seguintes informações:

1. Objetivo do procedimento, número de sessões recomendado e resultados esperados;
2. Cuidados pré e pós-procedimento que devo seguir;
3. Possíveis reações adversas: vermelhidão, sensibilidade, irritação leve e, em casos raros, reação alérgica — devendo comunicar o estabelecimento imediatamente;
4. Contraindicações informadas por mim (gestação, alergias, uso de medicamentos, doenças de pele);
5. O resultado pode variar de pessoa para pessoa e não há garantia de resultado absoluto.

Autorizo a realização do procedimento e confirmo que as informações prestadas sobre minha saúde são verdadeiras.`,
  },
  {
    id: "imagem",
    label: "Uso de Imagem (Antes/Depois)",
    title: "Autorização de Uso de Imagem (Antes/Depois)",
    content: `Eu, [NOME DO CLIENTE], autorizo o [NOME DO ESTABELECIMENTO] a utilizar minhas imagens (fotos e vídeos de antes e depois dos procedimentos realizados) nas seguintes finalidades: portfólio do estabelecimento, redes sociais (Instagram, Facebook, WhatsApp Business) e material promocional.

Estou ciente de que:
1. Esta autorização é livre, espontânea e gratuita, não gerando qualquer remuneração;
2. Posso revogar esta autorização a qualquer momento, solicitando a remoção das imagens, que será feita em até 30 dias;
3. As imagens serão utilizadas apenas para as finalidades descritas neste termo.

Local, data e assinatura do(a) cliente.`,
  },
];
