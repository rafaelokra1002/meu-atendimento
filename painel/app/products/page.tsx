'use client';

import { useState, useEffect, FormEvent, useCallback, useRef } from 'react';
import api from '@/lib/api';
import PageHeader from '@/components/PageHeader';
import Toast from '@/components/Toast';

interface Product {
  id: string;
  name: string;
  price: number;
  description: string | null;
  image: string | null;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editImage, setEditImage] = useState('');
  const [editImagePreview, setEditImagePreview] = useState('');
  const [editUploading, setEditUploading] = useState(false);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    try {
      const res = await api.get('/products');
      setProducts(res.data || []);
    } catch {
      showToast('error', 'Erro ao carregar produtos.');
    } finally {
      setLoading(false);
    }
  }

  async function uploadFile(file: File): Promise<string | null> {
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data.url;
    } catch {
      showToast('error', 'Erro ao enviar imagem.');
      return null;
    }
  }

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>, mode: 'add' | 'edit') {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview local
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (mode === 'add') setImagePreview(ev.target?.result as string);
      else setEditImagePreview(ev.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload
    if (mode === 'add') setUploading(true);
    else setEditUploading(true);

    const url = await uploadFile(file);
    if (url) {
      if (mode === 'add') setImage(url);
      else setEditImage(url);
    }

    if (mode === 'add') setUploading(false);
    else setEditUploading(false);
  }

  async function handleAdd(e: FormEvent) {
    e.preventDefault();
    if (!name.trim() || !price.trim()) return;

    try {
      const res = await api.post('/products', {
        name: name.trim(),
        price: parseFloat(price),
        description: description.trim() || null,
        image: image.trim() || null,
      });
      setProducts((prev) => [...prev, res.data]);
      setName('');
      setPrice('');
      setDescription('');
      setImage('');
      setImagePreview('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      showToast('success', 'Produto adicionado!');
    } catch {
      showToast('error', 'Erro ao adicionar produto.');
    }
  }

  function startEdit(p: Product) {
    setEditingId(p.id);
    setEditName(p.name);
    setEditPrice(String(p.price));
    setEditDescription(p.description || '');
    setEditImage(p.image || '');
    setEditImagePreview(p.image || '');
  }

  function cancelEdit() {
    setEditingId(null);
    setEditName('');
    setEditPrice('');
    setEditDescription('');
    setEditImage('');
    setEditImagePreview('');
    if (editFileInputRef.current) editFileInputRef.current.value = '';
  }

  async function handleSaveEdit(id: string) {
    if (!editName.trim() || !editPrice.trim()) return;
    try {
      const res = await api.put('/products', {
        id,
        name: editName.trim(),
        price: parseFloat(editPrice),
        description: editDescription.trim() || null,
        image: editImage.trim() || null,
      });
      setProducts((prev) => prev.map((p) => (p.id === id ? res.data : p)));
      cancelEdit();
      showToast('success', 'Produto atualizado!');
    } catch {
      showToast('error', 'Erro ao atualizar produto.');
    }
  }

  async function handleDelete(id: string) {
    try {
      await api.delete(`/products/${id}`);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      showToast('success', 'Produto removido.');
    } catch {
      showToast('error', 'Erro ao remover produto.');
    }
  }

  const showToast = useCallback((type: 'success' | 'error', text: string) => {
    setToast({ type, text });
  }, []);

  if (loading) {
    return (
      <div className="pt-16 md:pt-0">
        <PageHeader title="🛍️ Produtos" subtitle="Carregando..." />
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-3 border-rose-200 border-t-rose-500 rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="pt-16 md:pt-0">
      <PageHeader title="🛍️ Produtos" subtitle="Gerencie os produtos da sua lojinha" />

      {toast && <Toast message={toast.text} type={toast.type} onClose={() => setToast(null)} />}

      {/* Add form */}
      <div className="glass-card p-6 md:p-8 mb-6">
        <h3 className="text-lg font-bold text-gray-800 mb-5 flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-500 flex items-center justify-center text-white text-sm">+</span>
          Adicionar Produto
        </h3>
        <form onSubmit={handleAdd} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1.5">Nome do produto</label>
              <input type="text" className="input-field" placeholder="Ex: Kit Hidratação Capilar" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1.5">Preço (R$)</label>
              <input type="number" step="0.01" min="0" className="input-field" placeholder="Ex: 89.90" value={price} onChange={(e) => setPrice(e.target.value)} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1.5">Imagem do Produto</label>
            <div className="flex items-start gap-4">
              {imagePreview ? (
                <div className="relative w-24 h-24 rounded-xl overflow-hidden border border-rose-100 flex-shrink-0">
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => { setImage(''); setImagePreview(''); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                    className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                  >✕</button>
                </div>
              ) : null}
              <label className={`flex-1 flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200 ${uploading ? 'border-rose-300 bg-rose-50/50' : 'border-rose-200 hover:border-rose-400 hover:bg-rose-50/30'}`}>
                {uploading ? (
                  <div className="flex items-center gap-2 text-rose-400">
                    <div className="w-5 h-5 border-2 border-rose-200 border-t-rose-500 rounded-full animate-spin" />
                    <span className="text-sm font-medium">Enviando...</span>
                  </div>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-rose-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
                    </svg>
                    <span className="text-sm text-gray-500 font-medium">Clique para enviar imagem</span>
                    <span className="text-[11px] text-gray-400 mt-1">JPG, PNG, WebP ou GIF (máx. 5MB)</span>
                  </>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  onChange={(e) => handleImageChange(e, 'add')}
                  disabled={uploading}
                />
              </label>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1.5">Descrição</label>
            <textarea className="input-field resize-y min-h-[80px]" placeholder="Descreva o produto..." value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <button type="submit" className="btn-primary">Adicionar Produto</button>
        </form>
      </div>

      {/* Products list */}
      <div className="glass-card p-6 md:p-8">
        <h3 className="text-lg font-bold text-gray-800 mb-5">
          Produtos Cadastrados
          <span className="ml-2 inline-flex items-center justify-center w-7 h-7 rounded-full bg-rose-100 text-rose-500 text-xs font-bold">
            {products.length}
          </span>
        </h3>

        {products.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <div className="text-4xl mb-3">🛍️</div>
            <p className="text-sm">Nenhum produto cadastrado ainda.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {products.map((product) => (
              <div key={product.id} className="p-5 rounded-xl bg-white/60 border border-rose-50 hover:border-rose-200 transition-all duration-200">
                {editingId === product.id ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-semibold text-gray-600 mb-1">Nome</label>
                        <input type="text" className="input-field" value={editName} onChange={(e) => setEditName(e.target.value)} />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-600 mb-1">Preço (R$)</label>
                        <input type="number" step="0.01" min="0" className="input-field" value={editPrice} onChange={(e) => setEditPrice(e.target.value)} />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-600 mb-1">Imagem</label>
                      <div className="flex items-start gap-3">
                        {editImagePreview ? (
                          <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-rose-100 flex-shrink-0">
                            <img src={editImagePreview} alt="Preview" className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => { setEditImage(''); setEditImagePreview(''); if (editFileInputRef.current) editFileInputRef.current.value = ''; }}
                              className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center text-[10px] hover:bg-red-600 transition-colors"
                            >✕</button>
                          </div>
                        ) : null}
                        <label className={`flex-1 flex flex-col items-center justify-center p-4 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200 ${editUploading ? 'border-rose-300 bg-rose-50/50' : 'border-rose-200 hover:border-rose-400 hover:bg-rose-50/30'}`}>
                          {editUploading ? (
                            <div className="flex items-center gap-2 text-rose-400">
                              <div className="w-4 h-4 border-2 border-rose-200 border-t-rose-500 rounded-full animate-spin" />
                              <span className="text-xs font-medium">Enviando...</span>
                            </div>
                          ) : (
                            <>
                              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-rose-300 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
                              </svg>
                              <span className="text-xs text-gray-500 font-medium">Trocar imagem</span>
                            </>
                          )}
                          <input
                            ref={editFileInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/gif"
                            className="hidden"
                            onChange={(e) => handleImageChange(e, 'edit')}
                            disabled={editUploading}
                          />
                        </label>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-600 mb-1">Descrição</label>
                      <textarea className="input-field resize-y min-h-[60px]" value={editDescription} onChange={(e) => setEditDescription(e.target.value)} />
                    </div>
                    <div className="flex gap-2">
                      <button className="btn-primary" onClick={() => handleSaveEdit(product.id)}>💾 Salvar</button>
                      <button className="btn-danger" onClick={cancelEdit}>Cancelar</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      {product.image && (
                        <img src={product.image} alt={product.name} className="w-14 h-14 rounded-lg object-cover border border-rose-100 flex-shrink-0" />
                      )}
                      <div className="min-w-0">
                        <div className="font-semibold text-gray-800">{product.name}</div>
                        <div className="text-sm font-bold text-rose-500">
                          R$ {product.price.toFixed(2).replace('.', ',')}
                        </div>
                        {product.description && (
                          <p className="text-xs text-gray-400 mt-1 leading-relaxed line-clamp-2">{product.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button className="btn-edit" onClick={() => startEdit(product)}>✏️ Editar</button>
                      <button className="btn-danger" onClick={() => handleDelete(product.id)}>🗑️ Remover</button>
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
