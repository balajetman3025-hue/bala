import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Header } from '../common/Header';
import { Product } from '../../types';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Package,
  Barcode,
  Building,
  Tag,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const ProductListScreen: React.FC = () => {
  const { products, deleteProduct, setEditingProduct, navigateTo } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  // Extract unique categories
  const categories = ['All', ...Array.from(new Set(products.map((p) => p.category).filter(Boolean)))];

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.barcode.includes(searchTerm);
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    navigateTo('editProduct');
  };

  const handleAdd = () => {
    setEditingProduct(null);
    navigateTo('addProduct');
  };

  const confirmDelete = () => {
    if (productToDelete) {
      deleteProduct(productToDelete.id);
      setProductToDelete(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header
        title="Products Inventory"
        subtitle={`${products.length} registered products`}
        showBack={true}
        onBack={() => navigateTo('ownerDashboard')}
        rightAction={
          <button
            onClick={handleAdd}
            id="product-list-add-top-btn"
            className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs shadow-indigo-200 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </button>
        }
      />

      <main className="max-w-5xl w-full mx-auto p-4 sm:p-6 space-y-6 flex-1">
        {/* Search & Category Filter Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              id="product-search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search product name, company, or barcode..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
            />
          </div>

          {categories.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
              <span className="text-slate-400 font-bold uppercase tracking-wider shrink-0 mr-1">
                Category:
              </span>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-lg font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Cards List */}
        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 mx-auto flex items-center justify-center">
              <Package className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 font-heading">
              No products found
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {searchTerm
                ? `No products matched "${searchTerm}". Try another search term.`
                : 'Your inventory is currently empty. Click below to add your first product.'}
            </p>
            <button
              onClick={handleAdd}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Product</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnimatePresence>
              {filteredProducts.map((product) => {
                const isLowStock = product.quantity <= 10;
                const margin = product.sellingPrice - product.purchasePrice;
                const marginPercent =
                  product.purchasePrice > 0
                    ? Math.round((margin / product.purchasePrice) * 100)
                    : 0;

                return (
                  <motion.div
                    key={product.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                              {product.category || 'General'}
                            </span>
                            {isLowStock && (
                              <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                                <AlertCircle className="w-3 h-3" /> Low Stock
                              </span>
                            )}
                          </div>
                          <h3 className="text-base font-bold text-slate-900 font-heading mt-1.5 leading-snug">
                            {product.productName}
                          </h3>
                        </div>

                        {product.image && (
                          <img
                            src={product.image}
                            alt={product.productName}
                            referrerPolicy="no-referrer"
                            className="w-16 h-16 rounded-xl object-cover border border-slate-100 shrink-0"
                          />
                        )}
                      </div>

                      {product.description && (
                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                          {product.description}
                        </p>
                      )}

                      <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <div className="flex items-center gap-1.5 truncate">
                          <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate"><strong>Co:</strong> {product.company || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-1.5 truncate">
                          <Barcode className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate"><strong>Code:</strong> {product.barcode || 'N/A'}</span>
                        </div>
                        <div>
                          <strong>Purchase:</strong> ₹{product.purchasePrice}
                        </div>
                        <div>
                          <strong>Selling:</strong> ₹{product.sellingPrice}
                        </div>
                        <div>
                          <strong>GST Rate:</strong> {product.gst}%
                        </div>
                        <div className={isLowStock ? 'text-amber-700 font-bold' : ''}>
                          <strong>In Stock:</strong> {product.quantity} units
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                          <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                          Margin: ₹{margin} ({marginPercent}%)
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-4 mt-3 border-t border-slate-100">
                      <button
                        onClick={() => handleEdit(product)}
                        id={`product-edit-btn-${product.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => setProductToDelete(product)}
                        id={`product-delete-btn-${product.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {/* Floating Add Product Action Button */}
        <button
          onClick={handleAdd}
          id="product-floating-add-fab"
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-300 flex items-center justify-center transition-transform hover:scale-105 active:scale-95 cursor-pointer z-20"
          title="Add New Product"
        >
          <Plus className="w-7 h-7" />
        </button>
      </main>

      {/* Delete Confirmation Modal */}
      {productToDelete && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl space-y-4">
            <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 font-heading">
              Delete Product?
            </h3>
            <p className="text-xs text-slate-500">
              Are you sure you want to remove <strong>"{productToDelete.productName}"</strong> from your inventory?
            </p>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setProductToDelete(null)}
                className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                id="confirm-delete-product-btn"
                className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 text-white font-bold text-xs hover:bg-rose-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
