'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import ProductCard from '@/components/ProductCard';

interface Product {
  id: string;
  name: string;
  price: number;
  description: string | null;
  image: string | null;
}

interface Settings {
  businessName: string;
  whatsappNumber: string;
}

export default function LojaPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [settings, setSettings] = useState<Settings>({ businessName: '', whatsappNumber: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      axios.get('/api/products'),
      axios.get('/api/settings'),
    ])
      .then(([productsRes, settingsRes]) => {
        setProducts(productsRes.data || []);
        setSettings({
          businessName: settingsRes.data?.businessName || 'Nossa Loja',
          whatsappNumber: settingsRes.data?.whatsappNumber || '',
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-rose-50/30 to-white">
      {/* Header */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-rose-100/40 via-pink-50/30 to-rose-100/40" />
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: 'radial-gradient(ellipse at 30% 50%, rgba(251,113,133,0.15) 0%, transparent 70%), radial-gradient(ellipse at 70% 30%, rgba(244,63,94,0.1) 0%, transparent 70%)',
        }} />
        <div className="relative max-w-6xl mx-auto px-4 py-16 md:py-20 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-400 to-pink-500 shadow-lg shadow-rose-300/40 mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800 tracking-tight">
            {settings.businessName}
          </h1>
          <p className="text-gray-400 mt-3 text-base md:text-lg font-medium max-w-md mx-auto leading-relaxed">
            Confira nossos produtos selecionados especialmente para você ✨
          </p>
          <div className="mt-6 w-16 h-1 bg-gradient-to-r from-rose-300 to-pink-400 rounded-full mx-auto" />
        </div>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-4 pb-20 -mt-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="relative">
              <div className="w-12 h-12 border-[3px] border-rose-100 rounded-full" />
              <div className="w-12 h-12 border-[3px] border-transparent border-t-rose-400 rounded-full animate-spin absolute inset-0" />
            </div>
            <p className="text-gray-400 text-sm mt-5 font-medium">Carregando produtos...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-32">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-rose-50 mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-rose-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-700 mb-2">Em breve novidades!</h2>
            <p className="text-gray-400 text-sm max-w-sm mx-auto leading-relaxed">
              Estamos preparando produtos incríveis para você. Volte em breve! 💖
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 md:gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                name={product.name}
                price={product.price}
                description={product.description}
                image={product.image}
                whatsappNumber={settings.whatsappNumber}
              />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-rose-100/60 py-8 text-center">
        <p className="text-xs text-gray-400 font-medium">
          {settings.businessName} &copy; {new Date().getFullYear()} — Todos os direitos reservados
        </p>
      </footer>
    </div>
  );
}
