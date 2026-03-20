/**
 * Handler de serviços.
 * Lista os serviços cadastrados e exibe detalhes ao selecionar.
 */

const { getSession, setStep, resetSession } = require('../services/sessionService');
const { getServices } = require('../services/databaseService');
const { formatServiceList } = require('../utils/messageFormatter');

/**
 * Processa interações do fluxo de serviços.
 */
async function handleServices(client, message, text) {
  const userId = message.from;
  const session = getSession(userId);

  // Voltar ao menu
  if (text === '0') {
    resetSession(userId);
    await client.sendMessage(
      userId,
      '_Voltando ao menu..._\n\nDigite qualquer mensagem para ver o menu.'
    );
    return;
  }

  // Exibe lista de serviços
  if (text === 'init') {
    const services = await getServices();
    const msg = formatServiceList(services);
    await client.sendMessage(userId, msg);
    setStep(userId, 'services_detail');
    return;
  }

  // Exibe detalhe do serviço selecionado
  if (session.step === 'services' || session.step === 'services_detail') {
    const services = await getServices();
    const index = parseInt(text, 10) - 1;

    if (isNaN(index) || index < 0 || index >= services.length) {
      await client.sendMessage(userId, '⚠️ Opção inválida. Escolha um número da lista ou digite *0* para voltar.');
      return;
    }

    const service = services[index];
    const detail = service.description || 'Sem descrição cadastrada.';
    const response =
      `💅 *${service.name}*\n\n` +
      `${detail}\n\n` +
      '_Escolha outro serviço ou digite *0* para voltar ao menu._';

    await client.sendMessage(userId, response);
    return;
  }

  // Fallback
  resetSession(userId);
  await client.sendMessage(
    userId,
    '_Voltando ao menu..._\n\nDigite qualquer mensagem para ver o menu.'
  );
}

module.exports = { handleServices };
