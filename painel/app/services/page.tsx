'use client';

import { useState, useEffect, FormEvent, useCallback } from 'react';
import api from '@/lib/api';
import PageHeader from '@/components/PageHeader';
import Toast from '@/components/Toast';

interface Service {
  id: string;
  name: string;
  description: string | null;
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchServices();
  }, []);

  async function fetchServices() {
    try {
      const res = await api.get('/services');
      setServices(res.data || []);
    } catch {
      showToast('error', 'Erro ao carregar serviços.');
    } finally {
      setLoading(false);
    }
  }

  async function handleAdd(e: FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;

    try {
      const res = await api.post('/services', {
        name: newName.trim(),
        description: newDescription.trim() || null,
      });
      setServices((prev) => [...prev, res.data]);
      setNewName('');
      setNewDescription('');
      showToast('success', 'Serviço adicionado com sucesso!');
    } catch {
      showToast('error', 'Erro ao adicionar serviço.');
    }
  }

  async function handleDelete(id: string) {
    try {
      await api.delete(`/services/${id}`);
      setServices((prev) => prev.filter((s) => s.id !== id));
      showToast('success', 'Serviço removido.');
    } catch {
      showToast('error', 'Erro ao remover serviço.');
    }
  }

  function startEdit(service: Service) {
    setEditingId(service.id);
    setEditName(service.name);
    setEditDescription(service.description || '');
  }

  async function handleSaveEdit(e: FormEvent) {
    e.preventDefault();
    if (!editName.trim() || !editingId) return;

    try {
      const res = await api.put('/services', {
        id: editingId,
        name: editName.trim(),
        description: editDescription.trim() || null,
      });
      setServices((prev) =>
        prev.map((s) => (s.id === editingId ? res.data : s))
      );
      setEditingId(null);
      showToast('success', 'Serviço atualizado!');
    } catch {
      showToast('error', 'Erro ao atualizar serviço.');
    }
  }

  const showToast = useCallback((type: 'success' | 'error', text: string) => {
    setToast({ type, text });
  }, []);

  if (loading) {
    return (
      <div className="pt-16 md:pt-0">
        <PageHeader title="💅 Serviços" subtitle="Carregando..." />
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-3 border-rose-200 border-t-rose-500 rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="pt-16 md:pt-0">
      <PageHeader title="💅 Serviços" subtitle="Gerencie os serviços que aparecem no bot" />

      {toast && (
        <Toast message={toast.text} type={toast.type} onClose={() => setToast(null)} />
      )}

      {/* Add form */}
      <div className="glass-card p-6 md:p-8 mb-6">
        <h3 className="text-lg font-bold text-gray-800 mb-5 flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-500 flex items-center justify-center text-white text-sm">+</span>
          Adicionar Serviço
        </h3>
        <form onSubmit={handleAdd} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1.5">Nome do serviço</label>
            <input
              type="text"
              className="input-field"
              placeholder="Ex: Manicure"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1.5">
              Resposta do bot <span className="text-gray-400 font-normal">(quando o cliente selecionar)</span>
            </label>
            <textarea
              className="input-field resize-y min-h-[100px]"
              placeholder={"Ex: 💅 Manicure tradicional ou em gel.\nDuração: ~1h\nValor: a partir de R$35"}
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
            />
          </div>
          <button type="submit" className="btn-primary">
            Adicionar Serviço
          </button>
        </form>
      </div>

      {/* Service list */}
      <div className="glass-card p-6 md:p-8">
        <h3 className="text-lg font-bold text-gray-800 mb-5">
          Serviços Cadastrados
          <span className="ml-2 inline-flex items-center justify-center w-7 h-7 rounded-full bg-rose-100 text-rose-500 text-xs font-bold">
            {services.length}
          </span>
        </h3>

        {services.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <div className="text-4xl mb-3">💅</div>
            <p className="text-sm">Nenhum serviço cadastrado ainda.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {services.map((service) => (
              <div
                key={service.id}
                className="p-5 rounded-xl bg-white/60 border border-rose-50 hover:border-rose-200 transition-all duration-200"
              >
                {editingId === service.id ? (
                  <form onSubmit={handleSaveEdit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-600 mb-1.5">Nome</label>
                      <input
                        type="text"
                        className="input-field"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-600 mb-1.5">Resposta do bot</label>
                      <textarea
                        className="input-field resize-y min-h-[100px]"
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                      />
                    </div>
                    <div className="flex gap-2">
                      <button type="submit" className="btn-primary text-xs !px-4 !py-2">Salvar</button>
                      <button type="button" className="btn-secondary" onClick={() => setEditingId(null)}>Cancelar</button>
                    </div>
                  </form>
                ) : (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-800 flex items-center gap-2">
                        <span className="text-rose-400">💅</span>
                        {service.name}
                      </div>
                      {service.description && (
                        <p className="text-xs text-gray-400 mt-1.5 whitespace-pre-line leading-relaxed">
                          {service.description}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button className="btn-edit" onClick={() => startEdit(service)}>✏️ Editar</button>
                      <button className="btn-danger" onClick={() => handleDelete(service.id)}>🗑️ Remover</button>
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
