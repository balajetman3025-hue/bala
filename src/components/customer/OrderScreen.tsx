import React from 'react';
import { useApp } from '../../context/AppContext';
import { Header } from '../common/Header';
import {
  Package,
  Plus,
  Minus,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  Building,
  Tag,
} from 'lucide-react';

export const OrderScreen: React.FC = () => {
  const {
    selectedProduct,
    orderQuantity,
    updateOrderQuantity,
    navigateTo,
    goBack,
    customerProfile,
  } = useApp();

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

  const subTotal = selectedProduct.sellingPrice * orderQuantity;
  const gstAmount = (subTotal * selectedProduct.gst) / 100;
  const finalPayable = subTotal + gstAmount;

  const handleIncrement = () => {
    if (orderQuantity < selectedProduct.quantity) {
      updateOrderQuantity(orderQuantity + 1);
    }
  };

  const handleDecrement = () => {
    if (orderQuantity > 1) {
      updateOrderQuantity(orderQuantity - 1);
    }
  };

  const handleProceed = () => {
    navigateTo('payment');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header
        title="Review Your Order"
        subtitle="Specify quantity & verify tax breakdown"
        showBack={true}
        onBack={goBack}
      />

      <main className="max-w-2xl w-full mx-auto p-4 sm:p-6 space-y-6 flex-1">
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
          {/* Product Summary */}
          <div className="flex items-start gap-4 pb-6 border-b border-slate-100">
            <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center overflow-hidden shrink-0">
              {selectedProduct.image ? (
                <img
                  src={selectedProduct.image}
                  alt={selectedProduct.productName}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              ) : (
                <Package className="w-10 h-10 text-emerald-600" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                {selectedProduct.company}
              </span>
              <h3 className="text-base font-bold text-slate-900 font-heading leading-snug">
                {selectedProduct.productName}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Category: <strong>{selectedProduct.category}</strong> • Base: <strong>₹{selectedProduct.sellingPrice}</strong>
              </p>
            </div>
          </div>

          {/* Quantity Selector */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Select Order Quantity
              </h4>
              <p className="text-xs text-slate-500">
                {selectedProduct.quantity} units currently in shop stock
              </p>
            </div>

            <div className="flex items-center gap-3 self-start sm:self-auto">
              <button
                type="button"
                onClick={handleDecrement}
                disabled={orderQuantity <= 1}
                id="order-qty-decrement"
                className="w-10 h-10 rounded-xl bg-white border border-slate-300 text-slate-700 disabled:opacity-40 font-bold flex items-center justify-center hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <Minus className="w-4 h-4" />
              </button>

              <span className="w-12 text-center font-bold text-lg text-slate-900 font-heading">
                {orderQuantity}
              </span>

              <button
                type="button"
                onClick={handleIncrement}
                disabled={orderQuantity >= selectedProduct.quantity}
                id="order-qty-increment"
                className="w-10 h-10 rounded-xl bg-white border border-slate-300 text-slate-700 disabled:opacity-40 font-bold flex items-center justify-center hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Delivery Details */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Shipping & Delivery Details
            </h4>
            <div className="text-xs text-slate-600 space-y-1">
              <p>
                <strong>Recipient:</strong> {customerProfile.customerName} ({customerProfile.mobile})
              </p>
              <p>
                <strong>Address:</strong> {customerProfile.address || 'Local Pick-up / Standard Delivery'}
              </p>
            </div>
          </div>

          {/* Bill Calculation Matrix */}
          <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5 text-xs">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Price Breakdown
            </h4>

            <div className="flex justify-between text-slate-600">
              <span>Item Price (₹{selectedProduct.sellingPrice} x {orderQuantity}):</span>
              <span>₹{subTotal.toFixed(2)}</span>
            </div>

            <div className="flex justify-between text-slate-600">
              <span>GST Tax ({selectedProduct.gst}%):</span>
              <span>₹{gstAmount.toFixed(2)}</span>
            </div>

            <div className="flex justify-between text-slate-600">
              <span>Delivery Charge:</span>
              <span className="text-emerald-600 font-bold">FREE</span>
            </div>

            <div className="flex justify-between text-base font-extrabold text-slate-900 pt-3 border-t border-slate-200 font-heading">
              <span>Total Payable:</span>
              <span className="text-emerald-700">₹{finalPayable.toFixed(2)}</span>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={goBack}
              className="flex-1 py-3 px-4 border border-slate-300 text-slate-700 font-bold rounded-2xl text-xs hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleProceed}
              id="order-proceed-payment-btn"
              className="flex-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl text-xs shadow-md shadow-emerald-200 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <CreditCard className="w-4 h-4" />
              <span>Proceed to Payment (₹{finalPayable.toFixed(2)})</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};
