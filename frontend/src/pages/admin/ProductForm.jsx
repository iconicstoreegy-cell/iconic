import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { getProductById, createProduct, updateProduct } from '../../services/productService';
import api from '../../services/api';
import { FiPlus, FiTrash2, FiUpload, FiArrowLeft, FiX } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const emptyVariant = { size: '', color: '', colorHex: '#000000', stock: 0 };

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
const PRESET_COLORS = [
  { name: 'Black', hex: '#000000' },
  { name: 'White', hex: '#FFFFFF' },
  { name: 'Navy', hex: '#1e3a5f' },
  { name: 'Grey', hex: '#6b7280' },
  { name: 'Beige', hex: '#d4b896' },
  { name: 'Brown', hex: '#7c4a1e' },
  { name: 'Olive', hex: '#6b7c3a' },
  { name: 'Red', hex: '#dc2626' },
];

const Section = ({ title, children }) => (
  <div className="bg-white rounded-xl border border-primary-100 shadow-sm overflow-hidden">
    <div className="px-6 py-4 border-b border-primary-100 bg-primary-50/50">
      <h2 className="text-xs font-semibold tracking-widest uppercase text-primary-600">{title}</h2>
    </div>
    <div className="p-6">{children}</div>
  </div>
);

export default function ProductForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    name: { en: '', ar: '' },
    description: { en: '', ar: '' },
    category: { en: '', ar: '' },
    price: '',
    discountPrice: '',
    images: [],
    variants: [{ ...emptyVariant }],
    isFeatured: false,
    isNewCollection: false,
    tags: ''
  });
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState('en');

  const { data: product, isLoading: loadingProduct } = useQuery({
    queryKey: ['product', id],
    queryFn: () => getProductById(id),
    enabled: isEdit
  });

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name || { en: '', ar: '' },
        description: product.description || { en: '', ar: '' },
        category: product.category || { en: '', ar: '' },
        price: product.price || '',
        discountPrice: product.discountPrice || '',
        images: product.images || [],
        variants: product.variants?.length ? product.variants : [{ ...emptyVariant }],
        isFeatured: product.isFeatured || false,
        isNewCollection: product.isNewCollection || false,
        tags: product.tags?.join(', ') || ''
      });
    }
  }, [product]);

  const mutation = useMutation({
    mutationFn: (data) => isEdit ? updateProduct(id, data) : createProduct(data),
    onSuccess: () => {
      toast.success(isEdit ? 'Product updated successfully' : 'Product created successfully');
      queryClient.invalidateQueries(['adminProducts']);
      navigate('/admin/products');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Something went wrong')
  });

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploading(true);
    try {
      const formData = new FormData();
      files.forEach((f) => formData.append('images', f));
      const { data } = await api.post('/upload/images', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setForm((f) => ({ ...f, images: [...f.images, ...data.map((d) => d.url)] }));
      toast.success(`${files.length} image(s) uploaded`);
    } catch {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (i) => setForm((f) => ({ ...f, images: f.images.filter((_, idx) => idx !== i) }));
  const addVariant = () => setForm((f) => ({ ...f, variants: [...f.variants, { ...emptyVariant }] }));
  const removeVariant = (i) => setForm((f) => ({ ...f, variants: f.variants.filter((_, idx) => idx !== i) }));
  const updateVariant = (i, key, val) => setForm((f) => ({
    ...f,
    variants: f.variants.map((v, idx) => idx === i ? { ...v, [key]: val } : v)
  }));
  const setNested = (key, lang, val) => setForm((f) => ({ ...f, [key]: { ...f[key], [lang]: val } }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.en || !form.name.ar) { toast.error('Both English and Arabic names are required'); return; }
    if (!form.price) { toast.error('Price is required'); return; }
    mutation.mutate({
      ...form,
      price: Number(form.price),
      discountPrice: Number(form.discountPrice) || 0,
      tags: form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : []
    });
  };

  if (isEdit && loadingProduct) return (
    <div className="space-y-4 animate-pulse max-w-4xl">
      {Array(4).fill(0).map((_, i) => <div key={i} className="h-32 bg-white rounded-xl" />)}
    </div>
  );

  return (
    <div className="max-w-4xl space-y-5">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/admin/products')} className="p-2 hover:bg-primary-100 rounded-lg transition-colors">
          <FiArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-primary-950">
            {isEdit ? 'Edit Product' : 'Add New Product'}
          </h1>
          <p className="text-sm text-primary-400 mt-0.5">
            {isEdit ? `Editing: ${product?.name?.en}` : 'Fill in the details below'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Language Tabs + Name/Description */}
        <Section title="Product Content">
          {/* Tab switcher */}
          <div className="flex gap-1 mb-5 bg-primary-100 p-1 rounded-lg w-fit">
            {['en', 'ar'].map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => setActiveTab(lang)}
                className={`px-5 py-2 text-xs font-medium rounded-md transition-all ${activeTab === lang ? 'bg-white shadow text-primary-950' : 'text-primary-500 hover:text-primary-700'}`}
              >
                {lang === 'en' ? '🇬🇧 English' : '🇸🇦 Arabic'}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: activeTab === 'en' ? -10 : 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="space-y-4"
              dir={activeTab === 'ar' ? 'rtl' : 'ltr'}
            >
              <div>
                <label className="block text-xs text-primary-500 mb-1.5">
                  Product Name {activeTab === 'en' ? '(English)' : '(Arabic)'}
                </label>
                <input
                  value={form.name[activeTab]}
                  onChange={(e) => setNested('name', activeTab, e.target.value)}
                  className="input-field"
                  placeholder={activeTab === 'en' ? 'e.g. Black Oversized Hoodie' : 'مثال: هودي أوفرسايز أسود'}
                />
              </div>
              <div>
                <label className="block text-xs text-primary-500 mb-1.5">
                  Description {activeTab === 'en' ? '(English)' : '(Arabic)'}
                </label>
                <textarea
                  value={form.description[activeTab]}
                  onChange={(e) => setNested('description', activeTab, e.target.value)}
                  rows={4}
                  className="input-field resize-none"
                  placeholder={activeTab === 'en' ? 'Describe the product...' : 'وصف المنتج...'}
                />
              </div>
              <div>
                <label className="block text-xs text-primary-500 mb-1.5">
                  Category {activeTab === 'en' ? '(English)' : '(Arabic)'}
                </label>
                <input
                  value={form.category[activeTab]}
                  onChange={(e) => setNested('category', activeTab, e.target.value)}
                  className="input-field"
                  placeholder={activeTab === 'en' ? 'e.g. Hoodies' : 'مثال: هوديز'}
                />
              </div>
            </motion.div>
          </AnimatePresence>
        </Section>

        {/* Pricing */}
        <Section title="Pricing & Flags">
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs text-primary-500 mb-1.5">Price (EGP) *</label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  value={form.price}
                  onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                  className="input-field pr-14"
                  placeholder="0"
                  required
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-primary-400">EGP</span>
              </div>
            </div>
            <div>
              <label className="block text-xs text-primary-500 mb-1.5">Sale Price (optional)</label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  value={form.discountPrice}
                  onChange={(e) => setForm((f) => ({ ...f, discountPrice: e.target.value }))}
                  className="input-field pr-14"
                  placeholder="0"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-primary-400">EGP</span>
              </div>
              {form.discountPrice && form.price && Number(form.discountPrice) < Number(form.price) && (
                <p className="text-xs text-emerald-600 mt-1">
                  {Math.round((1 - form.discountPrice / form.price) * 100)}% off
                </p>
              )}
            </div>
          </div>
          <div className="flex gap-6">
            {[
              { key: 'isFeatured', label: '⭐ Featured Product' },
              { key: 'isNewCollection', label: '🆕 New Collection' }
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center gap-2.5 cursor-pointer group">
                <div
                  onClick={() => setForm((f) => ({ ...f, [key]: !f[key] }))}
                  className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${form[key] ? 'bg-primary-950' : 'bg-primary-200'}`}
                >
                  <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form[key] ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </div>
                <span className="text-sm text-primary-700">{label}</span>
              </label>
            ))}
          </div>
        </Section>

        {/* Images */}
        <Section title="Product Images">
          <div className="space-y-4">
            <label className={`flex items-center justify-center gap-3 border-2 border-dashed rounded-xl p-8 cursor-pointer transition-colors ${uploading ? 'border-primary-300 bg-primary-50' : 'border-primary-200 hover:border-primary-400 hover:bg-primary-50'}`}>
              <FiUpload size={20} className="text-primary-400" />
              <div className="text-center">
                <p className="text-sm font-medium text-primary-700">{uploading ? 'Uploading...' : 'Click to upload images'}</p>
                <p className="text-xs text-primary-400 mt-0.5">PNG, JPG, WEBP up to 10MB each</p>
              </div>
              <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploading} />
            </label>

            {form.images.length > 0 && (
              <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
                {form.images.map((url, i) => (
                  <div key={i} className="relative group aspect-[3/4]">
                    <img src={url} alt="" className="w-full h-full object-cover rounded-lg" />
                    {i === 0 && (
                      <span className="absolute bottom-1 left-1 text-[10px] bg-primary-950 text-white px-1.5 py-0.5 rounded">Main</span>
                    )}
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <FiX size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Section>

        {/* Variants */}
        <Section title="Variants (Size / Color / Stock)">
          <div className="space-y-3">
            {form.variants.map((v, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-2 md:grid-cols-6 gap-3 items-end p-4 bg-primary-50/50 rounded-lg border border-primary-100"
              >
                {/* Size */}
                <div>
                  <label className="block text-xs text-primary-500 mb-1">Size</label>
                  <select
                    value={v.size}
                    onChange={(e) => updateVariant(i, 'size', e.target.value)}
                    className="input-field py-2 text-sm"
                  >
                    <option value="">Select</option>
                    {SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
                    <option value="custom">Custom</option>
                  </select>
                  {v.size === 'custom' && (
                    <input
                      className="input-field py-2 text-sm mt-1"
                      placeholder="e.g. 42"
                      onChange={(e) => updateVariant(i, 'size', e.target.value)}
                    />
                  )}
                </div>

                {/* Color Name */}
                <div>
                  <label className="block text-xs text-primary-500 mb-1">Color</label>
                  <input
                    value={v.color}
                    onChange={(e) => updateVariant(i, 'color', e.target.value)}
                    className="input-field py-2 text-sm"
                    placeholder="Black"
                  />
                </div>

                {/* Color Presets */}
                <div>
                  <label className="block text-xs text-primary-500 mb-1">Preset</label>
                  <div className="flex flex-wrap gap-1">
                    {PRESET_COLORS.map((c) => (
                      <button
                        key={c.hex}
                        type="button"
                        title={c.name}
                        onClick={() => { updateVariant(i, 'colorHex', c.hex); updateVariant(i, 'color', c.name); }}
                        className={`w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 ${v.colorHex === c.hex ? 'border-primary-950 scale-110' : 'border-transparent'}`}
                        style={{ backgroundColor: c.hex, boxShadow: c.hex === '#FFFFFF' ? 'inset 0 0 0 1px #e5e5e5' : 'none' }}
                      />
                    ))}
                  </div>
                </div>

                {/* Color Hex */}
                <div>
                  <label className="block text-xs text-primary-500 mb-1">Custom Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={v.colorHex}
                      onChange={(e) => updateVariant(i, 'colorHex', e.target.value)}
                      className="w-10 h-9 rounded cursor-pointer border border-primary-200"
                    />
                    <span className="text-xs text-primary-400 font-mono">{v.colorHex}</span>
                  </div>
                </div>

                {/* Stock */}
                <div>
                  <label className="block text-xs text-primary-500 mb-1">Stock</label>
                  <input
                    type="number"
                    min="0"
                    value={v.stock}
                    onChange={(e) => updateVariant(i, 'stock', Number(e.target.value))}
                    className="input-field py-2 text-sm"
                  />
                </div>

                {/* Remove */}
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => removeVariant(i)}
                    disabled={form.variants.length === 1}
                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30"
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>
              </motion.div>
            ))}

            <button
              type="button"
              onClick={addVariant}
              className="flex items-center gap-2 text-sm text-primary-500 hover:text-primary-950 transition-colors px-4 py-2 border border-dashed border-primary-300 rounded-lg hover:border-primary-500 w-full justify-center"
            >
              <FiPlus size={16} /> Add Variant
            </button>

            {/* Variant Summary */}
            {form.variants.some(v => v.size && v.color) && (
              <div className="mt-2 p-3 bg-primary-50 rounded-lg">
                <p className="text-xs text-primary-500 mb-2">Variant Summary</p>
                <div className="flex flex-wrap gap-2">
                  {form.variants.filter(v => v.size || v.color).map((v, i) => (
                    <span key={i} className="inline-flex items-center gap-1.5 text-xs bg-white border border-primary-200 px-2.5 py-1 rounded-full">
                      <span className="w-3 h-3 rounded-full border border-primary-200" style={{ backgroundColor: v.colorHex }} />
                      {v.size} / {v.color} — {v.stock} pcs
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Section>

        {/* Tags */}
        <Section title="Tags">
          <input
            value={form.tags}
            onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
            className="input-field"
            placeholder="hoodie, premium, black, oversized (comma separated)"
          />
          {form.tags && (
            <div className="flex flex-wrap gap-2 mt-3">
              {form.tags.split(',').map((tag) => tag.trim()).filter(Boolean).map((tag) => (
                <span key={tag} className="text-xs bg-primary-100 text-primary-700 px-2.5 py-1 rounded-full">{tag}</span>
              ))}
            </div>
          )}
        </Section>

        {/* Actions */}
        <div className="flex items-center gap-4 pb-6">
          <button
            type="submit"
            disabled={mutation.isPending}
            className="btn-primary disabled:opacity-60 flex items-center gap-2 min-w-[140px] justify-center"
          >
            {mutation.isPending ? (
              <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</>
            ) : (
              isEdit ? 'Update Product' : 'Create Product'
            )}
          </button>
          <button type="button" onClick={() => navigate('/admin/products')} className="btn-outline">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
