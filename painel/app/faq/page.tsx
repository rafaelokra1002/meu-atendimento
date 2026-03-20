'use client';

import { useState, useEffect, FormEvent, useCallback } from 'react';
import api from '@/lib/api';
import PageHeader from '@/components/PageHeader';
import Toast from '@/components/Toast';

interface Faq {
  id: string;
  question: string;
  answer: string;
}

export default function FaqPage() {
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswer, setNewAnswer] = useState('');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editQuestion, setEditQuestion] = useState('');
  const [editAnswer, setEditAnswer] = useState('');

  useEffect(() => {
    fetchFaqs();
  }, []);

  async function fetchFaqs() {
    try {
      const res = await api.get('/faq');
      setFaqs(res.data || []);
    } catch {
      showToast('error', 'Erro ao carregar FAQ.');
    } finally {
      setLoading(false);
    }
  }

  async function handleAdd(e: FormEvent) {
    e.preventDefault();
    if (!newQuestion.trim() || !newAnswer.trim()) return;

    try {
      const res = await api.post('/faq', {
        question: newQuestion.trim(),
        answer: newAnswer.trim(),
      });
      setFaqs((prev) => [...prev, res.data]);
      setNewQuestion('');
      setNewAnswer('');
      showToast('success', 'Pergunta adicionada com sucesso!');
    } catch {
      showToast('error', 'Erro ao adicionar pergunta.');
    }
  }

  function startEdit(faq: Faq) {
    setEditingId(faq.id);
    setEditQuestion(faq.question);
    setEditAnswer(faq.answer);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditQuestion('');
    setEditAnswer('');
  }

  async function handleSaveEdit(id: string) {
    if (!editQuestion.trim() || !editAnswer.trim()) return;
    try {
      const res = await api.put(`/faq/${id}`, {
        question: editQuestion.trim(),
        answer: editAnswer.trim(),
      });
      setFaqs((prev) => prev.map((f) => (f.id === id ? res.data : f)));
      cancelEdit();
      showToast('success', 'Pergunta atualizada!');
    } catch {
      showToast('error', 'Erro ao atualizar pergunta.');
    }
  }

  async function handleDelete(id: string) {
    try {
      await api.delete(`/faq/${id}`);
      setFaqs((prev) => prev.filter((f) => f.id !== id));
      showToast('success', 'Pergunta removida.');
    } catch {
      showToast('error', 'Erro ao remover pergunta.');
    }
  }

  const showToast = useCallback((type: 'success' | 'error', text: string) => {
    setToast({ type, text });
  }, []);

  if (loading) {
    return (
      <div className="pt-16 md:pt-0">
        <PageHeader title="❓ Dúvidas Frequentes" subtitle="Carregando..." />
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-3 border-rose-200 border-t-rose-500 rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="pt-16 md:pt-0">
      <PageHeader title="❓ Dúvidas Frequentes (FAQ)" subtitle="Gerencie as perguntas e respostas automáticas do bot" />

      {toast && (
        <Toast message={toast.text} type={toast.type} onClose={() => setToast(null)} />
      )}

      {/* Add form */}
      <div className="glass-card p-6 md:p-8 mb-6">
        <h3 className="text-lg font-bold text-gray-800 mb-5 flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-500 flex items-center justify-center text-white text-sm">+</span>
          Adicionar Pergunta
        </h3>
        <form onSubmit={handleAdd} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1.5">Pergunta</label>
            <input
              type="text"
              className="input-field"
              placeholder="Ex: Qual o horário de funcionamento?"
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1.5">Resposta</label>
            <textarea
              className="input-field resize-y min-h-[100px]"
              placeholder="Ex: Funciono de segunda a sábado, das 8h às 18h."
              value={newAnswer}
              onChange={(e) => setNewAnswer(e.target.value)}
            />
          </div>
          <button type="submit" className="btn-primary">
            Adicionar Pergunta
          </button>
        </form>
      </div>

      {/* FAQ list */}
      <div className="glass-card p-6 md:p-8">
        <h3 className="text-lg font-bold text-gray-800 mb-5">
          Perguntas Cadastradas
          <span className="ml-2 inline-flex items-center justify-center w-7 h-7 rounded-full bg-rose-100 text-rose-500 text-xs font-bold">
            {faqs.length}
          </span>
        </h3>

        {faqs.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <div className="text-4xl mb-3">❓</div>
            <p className="text-sm">Nenhuma pergunta cadastrada ainda.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {faqs.map((faq) => (
              <div
                key={faq.id}
                className="p-5 rounded-xl bg-white/60 border border-rose-50 hover:border-rose-200 transition-all duration-200"
              >
                {editingId === faq.id ? (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-semibold text-gray-600 mb-1">Pergunta</label>
                      <input
                        type="text"
                        className="input-field"
                        value={editQuestion}
                        onChange={(e) => setEditQuestion(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-600 mb-1">Resposta</label>
                      <textarea
                        className="input-field resize-y min-h-[80px]"
                        value={editAnswer}
                        onChange={(e) => setEditAnswer(e.target.value)}
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        className="btn-primary"
                        onClick={() => handleSaveEdit(faq.id)}
                      >
                        💾 Salvar
                      </button>
                      <button
                        className="btn-danger"
                        onClick={cancelEdit}
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-800 flex items-center gap-2">
                        <span className="text-amber-400">❓</span>
                        {faq.question}
                      </div>
                      <p className="text-xs text-gray-400 mt-1.5 leading-relaxed whitespace-pre-line">
                        {faq.answer}
                      </p>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        className="btn-edit"
                        onClick={() => startEdit(faq)}
                      >
                        ✏️ Editar
                      </button>
                      <button
                        className="btn-danger"
                        onClick={() => handleDelete(faq.id)}
                      >
                        🗑️ Remover
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
