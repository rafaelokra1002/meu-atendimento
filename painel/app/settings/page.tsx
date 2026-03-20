'use client';

import { useState, useEffect, FormEvent, useCallback, useRef } from 'react';
import api from '@/lib/api';
import PageHeader from '@/components/PageHeader';
import Toast from '@/components/Toast';

type BotStatus = 'offline' | 'disconnected' | 'connecting' | 'connected';

export default function SettingsPage() {
  const [businessName, setBusinessName] = useState('');
  const [welcomeMsg, setWelcomeMsg] = useState('');
  const [promotion, setPromotion] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Bot control
  const [botStatus, setBotStatus] = useState<BotStatus>('offline');
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [botLoading, setBotLoading] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  // Poll bot status
  useEffect(() => {
    async function pollBot() {
      try {
        const statusRes = await api.get('/bot/status');
        const s = statusRes.data?.status || 'offline';
        setBotStatus(s);

        if (s === 'connecting') {
          const qrRes = await api.get('/bot/qr');
          setQrCode(qrRes.data?.qr || null);
        } else {
          setQrCode(null);
        }
      } catch {
        setBotStatus('offline');
        setQrCode(null);
      }
    }

    pollBot();
    pollRef.current = setInterval(pollBot, 3000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  async function handleStartBot() {
    setBotLoading(true);
    try {
      await api.post('/bot/start');
      showToast('success', 'Bot iniciado! Aguarde o QR Code...');
    } catch {
      showToast('error', 'Erro ao iniciar o bot.');
    } finally {
      setBotLoading(false);
    }
  }

  async function handleStopBot() {
    setBotLoading(true);
    try {
      await api.post('/bot/stop');
      showToast('success', 'Bot desligado.');
      setBotStatus('disconnected');
      setQrCode(null);
    } catch {
      showToast('error', 'Erro ao desligar o bot.');
    } finally {
      setBotLoading(false);
    }
  }

  async function handleLogoutBot() {
    if (!confirm('Tem certeza que deseja desconectar o dispositivo? Você precisará escanear o QR Code novamente.')) return;
    setBotLoading(true);
    try {
      await api.post('/bot/logout');
      showToast('success', 'Dispositivo desconectado! Clique em "Conectar Novo Dispositivo" para gerar um novo QR Code.');
      setBotStatus('disconnected');
      setQrCode(null);
    } catch {
      showToast('error', 'Erro ao desconectar dispositivo.');
    } finally {
      setBotLoading(false);
    }
  }

  async function handleReconnectBot() {
    setBotLoading(true);
    try {
      // Primeiro faz logout para limpar sessão antiga
      await api.post('/bot/logout').catch(() => {});
      // Depois inicia o bot para gerar novo QR
      await api.post('/bot/start');
      showToast('success', 'Gerando novo QR Code... Aguarde!');
    } catch {
      showToast('error', 'Erro ao conectar novo dispositivo.');
    } finally {
      setBotLoading(false);
    }
  }

  async function fetchSettings() {
    try {
      const res = await api.get('/settings');
      if (res.data) {
        setBusinessName(res.data.businessName || '');
        setWelcomeMsg(res.data.welcomeMsg || '');
        setPromotion(res.data.promotion || '');
        setWhatsappNumber(res.data.whatsappNumber || '');
      }
    } catch {
      showToast('error', 'Erro ao carregar configurações.');
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    if (!welcomeMsg.trim()) {
      showToast('error', 'A mensagem de boas-vindas é obrigatória.');
      return;
    }

    setSaving(true);
    try {
      await api.post('/settings', {
        businessName: businessName.trim(),
        welcomeMsg: welcomeMsg.trim(),
        promotion: promotion.trim() || null,
        whatsappNumber: whatsappNumber.trim(),
      });
      showToast('success', 'Configurações salvas com sucesso!');
    } catch {
      showToast('error', 'Erro ao salvar configurações.');
    } finally {
      setSaving(false);
    }
  }

  const showToast = useCallback((type: 'success' | 'error', text: string) => {
    setToast({ type, text });
  }, []);

  if (loading) {
    return (
      <div className="pt-16 md:pt-0">
        <PageHeader title="⚙️ Configurações" subtitle="Carregando..." />
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-3 border-rose-200 border-t-rose-500 rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="pt-16 md:pt-0">
      <PageHeader title="⚙️ Configurações" subtitle="Configure a mensagem de boas-vindas e promoções do bot" />

      {toast && (
        <Toast message={toast.text} type={toast.type} onClose={() => setToast(null)} />
      )}

      {/* Bot Control */}
      <div className="glass-card p-6 md:p-8 mb-6">
        <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-500 flex items-center justify-center text-white text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
              <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.832-1.438A9.955 9.955 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2z"/>
            </svg>
          </span>
          Controle do Bot
        </h3>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Status + Actions */}
          <div className="flex-1 space-y-5">
            {/* Status indicator */}
            <div className="flex items-center gap-3 p-4 rounded-xl bg-white/50 border border-rose-50">
              <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                botStatus === 'connected' ? 'bg-emerald-400 animate-pulse' :
                botStatus === 'connecting' ? 'bg-amber-400 animate-pulse' :
                botStatus === 'offline' ? 'bg-gray-300' :
                'bg-red-400'
              }`} />
              <div>
                <span className="text-sm font-semibold text-gray-700">
                  {botStatus === 'connected' && '✅ Bot conectado'}
                  {botStatus === 'connecting' && '📱 Aguardando scan do QR Code...'}
                  {botStatus === 'disconnected' && '⚠️ Bot desconectado'}
                  {botStatus === 'offline' && '🔴 Servidor do bot offline'}
                </span>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  {botStatus === 'connected' && 'O bot está recebendo e respondendo mensagens.'}
                  {botStatus === 'connecting' && 'Escaneie o QR Code com seu WhatsApp.'}
                  {botStatus === 'disconnected' && 'Clique em "Ligar Bot" para iniciar.'}
                  {botStatus === 'offline' && 'Certifique-se que o servidor do bot está rodando (npm run bot).'}
                </p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-3">
              {botStatus === 'connected' ? (
                <>
                  <button
                    onClick={handleStopBot}
                    disabled={botLoading}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-400 to-red-500 text-white text-sm font-semibold rounded-xl shadow-md shadow-red-200/50 transition-all duration-200 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100"
                  >
                    {botLoading ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5.636 5.636a9 9 0 1012.728 0M12 3v9" />
                      </svg>
                    )}
                    Desligar Bot
                  </button>
                  <button
                    onClick={handleLogoutBot}
                    disabled={botLoading}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-400 to-orange-500 text-white text-sm font-semibold rounded-xl shadow-md shadow-orange-200/50 transition-all duration-200 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100"
                  >
                    {botLoading ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                    )}
                    Desconectar Dispositivo
                  </button>
                </>
              ) : botStatus === 'connecting' ? (
                <button
                  onClick={handleStopBot}
                  disabled={botLoading}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-400 to-amber-500 text-white text-sm font-semibold rounded-xl shadow-md shadow-amber-200/50 transition-all duration-200 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100"
                >
                  {botLoading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : '⏹️'}
                  Cancelar
                </button>
              ) : (
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={handleStartBot}
                    disabled={botLoading || botStatus === 'offline'}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-400 to-emerald-500 text-white text-sm font-semibold rounded-xl shadow-md shadow-emerald-200/50 transition-all duration-200 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100"
                  >
                    {botLoading ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5.636 5.636a9 9 0 1012.728 0M12 3v9" />
                      </svg>
                    )}
                    Ligar Bot
                  </button>
                  <button
                    onClick={handleReconnectBot}
                    disabled={botLoading || botStatus === 'offline'}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-400 to-blue-500 text-white text-sm font-semibold rounded-xl shadow-md shadow-blue-200/50 transition-all duration-200 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100"
                  >
                    {botLoading ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                      </svg>
                    )}
                    Conectar Novo Dispositivo
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* QR Code area */}
          <div className="flex-shrink-0">
            <div className={`w-[200px] h-[200px] rounded-2xl border-2 flex items-center justify-center overflow-hidden transition-all duration-300 ${
              qrCode ? 'border-rose-200 bg-white shadow-lg shadow-rose-100/40' : 'border-dashed border-gray-200 bg-gray-50/50'
            }`}>
              {qrCode ? (
                <img src={qrCode} alt="QR Code WhatsApp" className="w-full h-full object-contain p-2" />
              ) : (
                <div className="text-center px-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-gray-300 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 6.75h.75v.75h-.75v-.75zM6.75 16.5h.75v.75h-.75v-.75zM16.5 6.75h.75v.75h-.75v-.75zM13.5 13.5h.75v.75h-.75v-.75zM13.5 19.5h.75v.75h-.75v-.75zM19.5 13.5h.75v.75h-.75v-.75zM19.5 19.5h.75v.75h-.75v-.75zM16.5 16.5h.75v.75h-.75v-.75z" />
                  </svg>
                  <p className="text-[11px] text-gray-400 font-medium">
                    {botStatus === 'connecting' ? 'Gerando QR...' : 'QR Code aparecerá aqui'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="glass-card p-6 md:p-8">
        <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-400 to-violet-500 flex items-center justify-center text-white text-sm">💬</span>
          Mensagens do Bot
        </h3>

        <form onSubmit={handleSave} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1.5">
              Nome do Estabelecimento
            </label>
            <input
              type="text"
              className="input-field"
              placeholder="Ex: Studio Bruna Beauty"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
            />
            <p className="text-[11px] text-gray-400 mt-2 leading-relaxed">
              Aparece no topo do painel e identifica seu negócio.
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1.5">
              Número do WhatsApp
            </label>
            <input
              type="text"
              className="input-field"
              placeholder="Ex: 5511999999999"
              value={whatsappNumber}
              onChange={(e) => setWhatsappNumber(e.target.value)}
            />
            <p className="text-[11px] text-gray-400 mt-2 leading-relaxed">
              Código do país + DDD + número, sem espaços ou traços. Usado no botão &quot;Comprar no WhatsApp&quot; da lojinha.
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1.5">
              Mensagem de Boas-Vindas
            </label>
            <textarea
              rows={8}
              className="input-field resize-y"
              placeholder="Digite a mensagem inicial do bot..."
              value={welcomeMsg}
              onChange={(e) => setWelcomeMsg(e.target.value)}
            />
            <p className="text-[11px] text-gray-400 mt-2 leading-relaxed">
              Esta é a primeira mensagem que o cliente recebe ao entrar em contato.
              Use <code className="bg-rose-50 text-rose-400 px-1.5 py-0.5 rounded text-[10px]">\n</code> para quebras de linha.
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1.5">
              Promoção / Valores
            </label>
            <textarea
              rows={4}
              className="input-field resize-y"
              placeholder="Ex: Promoção do mês: 10% de desconto em manicure!"
              value={promotion}
              onChange={(e) => setPromotion(e.target.value)}
            />
            <p className="text-[11px] text-gray-400 mt-2 leading-relaxed">
              Exibida quando o cliente seleciona &quot;Valores&quot; no menu.
            </p>
          </div>

          <div className="pt-2">
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Salvando...
                </>
              ) : (
                '💾 Salvar Configurações'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
