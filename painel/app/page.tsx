'use client';

import { useState, useEffect, useRef } from 'react';
import api from '@/lib/api';
import PageHeader from '@/components/PageHeader';
import Toast from '@/components/Toast';

interface DashboardData {
  servicesCount: number;
  faqCount: number;
  productsCount: number;
  messagesCount: number;
  hasSettings: boolean;
  businessName: string;
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData>({
    servicesCount: 0,
    faqCount: 0,
    productsCount: 0,
    messagesCount: 0,
    hasSettings: false,
    businessName: '',
  });
  const [loading, setLoading] = useState(true);
  const [bgImage, setBgImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [servicesRes, faqRes, settingsRes, productsRes, messagesRes] = await Promise.all([
          api.get('/services'),
          api.get('/faq'),
          api.get('/settings'),
          api.get('/products'),
          api.get('/messages', { params: { limit: '1' } }),
        ]);

        setData({
          servicesCount: servicesRes.data?.length || 0,
          faqCount: faqRes.data?.length || 0,
          productsCount: productsRes.data?.length || 0,
          messagesCount: messagesRes.data?.total || 0,
          hasSettings: !!settingsRes.data,
          businessName: settingsRes.data?.businessName || '',
        });
      } catch (error) {
        console.error('Erro ao carregar dashboard:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();

    // Carregar imagem de fundo salva
    const saved = localStorage.getItem('dashboard_bg');
    if (saved) setBgImage(saved);
  }, []);

  async function handleBgUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const url = res.data.url;
      setBgImage(url);
      localStorage.setItem('dashboard_bg', url);
      setToast({ type: 'success', text: 'Imagem de fundo atualizada!' });
    } catch {
      setToast({ type: 'error', text: 'Erro ao enviar imagem.' });
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  function removeBg() {
    setBgImage(null);
    localStorage.removeItem('dashboard_bg');
    setToast({ type: 'success', text: 'Imagem de fundo removida.' });
  }

  if (loading) {
    return (
      <div className="pt-16 md:pt-0">
        <PageHeader title="Dashboard" subtitle="Carregando..." />
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-3 border-rose-200 border-t-rose-500 rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="pt-16 md:pt-0">
      {toast && <Toast message={toast.text} type={toast.type} onClose={() => setToast(null)} />}

      {/* Hero Banner */}
      <div className="relative rounded-2xl overflow-hidden mb-8 group">
        <div className={`relative h-[220px] md:h-[260px] ${bgImage ? '' : 'bg-gradient-to-br from-rose-400 via-pink-500 to-rose-600'}`}>
          {bgImage && (
            <img src={bgImage} alt="Background" className="absolute inset-0 w-full h-full object-cover" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          <div className="relative h-full flex flex-col justify-end p-6 md:p-8">
            <h1 className="text-2xl md:text-3xl font-extrabold text-white drop-shadow-lg">
              {data.businessName || 'Dashboard'}
            </h1>
            <p className="text-white/70 text-sm mt-1 font-medium">
              Visão geral do seu bot de atendimento
            </p>
          </div>

          {/* Upload button */}
          <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {bgImage && (
              <button
                onClick={removeBg}
                className="p-2.5 rounded-xl bg-black/40 backdrop-blur-sm text-white/80 hover:text-white hover:bg-black/60 transition-all duration-200"
                title="Remover imagem"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
            <label className="p-2.5 rounded-xl bg-black/40 backdrop-blur-sm text-white/80 hover:text-white hover:bg-black/60 transition-all duration-200 cursor-pointer" title="Alterar imagem de fundo">
              {uploading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
                </svg>
              )}
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleBgUpload}
                disabled={uploading}
              />
            </label>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        <div className="stat-card">
          <div className="text-3xl mb-2">💅</div>
          <div className="text-2xl font-bold bg-gradient-to-r from-rose-400 to-rose-600 bg-clip-text text-transparent">
            {data.servicesCount}
          </div>
          <div className="text-[11px] text-gray-400 mt-1 font-medium uppercase tracking-wider">Serviços</div>
        </div>

        <div className="stat-card">
          <div className="text-3xl mb-2">❓</div>
          <div className="text-2xl font-bold bg-gradient-to-r from-rose-400 to-rose-600 bg-clip-text text-transparent">
            {data.faqCount}
          </div>
          <div className="text-[11px] text-gray-400 mt-1 font-medium uppercase tracking-wider">FAQ</div>
        </div>

        <div className="stat-card">
          <div className="text-3xl mb-2">🛍️</div>
          <div className="text-2xl font-bold bg-gradient-to-r from-rose-400 to-rose-600 bg-clip-text text-transparent">
            {data.productsCount}
          </div>
          <div className="text-[11px] text-gray-400 mt-1 font-medium uppercase tracking-wider">Produtos</div>
        </div>

        <div className="stat-card">
          <div className="text-3xl mb-2">💬</div>
          <div className="text-2xl font-bold bg-gradient-to-r from-rose-400 to-rose-600 bg-clip-text text-transparent">
            {data.messagesCount}
          </div>
          <div className="text-[11px] text-gray-400 mt-1 font-medium uppercase tracking-wider">Mensagens</div>
        </div>

        <div className="stat-card">
          <div className="text-3xl mb-2">⚙️</div>
          <div className="text-2xl font-bold">
            {data.hasSettings ? <span className="text-emerald-400">✅</span> : <span className="text-red-400">❌</span>}
          </div>
          <div className="text-[11px] text-gray-400 mt-1 font-medium uppercase tracking-wider">Config</div>
        </div>
      </div>

      {/* Info card */}
      <div className="glass-card p-8">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center">
            <span className="text-2xl">💡</span>
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">Como funciona</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              O bot responde automaticamente as mensagens no WhatsApp utilizando as
              informações cadastradas aqui no painel. Você pode editar serviços,
              dúvidas frequentes e a mensagem de boas-vindas a qualquer momento.
              As alterações são aplicadas <strong className="text-rose-500">em tempo real</strong>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
