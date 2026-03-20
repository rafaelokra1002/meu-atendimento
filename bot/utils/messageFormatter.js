/**
 * Utilitários de formatação de mensagens para o bot.
 */

/**
 * Formata a lista de serviços para exibição no WhatsApp.
 */
function formatServiceList(services) {
  if (!services || services.length === 0) {
    return 'Nenhum serviço cadastrado no momento.';
  }

  let msg = '💅 *Nossos Serviços:*\n\n';
  services.forEach((service, index) => {
    msg += `${index + 1} - ${service.name}\n`;
  });
  msg += '\n0 - Voltar ao menu';
  return msg;
}

/**
 * Formata a lista de FAQ para exibição no WhatsApp.
 */
function formatFaqList(faqs) {
  if (!faqs || faqs.length === 0) {
    return 'Nenhuma dúvida frequente cadastrada no momento.';
  }

  let msg = '❓ *Dúvidas Frequentes:*\n\n';
  faqs.forEach((faq, index) => {
    msg += `${index + 1} - ${faq.question}\n`;
  });
  msg += '\n0 - Voltar ao menu';
  return msg;
}

/**
 * Formata a lista de serviços para seleção no agendamento.
 */
function formatServiceSelection(services) {
  if (!services || services.length === 0) {
    return 'Nenhum serviço disponível para agendamento.';
  }

  let msg = '📋 *Escolha o serviço para agendar:*\n\n';
  services.forEach((service, index) => {
    msg += `${index + 1} - ${service.name}\n`;
  });
  msg += '\n0 - Voltar ao menu';
  return msg;
}

module.exports = {
  formatServiceList,
  formatFaqList,
  formatServiceSelection,
};
