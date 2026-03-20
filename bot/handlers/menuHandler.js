/**
 * Handler principal do menu.
 * Gerencia o fluxo de conversa baseado no step atual da sessão do usuário.
 */

const { getSession, setStep, resetSession } = require('../services/sessionService');
const { getSettings } = require('../services/databaseService');
const { handleServices } = require('./serviceHandler');
const { handleFaq } = require('./faqHandler');
const { handleScheduling } = require('./schedulingHandler');

/**
 * Processa toda mensagem recebida, delegando para o handler correto
 * com base no step da sessão.
 */
async function handleIncomingMessage(client, message) {
  const userId = message.from;
  const session = getSession(userId);
  const text = message.body.trim();

  switch (session.step) {
    case 'menu':
      await handleMenu(client, message, text);
      break;

    case 'services':
    case 'services_detail':
      await handleServices(client, message, text);
      break;

    case 'faq':
    case 'faq_detail':
      await handleFaq(client, message, text);
      break;

    case 'scheduling_service':
    case 'scheduling_date':
    case 'scheduling_time':
    case 'scheduling_confirm':
      await handleScheduling(client, message, text);
      break;

    default:
      // Step desconhecido, reseta para o menu
      resetSession(userId);
      await handleMenu(client, message, text);
      break;
  }
}

/**
 * Exibe o menu principal e processa a escolha do usuário.
 */
async function handleMenu(client, message, text) {
  const userId = message.from;
  const settings = await getSettings();

  // Se não há configurações no banco, usa mensagem padrão
  const welcomeMsg =
    settings?.welcomeMsg ||
    'Oi, seja bem-vinda 💖\nComo posso te ajudar?\n\n1 - Serviços\n2 - Valores\n3 - Agendamento\n4 - Dúvidas\n5 - Falar com atendente';

  switch (text) {
    case '1':
      setStep(userId, 'services');
      await handleServices(client, message, 'init');
      break;

    case '2':
      await handleValues(client, message);
      break;

    case '3':
      setStep(userId, 'scheduling_service');
      await handleScheduling(client, message, 'init');
      break;

    case '4':
      setStep(userId, 'faq');
      await handleFaq(client, message, 'init');
      break;

    case '5':
      await handleHumanSupport(client, message);
      break;

    default:
      // Qualquer outra mensagem exibe o menu
      await client.sendMessage(userId, welcomeMsg);
      break;
  }
}

/**
 * Exibe informações de valores/promoção buscadas do banco.
 */
async function handleValues(client, message) {
  const userId = message.from;
  const settings = await getSettings();

  const promoMsg =
    settings?.promotion ||
    'Entre em contato para saber os valores atualizados! 💰';

  const response = `💰 *Valores e Promoções:*\n\n${promoMsg}\n\n_Digite qualquer mensagem para voltar ao menu._`;
  await client.sendMessage(userId, response);

  // Mantém no menu para a próxima mensagem
  resetSession(userId);
}

/**
 * Encaminha para atendimento humano e encerra o fluxo do bot.
 */
async function handleHumanSupport(client, message) {
  const userId = message.from;

  const response =
    '👩 *Atendimento Humano*\n\n' +
    'Sua mensagem foi recebida! Em breve uma atendente entrará em contato com você.\n' +
    'Aguarde um momento, por favor. 💖\n\n' +
    '_Digite qualquer mensagem para voltar ao menu._';

  await client.sendMessage(userId, response);
  resetSession(userId);
}

module.exports = { handleIncomingMessage };
