import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Header } from '../common/Header';
import { OrderRecord } from '../../types';
import {
  CreditCard,
  Banknote,
  QrCode,
  Building,
  CheckCircle2,
  Truck,
  Download,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Lock,
} from 'lucide-react';
import { motion } from 'motion/react';

export const PaymentScreen: React.FC = () => {
  const {
    selectedProduct,
    orderQuantity,
    placeOrder,
    ownerProfile,
    customerProfile,
    navigateTo,
    goBack,
  } = useApp();

  const [paymentMethod, setPaymentMethod] = useState<
    'UPI' | 'Cash on Delivery' | 'Credit / Debit Card' | 'Net Banking'
  >('UPI');
  const [upiIdInput, setUpiIdInput] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<OrderRecord | null>(null);

  if (!selectedProduct && !completedOrder) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
        <p className="text-sm text-slate-500 mb-4">No active order to pay for</p>
        <button
          onClick={() => navigateTo('customerProducts')}
          className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold"
        >
          Return to Products
        </button>
      </div>
    );
  }

  const subTotal = selectedProduct ? selectedProduct.sellingPrice * orderQuantity : 0;
  const gstAmount = selectedProduct ? (subTotal * selectedProduct.gst) / 100 : 0;
  const finalPayable = subTotal + gstAmount;

  const handlePayNow = () => {
    setIsProcessing(true);
    setTimeout(() => {
      try {
        const order = placeOrder(paymentMethod);
        setCompletedOrder(order);
      } catch (err) {
        console.error(err);
      } finally {
        setIsProcessing(false);
      }
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header
        title={completedOrder ? 'Order Confirmation' : 'Payment Gateway'}
        subtitle={
          completedOrder
            ? `Order #${completedOrder.orderNumber}`
            : `Payable: ₹${finalPayable.toFixed(2)}`
        }
        showBack={!completedOrder}
        onBack={goBack}
      />

      <main className="max-w-2xl w-full mx-auto p-4 sm:p-6 space-y-6 flex-1">
        {completedOrder ? (
          /* SUCCESS CONFIRMATION VIEW */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-md text-center space-y-6"
          >
            <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-wider">
                Payment & Order Confirmed
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading mt-2">
                Thank You for Your Order!
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-md mx-auto">
                Your order has been forwarded to{' '}
                <strong>{ownerProfile.businessName}</strong>. A receipt has been generated.
              </p>
            </div>

            {/* Receipt Box */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 text-xs text-left space-y-3 font-sans">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div>
                  <p className="text-slate-400">Order Number</p>
                  <p className="font-mono font-bold text-slate-900 text-sm">
                    {completedOrder.orderNumber}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-slate-400">Payment Status</p>
                  <p className="font-bold text-emerald-600">
                    {completedOrder.paymentStatus} ({completedOrder.paymentMethod})
                  </p>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-600">Product:</span>
                  <span className="font-bold text-slate-900">
                    {completedOrder.quantity}x {completedOrder.product.productName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Merchant Store:</span>
                  <span className="text-slate-900 font-medium">{ownerProfile.businessName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Delivery To:</span>
                  <span className="text-slate-900 font-medium truncate max-w-[200px]">
                    {completedOrder.customerAddress || 'Direct Store Delivery'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Ordered On:</span>
                  <span className="text-slate-900">
                    {completedOrder.orderDate} at {completedOrder.orderTime}
                  </span>
                </div>
                <div className="flex justify-between text-base font-extrabold text-slate-900 pt-2 border-t border-slate-200 font-heading">
                  <span>Total Paid:</span>
                  <span className="text-emerald-700">₹{completedOrder.finalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                onClick={() => navigateTo('customerOrders')}
                className="w-full sm:flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl text-xs shadow-md transition-colors cursor-pointer"
              >
                View in My Orders
              </button>
              <button
                onClick={() => navigateTo('customerProducts')}
                className="w-full sm:flex-1 py-3 px-4 border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold rounded-2xl text-xs transition-colors cursor-pointer"
              >
                Continue Shopping
              </button>
            </div>
          </motion.div>
        ) : (
          /* PAYMENT METHOD FORM */
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900 font-heading">
                  Select Payment Method
                </h3>
                <p className="text-xs text-slate-500">
                  All transactions are 100% encrypted & verified
                </p>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-slate-400 font-medium">Payable Amount:</span>
                <p className="text-xl font-extrabold text-emerald-700 font-heading">
                  ₹{finalPayable.toFixed(2)}
                </p>
              </div>
            </div>

            {/* Payment Options */}
            <div className="space-y-3">
              {/* UPI Option */}
              <label
                className={`flex items-start gap-3.5 p-4 rounded-2xl border transition-all cursor-pointer ${
                  paymentMethod === 'UPI'
                    ? 'border-emerald-500 bg-emerald-50/50 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMode"
                  checked={paymentMethod === 'UPI'}
                  onChange={() => setPaymentMethod('UPI')}
                  className="mt-1 text-emerald-600 focus:ring-emerald-500"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-900">
                      UPI (Instant 0% Fee)
                    </span>
                    <QrCode className="w-5 h-5 text-emerald-600" />
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Google Pay, PhonePe, Paytm, BHIM or Merchant UPI ID
                  </p>

                  {paymentMethod === 'UPI' && (
                    <div className="mt-3 p-3 bg-white rounded-xl border border-emerald-200 space-y-2">
                      <p className="text-[11px] font-semibold text-slate-600">
                        Merchant Store VPA: <span className="font-mono text-indigo-700">{ownerProfile.upi || 'meridukan@okhdfcbank'}</span>
                      </p>
                      <input
                        type="text"
                        placeholder="Enter your UPI ID (e.g. name@okhdfcbank)"
                        value={upiIdInput}
                        onChange={(e) => setUpiIdInput(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                      />
                    </div>
                  )}
                </div>
              </label>

              {/* Cash on Delivery (COD) */}
              <label
                className={`flex items-start gap-3.5 p-4 rounded-2xl border transition-all cursor-pointer ${
                  paymentMethod === 'Cash on Delivery'
                    ? 'border-emerald-500 bg-emerald-50/50 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMode"
                  checked={paymentMethod === 'Cash on Delivery'}
                  onChange={() => setPaymentMethod('Cash on Delivery')}
                  className="mt-1 text-emerald-600 focus:ring-emerald-500"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-900">
                      Cash on Delivery (COD)
                    </span>
                    <Banknote className="w-5 h-5 text-emerald-600" />
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Pay with physical cash upon arrival at your doorstep
                  </p>
                </div>
              </label>

              {/* Credit / Debit Card */}
              <label
                className={`flex items-start gap-3.5 p-4 rounded-2xl border transition-all cursor-pointer ${
                  paymentMethod === 'Credit / Debit Card'
                    ? 'border-emerald-500 bg-emerald-50/50 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMode"
                  checked={paymentMethod === 'Credit / Debit Card'}
                  onChange={() => setPaymentMethod('Credit / Debit Card')}
                  className="mt-1 text-emerald-600 focus:ring-emerald-500"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-900">
                      Credit / Debit Card
                    </span>
                    <CreditCard className="w-5 h-5 text-emerald-600" />
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Visa, Mastercard, RuPay, Maestro
                  </p>

                  {paymentMethod === 'Credit / Debit Card' && (
                    <div className="mt-3 p-3.5 bg-white rounded-xl border border-emerald-200 space-y-2.5">
                      <input
                        type="text"
                        placeholder="16-digit Card Number (4532 •••• •••• ••••)"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          placeholder="MM/YY"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-center"
                        />
                        <input
                          type="password"
                          placeholder="CVV (3 digits)"
                          maxLength={4}
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                          className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-center font-mono"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </label>

              {/* Net Banking */}
              <label
                className={`flex items-start gap-3.5 p-4 rounded-2xl border transition-all cursor-pointer ${
                  paymentMethod === 'Net Banking'
                    ? 'border-emerald-500 bg-emerald-50/50 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMode"
                  checked={paymentMethod === 'Net Banking'}
                  onChange={() => setPaymentMethod('Net Banking')}
                  className="mt-1 text-emerald-600 focus:ring-emerald-500"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-900">
                      Net Banking
                    </span>
                    <Building className="w-5 h-5 text-emerald-600" />
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    HDFC, SBI, ICICI, Axis, PNB and 50+ other Indian banks
                  </p>

                  {paymentMethod === 'Net Banking' && (
                    <div className="mt-3 p-3 bg-white rounded-xl border border-emerald-200">
                      <select
                        value={selectedBank}
                        onChange={(e) => setSelectedBank(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                      >
                        <option value="HDFC Bank">HDFC Bank</option>
                        <option value="State Bank of India (SBI)">State Bank of India (SBI)</option>
                        <option value="ICICI Bank">ICICI Bank</option>
                        <option value="Axis Bank">Axis Bank</option>
                        <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
                        <option value="Punjab National Bank">Punjab National Bank</option>
                      </select>
                    </div>
                  )}
                </div>
              </label>
            </div>

            {/* Security Notice */}
            <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-100">
              <Lock className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>256-Bit SSL Protected • Safe and Secure Checkout</span>
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={goBack}
                disabled={isProcessing}
                className="flex-1 py-3 px-4 border border-slate-300 text-slate-700 font-bold rounded-2xl text-xs hover:bg-slate-100 transition-colors"
              >
                Back
              </button>

              <button
                type="button"
                onClick={handlePayNow}
                disabled={isProcessing}
                id="submit-payment-btn"
                className="flex-2 py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-bold rounded-2xl text-xs shadow-md shadow-emerald-200 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isProcessing ? (
                  <span>Authorizing Payment...</span>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Pay ₹{finalPayable.toFixed(2)} & Place Order</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
