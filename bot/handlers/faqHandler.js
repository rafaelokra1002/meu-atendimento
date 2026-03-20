/**
 * Handler de FAQ (dúvidas frequentes).
 * Lista perguntas e exibe respostas buscadas do banco.
 */

const { getSession, setStep, resetSession } = require('../services/sessionService');
const { getFaqs } = require('../services/databaseService');
const { formatFaqList } = require('../utils/messageFormatter');

/**
 * Processa interações do fluxo de FAQ.
 */
async function handleFaq(client, message, text) {
  const userId = message.from;
  const session = getSession(userId);

  // Exibe lista de perguntas
  if (text === 'init') {
    const faqs = await getFaqs();
    const msg = formatFaqList(faqs);
    await client.sendMessage(userId, msg);
    setStep(userId, 'faq_detail');
    return;
  }

  // Voltar ao menu
  if (text === '0') {
    resetSession(userId);
    await client.sendMessage(
      userId,
      '_Voltando ao menu..._\n\nDigite qualquer mensagem para ver o menu.'
    );
    return;
  }

  // Exibe resposta da pergunta selecionada
  if (session.step === 'faq_detail') {
    const faqs = await getFaqs();
    const index = parseInt(text, 10) - 1;

    if (isNaN(index) || index < 0 || index >= faqs.length) {
      await client.sendMessage(userId, '⚠️ Opção inválida. Tente novamente ou digite *0* para voltar.');
      return;
    }

    const faq = faqs[index];
    const response =
      `❓ *${faq.question}*\n\n` +
      `${faq.answer}\n\n` +
      '_Digite *0* para voltar ao menu ou escolha outra pergunta._';

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

module.exports = { handleFaq };
