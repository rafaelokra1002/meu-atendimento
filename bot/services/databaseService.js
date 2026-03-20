/**
 * Serviço de acesso ao banco de dados via Prisma.
 * Centraliza todas as consultas do bot ao banco.
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Busca as configurações do sistema (mensagem de boas-vindas, promoção, etc).
 */
async function getSettings() {
  return prisma.settings.findFirst();
}

/**
 * Retorna todos os serviços cadastrados.
 */
async function getServices() {
  return prisma.service.findMany();
}

/**
 * Retorna todas as perguntas frequentes.
 */
async function getFaqs() {
  return prisma.faq.findMany();
}

/**
 * Salva uma mensagem recebida ou enviada no banco.
 */
async function saveMessage({ from, name, body, isBot }) {
  return prisma.message.create({
    data: { from, name: name || null, body, isBot: !!isBot },
  });
}

module.exports = {
  prisma,
  getSettings,
  getServices,
  getFaqs,
  saveMessage,
};
