import React from 'react';
import { useApp } from '../../context/AppContext';
import { Header } from '../common/Header';
import {
  Package,
  Building,
  Tag,
  Barcode,
  Percent,
  Layers,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Truck,
} from 'lucide-react';

export const ProductDetailScreen: React.FC = () => {
  const { selectedProduct, navigateTo, goBack } = useApp();

  if (!selectedProduct) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
        <p className="text-sm text-slate-500 mb-4">No product selected</p>
        <button
          onClick={() => navigateTo('customerProducts')}
          className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold"
        >
          Return to Catalog
        </button>
      </div>
    );
  }

  const inStock = selectedProduct.quantity > 0;
  const estimatedTax = (selectedProduct.sellingPrice * selectedProduct.gst) / 100;
  const totalWithTax = selectedProduct.sellingPrice + estimatedTax;

  const handleBuyNow = () => {
    navigateTo('order');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header
        title="Product Details"
        subtitle={selectedProduct.productName}
        showBack={true}
        onBack={goBack}
      />

      <main className="max-w-3xl w-full mx-auto p-4 sm:p-6 space-y-6 flex-1">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          {/* Hero Image Section */}
          <div className="h-64 sm:h-80 bg-slate-100 relative flex items-center justify-center">
            {selectedProduct.image ? (
              <img
                src={selectedProduct.image}
                alt={selectedProduct.productName}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-24 h-24 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Package className="w-12 h-12" />
              </div>
            )}
            <span className="absolute top-4 left-4 bg-white/95 backdrop-blur-xs text-slate-800 text-xs font-bold px-3 py-1 rounded-lg shadow-xs">
              {selectedProduct.category}
            </span>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            {/* Header info */}
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                <span>{selectedProduct.storeName ? `Sold by: ${selectedProduct.storeName}` : selectedProduct.company}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading leading-tight">
                {selectedProduct.productName}
              </h2>
            </div>

            {/* Description */}
            {selectedProduct.description && (
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Description & Specifications
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
                  {selectedProduct.description}
                </p>
              </div>
            )}

            {/* Specifications Matrix */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1 mb-1">
                  <Building className="w-3.5 h-3.5 text-slate-500" /> Merchant
                </p>
                <p className="text-xs font-bold text-slate-900 truncate">
                  {selectedProduct.storeName || selectedProduct.company}
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1 mb-1">
                  <Tag className="w-3.5 h-3.5 text-slate-500" /> Category
                </p>
                <p className="text-xs font-bold text-slate-900 truncate">
                  {selectedProduct.category || 'General'}
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1 mb-1">
                  <Percent className="w-3.5 h-3.5 text-slate-500" /> GST Rate
                </p>
                <p className="text-xs font-bold text-slate-900 truncate">
                  {selectedProduct.gst}% Tax Included
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1 mb-1">
                  <Layers className="w-3.5 h-3.5 text-slate-500" /> In Stock
                </p>
                <p className="text-xs font-bold text-slate-900 truncate">
                  {selectedProduct.quantity} units
                </p>
              </div>
            </div>

            {/* Pricing Card */}
            <div className="p-5 bg-emerald-50/70 border border-emerald-200/60 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                  Price Payable (incl. taxes)
                </span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-3xl font-black text-slate-900 font-heading">
                    ₹{totalWithTax.toFixed(2)}
                  </span>
                  <span className="text-xs text-slate-500">
                    (₹{selectedProduct.sellingPrice} + ₹{estimatedTax.toFixed(2)} GST)
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleBuyNow}
                  disabled={!inStock}
                  id="product-detail-buy-btn"
                  className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-xl text-sm shadow-md shadow-emerald-200 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>{inStock ? 'Proceed to Order' : 'Out of Stock'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
