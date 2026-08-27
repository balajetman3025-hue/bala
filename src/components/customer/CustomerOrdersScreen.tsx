import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Header } from '../common/Header';
import { OrderRecord } from '../../types';
import {
  ShoppingBag,
  Package,
  Calendar,
  CreditCard,
  Printer,
  X,
  Store,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import { motion } from 'motion/react';

export const CustomerOrdersScreen: React.FC = () => {
  const { orders, ownerProfile, navigateTo } = useApp();
  const [selectedOrderReceipt, setSelectedOrderReceipt] = useState<OrderRecord | null>(null);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header
        title="My Purchases & Orders"
        subtitle={`${orders.length} past orders`}
        showBack={true}
        onBack={() => navigateTo('customerDashboard')}
        rightAction={
          <button
            onClick={() => navigateTo('customerProducts')}
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Shop Items</span>
          </button>
        }
      />

      <main className="max-w-4xl w-full mx-auto p-4 sm:p-6 space-y-6 flex-1">
        {orders.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4 shadow-xs">
            <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 font-heading">
              No orders placed yet
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              You haven't made any purchases from {ownerProfile.businessName} yet. Browse our catalog to place your first order.
            </p>
            <button
              onClick={() => navigateTo('customerProducts')}
              id="empty-orders-shop-btn"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold transition-colors cursor-pointer"
            >
              <span>Explore Products</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs hover:shadow-md transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-4 min-w-0">
                  <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center overflow-hidden shrink-0">
                    {order.product.image ? (
                      <img
                        src={order.product.image}
                        alt={order.product.productName}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Package className="w-6 h-6 text-emerald-600" />
                    )}
                  </div>

                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                        {order.orderNumber}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                        <CheckCircle2 className="w-3 h-3" /> {order.paymentStatus}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 font-heading leading-snug">
                      {order.quantity}x {order.product.productName}
                    </h3>

                    <p className="text-xs text-slate-500 flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{order.orderDate} at {order.orderTime}</span>
                      <span>•</span>
                      <span>{order.paymentMethod}</span>
                    </p>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <div className="text-left sm:text-right">
                    <span className="text-[11px] text-slate-400 font-medium">Total Paid:</span>
                    <p className="text-lg font-extrabold text-slate-900 font-heading">
                      ₹{order.finalAmount.toFixed(2)}
                    </p>
                  </div>

                  <button
                    onClick={() => setSelectedOrderReceipt(order)}
                    id={`view-order-receipt-${order.id}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>View Receipt</span>
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* RECEIPT MODAL */}
      {selectedOrderReceipt && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6 my-8 print:p-0 print:shadow-none print:max-w-none">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 print:hidden">
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
                PURCHASE RECEIPT
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Receipt</span>
                </button>
                <button
                  onClick={() => setSelectedOrderReceipt(null)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="text-center pb-4 border-b border-slate-200">
              <h2 className="text-xl font-extrabold font-heading text-slate-900">
                {ownerProfile.businessName}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">{ownerProfile.address}</p>
              <p className="text-xs text-slate-600 mt-1 font-mono">
                GSTIN: {ownerProfile.gstNumber || '09AAECR1234F1Z8'} • Phone: {ownerProfile.mobile}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
              <div>
                <p className="text-slate-400">Order Ref:</p>
                <p className="font-mono font-bold text-slate-900 text-sm mt-0.5">
                  {selectedOrderReceipt.orderNumber}
                </p>
                <p className="text-slate-600">{selectedOrderReceipt.customerName}</p>
              </div>
              <div className="text-right">
                <p className="text-slate-400">Date & Time:</p>
                <p className="text-slate-900 font-medium mt-0.5">
                  {selectedOrderReceipt.orderDate}
                </p>
                <p className="text-emerald-700 font-bold">
                  {selectedOrderReceipt.paymentStatus} via {selectedOrderReceipt.paymentMethod}
                </p>
              </div>
            </div>

            <div className="border border-slate-200 rounded-2xl overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-2.5">Item</th>
                    <th className="p-2.5 text-center">Qty</th>
                    <th className="p-2.5 text-right">Price</th>
                    <th className="p-2.5 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-2.5 font-medium text-slate-900">
                      {selectedOrderReceipt.product.productName}
                    </td>
                    <td className="p-2.5 text-center font-bold">{selectedOrderReceipt.quantity}</td>
                    <td className="p-2.5 text-right">₹{selectedOrderReceipt.product.sellingPrice}</td>
                    <td className="p-2.5 text-right font-bold">₹{selectedOrderReceipt.totalAmount.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="space-y-1.5 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span>₹{selectedOrderReceipt.totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>GST Tax ({selectedOrderReceipt.product.gst}%):</span>
                <span>₹{selectedOrderReceipt.gstAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-base font-extrabold text-slate-900 pt-2 border-t border-slate-200 font-heading">
                <span>Grand Total Paid:</span>
                <span className="text-emerald-700">₹{selectedOrderReceipt.finalAmount.toFixed(2)}</span>
              </div>
            </div>

            <div className="text-center text-[11px] text-slate-400">
              Thank you for supporting {ownerProfile.businessName}!
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
