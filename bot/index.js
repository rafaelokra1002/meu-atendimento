const express = require('express');
const cors = require('cors');
const QRCode = require('qrcode');
const { startBot, stopBot, logoutBot, getStatus, getQR } = require('./botManager');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || process.env.BOT_API_PORT || 3001;

// Status do bot
app.get('/bot/status', (_req, res) => {
  res.json(getStatus());
});

// QR Code como imagem base64
app.get('/bot/qr', async (_req, res) => {
  const qr = getQR();
  if (!qr) {
    return res.json({ qr: null, message: 'Nenhum QR code disponível.' });
  }
  try {
    const dataUrl = await QRCode.toDataURL(qr, { width: 400, margin: 3, errorCorrectionLevel: 'M' });
    res.json({ qr: dataUrl });
  } catch {
    res.status(500).json({ error: 'Erro ao gerar QR code.' });
  }
});

// Ligar bot
app.post('/bot/start', async (_req, res) => {
  const result = await startBot();
  res.json(result);
});

// Desligar bot
app.post('/bot/stop', async (_req, res) => {
  const result = await stopBot();
  res.json(result);
});

// Desconectar dispositivo (logout + limpar sessão)
app.post('/bot/logout', async (_req, res) => {
  const result = await logoutBot();
  res.json(result);
});

app.listen(PORT, () => {
  console.log(`🌐 API do bot rodando em http://localhost:${PORT}`);
  console.log('🚀 Use o painel para iniciar o bot e escanear o QR Code.');
});
