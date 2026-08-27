import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Header } from '../common/Header';
import { Package, Building2, Tag, Barcode, IndianRupee, Layers, Percent, Image, ArrowRight } from 'lucide-react';

export const AddEditProductScreen: React.FC = () => {
  const { editingProduct, addProduct, updateProduct, navigateTo, goBack } = useApp();

  const isEditing = Boolean(editingProduct);

  const [formData, setFormData] = useState({
    productName: '',
    description: '',
    company: '',
    category: 'Groceries',
    barcode: '',
    purchasePrice: '',
    sellingPrice: '',
    quantity: '',
    gst: '5',
    image: '',
  });

  const [error, setError] = useState('');

  useEffect(() => {
    if (editingProduct) {
      setFormData({
        productName: editingProduct.productName || '',
        description: editingProduct.description || '',
        company: editingProduct.company || '',
        category: editingProduct.category || 'Groceries',
        barcode: editingProduct.barcode || '',
        purchasePrice: editingProduct.purchasePrice ? String(editingProduct.purchasePrice) : '',
        sellingPrice: editingProduct.sellingPrice ? String(editingProduct.sellingPrice) : '',
        quantity: editingProduct.quantity ? String(editingProduct.quantity) : '',
        gst: editingProduct.gst !== undefined ? String(editingProduct.gst) : '5',
        image: editingProduct.image || '',
      });
    }
  }, [editingProduct]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGenerateBarcode = () => {
    const randomCode = '890' + Math.floor(1000000000 + Math.random() * 9000000000);
    setFormData((prev) => ({ ...prev, barcode: randomCode }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.productName.trim()) {
      setError('Product Name is required.');
      return;
    }

    const purchasePrice = parseFloat(formData.purchasePrice) || 0;
    const sellingPrice = parseFloat(formData.sellingPrice) || 0;
    const quantity = parseInt(formData.quantity, 10) || 0;
    const gst = parseFloat(formData.gst) || 0;

    if (isEditing && editingProduct) {
      updateProduct({
        ...editingProduct,
        productName: formData.productName,
        description: formData.description,
        company: formData.company,
        category: formData.category,
        barcode: formData.barcode,
        purchasePrice,
        sellingPrice,
        quantity,
        gst,
        image: formData.image,
      });
    } else {
      addProduct({
        productName: formData.productName,
        description: formData.description,
        company: formData.company,
        category: formData.category,
        barcode: formData.barcode || '890' + Math.floor(1000000000 + Math.random() * 9000000000),
        purchasePrice,
        sellingPrice,
        quantity,
        gst,
        image: formData.image,
      });
    }

    navigateTo('products');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header
        title={isEditing ? 'Edit Product' : 'Add Product'}
        subtitle={isEditing ? `Updating ${editingProduct?.productName}` : 'Register item in inventory'}
        showBack={true}
        onBack={goBack}
      />

      <main className="max-w-2xl w-full mx-auto p-4 sm:p-6 flex-1">
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 font-heading">
                {isEditing ? 'Update Product Details' : 'Product Information'}
              </h2>
              <p className="text-xs text-slate-500">
                Specify pricing, GST slab, company and current stock count
              </p>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Product Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Product Name *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Package className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  name="productName"
                  id="product-form-name"
                  value={formData.productName}
                  onChange={handleChange}
                  placeholder="e.g. Aashirvaad Shudh Chakki Atta (5kg)"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  required
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Description
              </label>
              <textarea
                name="description"
                id="product-form-desc"
                rows={2}
                value={formData.description}
                onChange={handleChange}
                placeholder="Product specifications, package volume, ingredients, or features..."
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none"
              />
            </div>

            {/* Company & Category */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Company / Brand
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    name="company"
                    id="product-form-company"
                    value={formData.company}
                    onChange={handleChange}
                    placeholder="e.g. ITC Limited, Tata, Nestle"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Category
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Tag className="w-4 h-4" />
                  </div>
                  <select
                    name="category"
                    id="product-form-category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  >
                    <option value="Groceries">Groceries</option>
                    <option value="Dairy">Dairy</option>
                    <option value="Cooking Oils">Cooking Oils</option>
                    <option value="Snacks & Confectionery">Snacks & Confectionery</option>
                    <option value="Beverages">Beverages</option>
                    <option value="Personal Care">Personal Care</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Household">Household</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Barcode */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Barcode / Item Code
                </label>
                <button
                  type="button"
                  onClick={handleGenerateBarcode}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold"
                >
                  Generate Random Barcode
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Barcode className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  name="barcode"
                  id="product-form-barcode"
                  value={formData.barcode}
                  onChange={handleChange}
                  placeholder="8901030384912"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Prices */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Purchase Price (₹)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <IndianRupee className="w-4 h-4" />
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    name="purchasePrice"
                    id="product-form-purchase-price"
                    value={formData.purchasePrice}
                    onChange={handleChange}
                    placeholder="220.00"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Selling Price (₹) *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <IndianRupee className="w-4 h-4" />
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    name="sellingPrice"
                    id="product-form-selling-price"
                    value={formData.sellingPrice}
                    onChange={handleChange}
                    placeholder="260.00"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Quantity & GST Rate */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Stock Quantity (Units) *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Layers className="w-4 h-4" />
                  </div>
                  <input
                    type="number"
                    min="0"
                    name="quantity"
                    id="product-form-quantity"
                    value={formData.quantity}
                    onChange={handleChange}
                    placeholder="50"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  GST Slab (%)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Percent className="w-4 h-4" />
                  </div>
                  <select
                    name="gst"
                    id="product-form-gst"
                    value={formData.gst}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  >
                    <option value="0">0% (Nil / Exempted)</option>
                    <option value="5">5% (Essential Goods)</option>
                    <option value="12">12% (Standard Low)</option>
                    <option value="18">18% (Standard General)</option>
                    <option value="28">28% (Luxury / High)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Image URL */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Product Image URL (Optional)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Image className="w-4 h-4" />
                </div>
                <input
                  type="url"
                  name="image"
                  id="product-form-image"
                  value={formData.image}
                  onChange={handleChange}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-4">
              <button
                type="button"
                onClick={goBack}
                className="flex-1 py-3 px-4 border border-slate-300 text-slate-700 font-bold rounded-xl text-sm hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                id="product-form-save-btn"
                className="flex-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm shadow-md shadow-indigo-200 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{isEditing ? 'Update Product' : 'Save Product'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};
