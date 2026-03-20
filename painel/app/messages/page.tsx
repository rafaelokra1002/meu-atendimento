'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import PageHeader from '@/components/PageHeader';
import Toast from '@/components/Toast';

interface Message {
  id: string;
  from: string;
  name: string | null;
  body: string;
  isBot: boolean;
  createdAt: string;
}

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [selectedContact, setSelectedContact] = useState<string | null>(null);

  const fetchMessages = useCallback(async () => {
    try {
      const params: Record<string, string> = { page: String(page), limit: '50' };
      if (search.trim()) params.search = search.trim();
      const res = await api.get('/messages', { params });
      setMessages(res.data.messages);
      setTotalPages(res.data.totalPages);
      setTotal(res.data.total);
    } catch {
      console.error('Erro ao carregar mensagens');
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    setLoading(true);
    fetchMessages();
  }, [fetchMessages]);

  // Auto-refresh a cada 10s
  useEffect(() => {
    const interval = setInterval(fetchMessages, 10000);
    return () => clearInterval(interval);
  }, [fetchMessages]);

  async function handleClear() {
    if (!confirm('Tem certeza que deseja apagar todas as mensagens?')) return;
    try {
      await api.delete('/messages');
      setMessages([]);
      setTotal(0);
      setTotalPages(1);
      setPage(1);
      setToast({ type: 'success', text: 'Todas as mensagens foram apagadas.' });
    } catch {
      setToast({ type: 'error', text: 'Erro ao apagar mensagens.' });
    }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    fetchMessages();
  }

  // Agrupar mensagens por contato
  const contacts = Array.from(
    new Map(
      messages
        .filter((m) => !m.isBot)
        .map((m) => [m.from, { from: m.from, name: m.name }])
    ).values()
  );

  const filteredMessages = selectedContact
    ? messages.filter((m) => m.from === selectedContact)
    : messages;

  function formatPhone(from: string) {
    return from.replace('@c.us', '');
  }

  function formatTime(dateStr: string) {
    const d = new Date(dateStr);
    return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }

  function formatDate(dateStr: string) {
    const d = new Date(dateStr);
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' });
  }

  if (loading && messages.length === 0) {
    return (
      <div className="pt-16 md:pt-0">
        <PageHeader title="Mensagens" subtitle="Carregando..." />
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-3 border-rose-200 border-t-rose-500 rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="pt-16 md:pt-0">
      {toast && <Toast message={toast.text} type={toast.type} onClose={() => setToast(null)} />}
      <PageHeader title="Mensagens" subtitle={`${total} mensagens recebidas`} />

      {/* Barra de ações */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome, número ou mensagem..."
            className="input-field flex-1"
          />
          <button type="submit" className="btn-primary whitespace-nowrap">
            Buscar
          </button>
        </form>
        {total > 0 && (
          <button onClick={handleClear} className="btn-danger whitespace-nowrap">
            Limpar tudo
          </button>
        )}
      </div>

      {messages.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <div className="text-5xl mb-4">💬</div>
          <h3 className="text-lg font-bold text-gray-700 mb-2">Nenhuma mensagem ainda</h3>
          <p className="text-sm text-gray-400">
            As mensagens recebidas pelo bot aparecerão aqui automaticamente.
          </p>
        </div>
      ) : (
        <div className="flex gap-4 h-[calc(100vh-280px)] min-h-[400px]">
          {/* Lista de contatos */}
          <div className="w-full sm:w-[280px] flex-shrink-0 glass-card overflow-hidden flex flex-col">
            <div className="px-4 py-3 border-b border-gray-100">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Contatos ({contacts.length})
              </h3>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <button
                onClick={() => setSelectedContact(null)}
                className={`w-full text-left px-4 py-3 border-b border-gray-50 transition-colors duration-150 ${
                  !selectedContact ? 'bg-rose-50 border-l-2 border-l-rose-400' : 'hover:bg-gray-50'
                }`}
              >
                <div className="text-sm font-semibold text-gray-800">Todas</div>
                <div className="text-[11px] text-gray-400">{total} mensagens</div>
              </button>
              {contacts.map((c) => (
                <button
                  key={c.from}
                  onClick={() => setSelectedContact(c.from)}
                  className={`w-full text-left px-4 py-3 border-b border-gray-50 transition-colors duration-150 ${
                    selectedContact === c.from ? 'bg-rose-50 border-l-2 border-l-rose-400' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="text-sm font-semibold text-gray-800 truncate">
                    {c.name || formatPhone(c.from)}
                  </div>
                  <div className="text-[11px] text-gray-400 truncate">{formatPhone(c.from)}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Área de mensagens */}
          <div className="flex-1 glass-card overflow-hidden flex flex-col">
            {selectedContact && (
              <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center text-white text-sm font-bold">
                  {(contacts.find((c) => c.from === selectedContact)?.name || formatPhone(selectedContact))[0]?.toUpperCase()}
                </div>
                <div>
                  <div className="text-sm font-bold text-gray-800">
                    {contacts.find((c) => c.from === selectedContact)?.name || formatPhone(selectedContact)}
                  </div>
                  <div className="text-[11px] text-gray-400">{formatPhone(selectedContact)}</div>
                </div>
              </div>
            )}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar bg-gray-50/50">
              {filteredMessages.length === 0 ? (
                <div className="text-center text-gray-400 text-sm py-10">Nenhuma mensagem</div>
              ) : (
                [...filteredMessages].reverse().map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.isBot ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[75%] rounded-2xl px-4 py-2.5 shadow-sm ${
                        msg.isBot
                          ? 'bg-gradient-to-br from-rose-500 to-pink-500 text-white rounded-br-md'
                          : 'bg-white text-gray-800 rounded-bl-md border border-gray-100'
                      }`}
                    >
                      {!msg.isBot && !selectedContact && (
                        <div className="text-[11px] font-bold text-rose-500 mb-1">
                          {msg.name || formatPhone(msg.from)}
                        </div>
                      )}
                      <div className="text-[13px] leading-relaxed whitespace-pre-wrap break-words">
                        {msg.body}
                      </div>
                      <div
                        className={`text-[10px] mt-1 text-right ${
                          msg.isBot ? 'text-white/60' : 'text-gray-400'
                        }`}
                      >
                        {formatDate(msg.createdAt)} {formatTime(msg.createdAt)}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-6">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Anterior
          </button>
          <span className="text-sm text-gray-500">
            Página {page} de {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Próxima
          </button>
        </div>
      )}
    </div>
  );
}
