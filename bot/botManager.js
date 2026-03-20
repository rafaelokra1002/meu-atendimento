const { Client, LocalAuth } = require('whatsapp-web.js');
const { handleIncomingMessage } = require('./handlers/menuHandler');
const { saveMessage } = require('./services/databaseService');

let client = null;
let currentQR = null;
let botStatus = 'disconnected'; // disconnected | connecting | connected
let statusListeners = [];

function notifyStatus() {
  statusListeners.forEach((fn) => fn(botStatus, currentQR));
}

function onStatusChange(fn) {
  statusListeners.push(fn);
  return () => {
    statusListeners = statusListeners.filter((l) => l !== fn);
  };
}

function createClient() {
  const c = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    },
  });

  c.on('qr', (qr) => {
    currentQR = qr;
    botStatus = 'connecting';
    console.log('📱 QR Code gerado — escaneie pelo painel ou terminal.');
    notifyStatus();
  });

  c.on('ready', () => {
    currentQR = null;
    botStatus = 'connected';
    console.log('✅ Bot conectado ao WhatsApp com sucesso!');
    notifyStatus();
  });

  c.on('authenticated', () => {
    currentQR = null;
    console.log('🔐 Autenticado com sucesso.');
  });

  // Interceptar sendMessage para salvar respostas do bot
  const originalSendMessage = c.sendMessage.bind(c);
  c.sendMessage = async (to, content, options) => {
    const result = await originalSendMessage(to, content, options);
    saveMessage({
      from: to,
      name: null,
      body: typeof content === 'string' ? content : '[mídia]',
      isBot: true,
    }).catch((err) => console.error('Erro ao salvar resposta bot:', err));
    return result;
  };

  c.on('message', async (message) => {
    try {
      if (message.from.includes('@g.us') || message.from === 'status@broadcast') return;

      // Salvar mensagem recebida
      const contact = await message.getContact().catch(() => null);
      const contactName = contact?.pushname || contact?.name || null;
      await saveMessage({
        from: message.from,
        name: contactName,
        body: message.body,
        isBot: false,
      }).catch((err) => console.error('Erro ao salvar msg:', err));

      await handleIncomingMessage(c, message);
    } catch (error) {
      console.error('Erro ao processar mensagem:', error);
    }
  });

  c.on('auth_failure', (msg) => {
    console.error('❌ Falha na autenticação:', msg);
    botStatus = 'disconnected';
    currentQR = null;
    notifyStatus();
  });

  c.on('disconnected', (reason) => {
    console.log('⚠️ Bot desconectado:', reason);
    botStatus = 'disconnected';
    currentQR = null;
    client = null;
    notifyStatus();
  });

  return c;
}

async function startBot() {
  if (client && botStatus !== 'disconnected') {
    return { success: false, message: 'Bot já está rodando.' };
  }

  try {
    currentQR = null;
    botStatus = 'connecting';
    notifyStatus();

    client = createClient();
    await client.initialize();
    console.log('🚀 Bot inicializado.');
    return { success: true, message: 'Bot iniciado.' };
  } catch (error) {
    console.error('Erro ao iniciar bot:', error);
    botStatus = 'disconnected';
    client = null;
    notifyStatus();
    return { success: false, message: 'Erro ao iniciar bot.' };
  }
}

async function stopBot() {
  if (!client) {
    botStatus = 'disconnected';
    notifyStatus();
    return { success: true, message: 'Bot já está parado.' };
  }

  try {
    await client.destroy();
  } catch (error) {
    console.error('Erro ao parar bot:', error);
  }

  client = null;
  currentQR = null;
  botStatus = 'disconnected';
  notifyStatus();
  return { success: true, message: 'Bot desligado.' };
}

function getStatus() {
  return { status: botStatus, hasQR: !!currentQR };
}

function getQR() {
  return currentQR;
}

module.exports = { startBot, stopBot, getStatus, getQR, onStatusChange };
