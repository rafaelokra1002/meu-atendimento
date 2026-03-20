/**
 * Handler de agendamento.
 * Fluxo: selecionar serviço -> informar dia -> informar horário -> confirmar.
 */

const {
  getSession,
  setStep,
  setSessionData,
  resetSession,
} = require('../services/sessionService');
const { getServices } = require('../services/databaseService');
const { formatServiceSelection } = require('../utils/messageFormatter');

/**
 * Processa interações do fluxo de agendamento.
 */
async function handleScheduling(client, message, text) {
  const userId = message.from;
  const session = getSession(userId);

  // Voltar ao menu em qualquer step
  if (text === '0') {
    resetSession(userId);
    await client.sendMessage(
      userId,
      '_Agendamento cancelado. Voltando ao menu..._\n\nDigite qualquer mensagem para ver o menu.'
    );
    return;
  }

  switch (session.step) {
    case 'scheduling_service':
      await handleSelectService(client, userId, text);
      break;

    case 'scheduling_date':
      await handleSelectDate(client, userId, text);
      break;

    case 'scheduling_time':
      await handleSelectTime(client, userId, text);
      break;

    case 'scheduling_confirm':
      await handleConfirm(client, userId, text);
      break;
  }
}

/**
 * Step 1: Selecionar o serviço para agendamento.
 */
async function handleSelectService(client, userId, text) {
  if (text === 'init') {
    const services = await getServices();
    const msg = formatServiceSelection(services);
    await client.sendMessage(userId, msg);
    return;
  }

  const services = await getServices();
  const index = parseInt(text, 10) - 1;

  if (isNaN(index) || index < 0 || index >= services.length) {
    await client.sendMessage(userId, '⚠️ Opção inválida. Escolha um serviço da lista ou digite *0* para voltar.');
    return;
  }

  const selected = services[index];
  setSessionData(userId, 'service', selected.name);
  setStep(userId, 'scheduling_date');

  await client.sendMessage(
    userId,
    `✅ Serviço selecionado: *${selected.name}*\n\n📅 Agora informe o *dia* desejado (ex: 25/03, segunda-feira):`
  );
}

/**
 * Step 2: Informar o dia do agendamento.
 */
async function handleSelectDate(client, userId, text) {
  if (!text || text.length < 2) {
    await client.sendMessage(userId, '⚠️ Por favor, informe uma data válida (ex: 25/03):');
    return;
  }

  setSessionData(userId, 'date', text);
  setStep(userId, 'scheduling_time');

  await client.sendMessage(
    userId,
    `📅 Data selecionada: *${text}*\n\n🕐 Agora informe o *horário* desejado (ex: 14:00, 10h):`
  );
}

/**
 * Step 3: Informar o horário do agendamento.
 */
async function handleSelectTime(client, userId, text) {
  if (!text || text.length < 2) {
    await client.sendMessage(userId, '⚠️ Por favor, informe um horário válido (ex: 14:00):');
    return;
  }

  setSessionData(userId, 'time', text);
  setStep(userId, 'scheduling_confirm');

  const session = getSession(userId);
  const summary =
    `📋 *Resumo do Agendamento:*\n\n` +
    `💅 Serviço: *${session.data.service}*\n` +
    `📅 Data: *${session.data.date}*\n` +
    `🕐 Horário: *${session.data.time}*\n\n` +
    `Confirma o agendamento?\n` +
    `1 - ✅ Sim, confirmar\n` +
    `2 - ❌ Não, cancelar`;

  await client.sendMessage(userId, summary);
}

/**
 * Step 4: Confirmar ou cancelar o agendamento.
 */
async function handleConfirm(client, userId, text) {
  const session = getSession(userId);

  if (text === '1') {
    const confirmation =
      `✅ *Agendamento confirmado!*\n\n` +
      `💅 ${session.data.service}\n` +
      `📅 ${session.data.date} às ${session.data.time}\n\n` +
      `Entraremos em contato para confirmar. Obrigada! 💖`;

    await client.sendMessage(userId, confirmation);
    resetSession(userId);
    return;
  }

  if (text === '2') {
    await client.sendMessage(userId, '❌ Agendamento cancelado.\n\nDigite qualquer mensagem para voltar ao menu.');
    resetSession(userId);
    return;
  }

  await client.sendMessage(userId, '⚠️ Digite *1* para confirmar ou *2* para cancelar.');
}

module.exports = { handleScheduling };
