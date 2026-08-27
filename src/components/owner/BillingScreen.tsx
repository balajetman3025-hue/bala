import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Header } from '../common/Header';
import { Bill, BillItem, Product } from '../../types';
import {
  Receipt,
  Plus,
  Search,
  Calendar,
  User,
  Phone,
  CreditCard,
  Printer,
  Trash2,
  CheckCircle2,
  X,
  Store,
  Building,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const BillingScreen: React.FC = () => {
  const {
    bills,
    products,
    customers,
    ownerProfile,
    saveBill,
    deleteBill,
    navigateTo,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Bill | null>(null);

  // New Bill Form State
  const [customerName, setCustomerName] = useState('');
  const [customerMobile, setCustomerMobile] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [paymentMode, setPaymentMode] = useState<
    'Cash' | 'UPI' | 'Card' | 'Credit / Debit Card' | 'Cash on Delivery' | 'Net Banking'
  >('Cash');
  const [billItems, setBillItems] = useState<
    { product: Product; quantity: number }[]
  >([]);
  const [selectedProductId, setSelectedProductId] = useState<number>(
    products[0]?.id || 0
  );
  const [itemQuantity, setItemQuantity] = useState<number>(1);
  const [formError, setFormError] = useState('');

  const filteredBills = bills.filter(
    (b) =>
      b.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.customerMobile.includes(searchTerm)
  );

  const handleSelectExistingCustomer = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const custId = parseInt(e.target.value, 10);
    const found = customers.find((c) => c.id === custId);
    if (found) {
      setCustomerName(found.name);
      setCustomerMobile(found.mobile);
      setCustomerAddress(found.address);
    }
  };

  const handleAddItem = () => {
    const prod = products.find((p) => p.id === selectedProductId);
    if (!prod) return;

    if (itemQuantity <= 0) {
      setFormError('Quantity must be at least 1.');
      return;
    }

    if (itemQuantity > prod.quantity) {
      setFormError(`Only ${prod.quantity} units available in stock for ${prod.productName}.`);
      return;
    }

    setFormError('');
    setBillItems((prev) => {
      const existing = prev.find((item) => item.product.id === prod.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === prod.id
            ? { ...item, quantity: item.quantity + itemQuantity }
            : item
        );
      }
      return [...prev, { product: prod, quantity: itemQuantity }];
    });

    setItemQuantity(1);
  };

  const handleRemoveItem = (productId: number) => {
    setBillItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  // Calculations
  const calculatedSubtotal = billItems.reduce(
    (sum, item) => sum + item.product.sellingPrice * item.quantity,
    0
  );
  const calculatedGst = billItems.reduce(
    (sum, item) =>
      sum + (item.product.sellingPrice * item.quantity * item.product.gst) / 100,
    0
  );
  const calculatedGrandTotal = calculatedSubtotal + calculatedGst;

  const handleGenerateBill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerMobile.trim()) {
      setFormError('Please enter customer name and mobile number.');
      return;
    }
    if (billItems.length === 0) {
      setFormError('Please add at least one product item to the invoice.');
      return;
    }

    const now = new Date();
    const formattedItems: BillItem[] = billItems.map((item, idx) => ({
      id: idx + 1,
      productId: item.product.id,
      productName: item.product.productName,
      quantity: item.quantity,
      price: item.product.sellingPrice,
      gstPercent: item.product.gst,
      total: item.product.sellingPrice * item.quantity,
    }));

    const newBill = saveBill({
      customerName,
      customerMobile,
      customerAddress: customerAddress || 'Counter Sale',
      date: now.toISOString().split('T')[0],
      time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      subTotal: calculatedSubtotal,
      gstAmount: calculatedGst,
      grandTotal: calculatedGrandTotal,
      paymentMode,
      items: formattedItems,
    });

    // Reset Form
    setCustomerName('');
    setCustomerMobile('');
    setCustomerAddress('');
    setBillItems([]);
    setFormError('');
    setShowCreateModal(false);
    setSelectedInvoice(newBill);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header
        title="Billing & Invoices"
        subtitle={`${bills.length} generated invoices`}
        showBack={true}
        onBack={() => navigateTo('ownerDashboard')}
        rightAction={
          <button
            onClick={() => setShowCreateModal(true)}
            id="billing-create-new-bill-btn"
            className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs shadow-indigo-200 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Bill</span>
          </button>
        }
      />

      <main className="max-w-5xl w-full mx-auto p-4 sm:p-6 space-y-6 flex-1">
        {/* Search Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              id="billing-search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by invoice #, customer name or phone..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
            />
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="w-full sm:w-auto px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Receipt className="w-4 h-4" />
            <span>Instant Counter POS</span>
          </button>
        </div>

        {/* Invoice List */}
        {filteredBills.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 mx-auto flex items-center justify-center">
              <Receipt className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 font-heading">
              No bills recorded yet
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Create your first GST invoice for walk-in customers or online orders.
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Bill</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnimatePresence>
              {filteredBills.map((bill) => (
                <motion.div
                  key={bill.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                          {bill.invoiceNumber}
                        </span>
                        <h3 className="text-base font-bold text-slate-900 font-heading mt-1">
                          {bill.customerName}
                        </h3>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-extrabold text-slate-900 font-heading">
                          ₹{bill.grandTotal.toFixed(2)}
                        </p>
                        <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                          {bill.paymentMode}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <div className="flex items-center gap-1.5 truncate">
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{bill.customerMobile}</span>
                      </div>
                      <div className="flex items-center gap-1.5 truncate">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{bill.date} • {bill.time}</span>
                      </div>
                      <div>
                        <strong>Subtotal:</strong> ₹{bill.subTotal.toFixed(2)}
                      </div>
                      <div>
                        <strong>GST Tax:</strong> ₹{bill.gstAmount.toFixed(2)}
                      </div>
                    </div>

                    {bill.items && bill.items.length > 0 && (
                      <div className="text-xs text-slate-600">
                        <p className="font-semibold text-slate-400 uppercase text-[10px] tracking-wider mb-1">
                          Items ({bill.items.length}):
                        </p>
                        <div className="space-y-0.5">
                          {bill.items.slice(0, 2).map((item, idx) => (
                            <p key={idx} className="truncate text-slate-600">
                              • {item.quantity}x {item.productName} (₹{item.price})
                            </p>
                          ))}
                          {bill.items.length > 2 && (
                            <p className="text-indigo-600 font-medium text-[11px]">
                              +{bill.items.length - 2} more items...
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-4 mt-3 border-t border-slate-100">
                    <button
                      onClick={() => setSelectedInvoice(bill)}
                      id={`view-invoice-btn-${bill.id}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition-colors cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>View Tax Invoice</span>
                    </button>
                    <button
                      onClick={() => deleteBill(bill.id)}
                      id={`delete-invoice-btn-${bill.id}`}
                      className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Delete Invoice"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>

      {/* CREATE NEW BILL MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 font-heading">
                    Create New GST Invoice
                  </h3>
                  <p className="text-xs text-slate-500">
                    Quick Billing & POS for {ownerProfile.businessName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-medium">
                {formError}
              </div>
            )}

            <form onSubmit={handleGenerateBill} className="space-y-4">
              {/* Customer Information */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Customer Information
                  </h4>
                  {customers.length > 0 && (
                    <select
                      onChange={handleSelectExistingCustomer}
                      defaultValue=""
                      className="text-xs text-indigo-600 font-semibold bg-indigo-50 px-2 py-1 rounded-lg border border-indigo-200"
                    >
                      <option value="" disabled>
                        Choose Existing Customer
                      </option>
                      {customers.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.mobile})
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <input
                      type="text"
                      id="bill-customer-name"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Customer Name *"
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <input
                      type="tel"
                      id="bill-customer-mobile"
                      value={customerMobile}
                      onChange={(e) => setCustomerMobile(e.target.value)}
                      placeholder="Mobile Number *"
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      required
                    />
                  </div>
                </div>

                <input
                  type="text"
                  id="bill-customer-address"
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  placeholder="Billing / Delivery Address (Optional)"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              {/* Add Product Items to Bill */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Add Products
                </h4>

                <div className="flex flex-col sm:flex-row items-center gap-2">
                  <div className="flex-1 w-full">
                    <select
                      id="bill-select-product"
                      value={selectedProductId}
                      onChange={(e) => setSelectedProductId(parseInt(e.target.value, 10))}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    >
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.productName} — ₹{p.sellingPrice} (GST {p.gst}%, Stock: {p.quantity})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <input
                      type="number"
                      min="1"
                      id="bill-item-qty"
                      value={itemQuantity}
                      onChange={(e) => setItemQuantity(parseInt(e.target.value, 10) || 1)}
                      className="w-20 px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm text-center focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      placeholder="Qty"
                    />

                    <button
                      type="button"
                      onClick={handleAddItem}
                      id="bill-add-item-btn"
                      className="flex-1 sm:flex-none px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Item</span>
                    </button>
                  </div>
                </div>

                {/* Added Items Table */}
                {billItems.length > 0 && (
                  <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                        <tr>
                          <th className="p-2.5">Item</th>
                          <th className="p-2.5 text-center">Qty</th>
                          <th className="p-2.5 text-right">Price</th>
                          <th className="p-2.5 text-right">GST</th>
                          <th className="p-2.5 text-right">Total</th>
                          <th className="p-2.5 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {billItems.map((item) => {
                          const itemSubtotal = item.product.sellingPrice * item.quantity;
                          const itemGst = (itemSubtotal * item.product.gst) / 100;
                          return (
                            <tr key={item.product.id}>
                              <td className="p-2.5 font-medium text-slate-900 truncate max-w-[150px]">
                                {item.product.productName}
                              </td>
                              <td className="p-2.5 text-center font-bold">{item.quantity}</td>
                              <td className="p-2.5 text-right">₹{item.product.sellingPrice}</td>
                              <td className="p-2.5 text-right text-slate-500">
                                {item.product.gst}% (₹{itemGst.toFixed(2)})
                              </td>
                              <td className="p-2.5 text-right font-bold text-slate-900">
                                ₹{(itemSubtotal + itemGst).toFixed(2)}
                              </td>
                              <td className="p-2.5 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveItem(item.product.id)}
                                  className="text-rose-500 hover:text-rose-700 p-1"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Payment Mode & Total Breakdown */}
              <div className="pt-3 border-t border-slate-100 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Payment Mode
                    </label>
                    <select
                      value={paymentMode}
                      onChange={(e) => setPaymentMode(e.target.value as any)}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    >
                      <option value="Cash">Cash</option>
                      <option value="UPI">UPI (Google Pay / PhonePe / Paytm)</option>
                      <option value="Card">Credit / Debit Card</option>
                      <option value="Net Banking">Net Banking</option>
                    </select>
                  </div>

                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1 text-xs">
                    <div className="flex justify-between text-slate-600">
                      <span>Subtotal:</span>
                      <span>₹{calculatedSubtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>GST Amount:</span>
                      <span>₹{calculatedGst.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-base font-bold text-slate-900 pt-1 border-t border-slate-200 font-heading">
                      <span>Grand Total:</span>
                      <span className="text-indigo-600">₹{calculatedGrandTotal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-2.5 px-4 border border-slate-300 text-slate-700 font-semibold rounded-xl text-xs hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="submit-generate-bill-btn"
                  className="flex-2 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-md shadow-indigo-200 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Generate & Save GST Invoice</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRINTABLE GST INVOICE MODAL */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 sm:p-8 shadow-2xl space-y-6 my-8 max-h-[90vh] overflow-y-auto print:p-0 print:shadow-none print:max-w-none">
            {/* Action Bar */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 print:hidden">
              <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">
                TAX INVOICE
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  id="print-invoice-action-btn"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Receipt</span>
                </button>
                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Receipt Body */}
            <div className="space-y-6 text-slate-900 font-sans">
              {/* Header */}
              <div className="text-center pb-4 border-b border-slate-200">
                <h2 className="text-2xl font-extrabold font-heading text-slate-900">
                  {ownerProfile.businessName || 'MERIDUKAN SUPER STORE'}
                </h2>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                  {ownerProfile.address}
                </p>
                <div className="flex items-center justify-center gap-4 text-xs text-slate-600 mt-2 flex-wrap">
                  <span><strong>GSTIN:</strong> {ownerProfile.gstNumber || '09AAECR1234F1Z8'}</span>
                  <span><strong>Phone:</strong> {ownerProfile.mobile}</span>
                  {ownerProfile.email && <span><strong>Email:</strong> {ownerProfile.email}</span>}
                </div>
              </div>

              {/* Invoice Meta */}
              <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <div>
                  <p className="text-slate-500">Billed To:</p>
                  <p className="font-bold text-slate-900 text-sm mt-0.5">
                    {selectedInvoice.customerName}
                  </p>
                  <p className="text-slate-600">{selectedInvoice.customerMobile}</p>
                  {selectedInvoice.customerAddress && (
                    <p className="text-slate-500 text-[11px] mt-0.5">{selectedInvoice.customerAddress}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-slate-500">Invoice Details:</p>
                  <p className="font-mono font-bold text-indigo-600 text-sm mt-0.5">
                    {selectedInvoice.invoiceNumber}
                  </p>
                  <p className="text-slate-600">
                    {selectedInvoice.date} • {selectedInvoice.time}
                  </p>
                  <p className="text-slate-500">
                    Payment: <strong>{selectedInvoice.paymentMode}</strong>
                  </p>
                </div>
              </div>

              {/* Items Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-2.5">#</th>
                      <th className="p-2.5">Item Description</th>
                      <th className="p-2.5 text-center">Qty</th>
                      <th className="p-2.5 text-right">Rate</th>
                      <th className="p-2.5 text-right">GST %</th>
                      <th className="p-2.5 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedInvoice.items && selectedInvoice.items.length > 0 ? (
                      selectedInvoice.items.map((item, idx) => (
                        <tr key={idx}>
                          <td className="p-2.5 text-slate-400">{idx + 1}</td>
                          <td className="p-2.5 font-medium text-slate-900">{item.productName}</td>
                          <td className="p-2.5 text-center font-bold">{item.quantity}</td>
                          <td className="p-2.5 text-right">₹{item.price.toFixed(2)}</td>
                          <td className="p-2.5 text-right">{item.gstPercent}%</td>
                          <td className="p-2.5 text-right font-bold">
                            ₹{(item.price * item.quantity).toFixed(2)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="p-4 text-center text-slate-400">
                          Single Transaction Sale
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Total Calculation Card */}
              <div className="flex justify-end">
                <div className="w-64 space-y-1.5 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="flex justify-between text-slate-600">
                    <span>Taxable Subtotal:</span>
                    <span>₹{selectedInvoice.subTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>CGST:</span>
                    <span>₹{(selectedInvoice.gstAmount / 2).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>SGST:</span>
                    <span>₹{(selectedInvoice.gstAmount / 2).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-base font-extrabold text-slate-900 pt-2 border-t border-slate-200 font-heading">
                    <span>Grand Total:</span>
                    <span className="text-indigo-600">₹{selectedInvoice.grandTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* UPI & Payment info */}
              {ownerProfile.upi && (
                <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-indigo-900">UPI Payment Accepted:</p>
                    <p className="text-indigo-700 font-mono text-[11px]">{ownerProfile.upi}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-slate-500 text-[10px]">Bank: {ownerProfile.ifsc || 'HDFC'}</p>
                    <p className="text-slate-600 font-mono text-[11px]">A/C: ••••{ownerProfile.bankAccount?.slice(-4) || '7890'}</p>
                  </div>
                </div>
              )}

              {/* Footer Notice */}
              <div className="text-center pt-2 border-t border-slate-100 text-[11px] text-slate-400 space-y-0.5">
                <p>Thank you for shopping with {ownerProfile.businessName}!</p>
                <p>This is a computer generated invoice and requires no signature.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
