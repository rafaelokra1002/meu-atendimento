const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Criar configurações iniciais
  await prisma.settings.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      businessName: 'Studio Bruna Beauty',
      welcomeMsg:
        'Oi, seja bem-vinda 💖\nComo posso te ajudar?\n\n1 - Serviços\n2 - Valores\n3 - Agendamento\n4 - Dúvidas\n5 - Falar com atendente',
      promotion: '✨ Promoção do mês: 10% de desconto em qualquer serviço! ✨',
    },
  });

  // Criar serviços iniciais
  const services = [
    { name: 'Manicure', description: '💅 Manicure tradicional ou em gel.\nDuração: ~1h\nValor: a partir de R$35' },
    { name: 'Pedicure', description: '🦶 Pedicure completa com hidratação.\nDuração: ~1h\nValor: a partir de R$40' },
    { name: 'Alongamento de cílios', description: '👁️ Alongamento fio a fio ou volume russo.\nDuração: ~2h\nValor: a partir de R$120' },
    { name: 'Design de sobrancelha', description: '✨ Design com henna ou linha.\nDuração: ~30min\nValor: a partir de R$30' },
    { name: 'Terapia com pedras quentes', description: '🪨 Sessão relaxante com pedras vulcânicas.\nDuração: ~1h30\nValor: a partir de R$80' },
  ];

  for (const service of services) {
    await prisma.service.create({ data: service });
  }

  // Criar FAQ inicial
  const faqs = [
    {
      question: 'Qual o horário de funcionamento?',
      answer: 'Funciono de segunda a sábado, das 8h às 18h.',
    },
    {
      question: 'Onde fica o local de atendimento?',
      answer: 'Atendo em domicílio ou no meu espaço. Me chame para mais detalhes!',
    },
    {
      question: 'Aceita cartão?',
      answer: 'Sim! Aceito PIX, cartão de débito e crédito.',
    },
  ];

  for (const faq of faqs) {
    await prisma.faq.create({ data: faq });
  }

  console.log('Seed executado com sucesso!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
