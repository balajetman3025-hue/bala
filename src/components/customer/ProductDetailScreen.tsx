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
                <span>{selectedProduct.company}</span>
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
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 font-medium">Manufacturer / Brand</span>
                <p className="font-bold text-slate-900 mt-0.5">{selectedProduct.company || 'N/A'}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 font-medium">Category</span>
                <p className="font-bold text-slate-900 mt-0.5">{selectedProduct.category}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 font-medium">Barcode / EAN</span>
                <p className="font-mono font-bold text-slate-900 mt-0.5">{selectedProduct.barcode || 'N/A'}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 font-medium">Base Price</span>
                <p className="font-bold text-slate-900 mt-0.5">₹{selectedProduct.sellingPrice.toFixed(2)}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 font-medium">GST Tax Rate</span>
                <p className="font-bold text-indigo-600 mt-0.5">{selectedProduct.gst}%</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 font-medium">Stock Status</span>
                <p className={`font-bold mt-0.5 ${inStock ? 'text-emerald-700' : 'text-rose-600'}`}>
                  {inStock ? `${selectedProduct.quantity} Available` : 'Out of Stock'}
                </p>
              </div>
            </div>

            {/* Highlights */}
            <div className="flex flex-wrap gap-4 text-xs text-slate-600 pt-2 border-t border-slate-100">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>GST Tax Invoice Provided</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-indigo-600" />
                <span>Doorstep Delivery Available</span>
              </div>
            </div>

            {/* Sticky Action Footer */}
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs text-slate-400 font-medium">Total (incl. {selectedProduct.gst}% GST):</span>
                <p className="text-2xl font-extrabold text-slate-900 font-heading">
                  ₹{totalWithTax.toFixed(2)}
                </p>
              </div>

              <button
                onClick={handleBuyNow}
                disabled={!inStock}
                id="product-detail-buy-now-btn"
                className="py-3.5 px-8 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold rounded-2xl text-sm shadow-md shadow-emerald-200 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>BUY NOW</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
