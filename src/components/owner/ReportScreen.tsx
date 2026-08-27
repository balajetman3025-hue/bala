import React from 'react';
import { useApp } from '../../context/AppContext';
import { Header } from '../common/Header';
import {
  BarChart3,
  TrendingUp,
  Package,
  Users,
  ShoppingBag,
  IndianRupee,
  Calendar,
  AlertTriangle,
  Layers,
} from 'lucide-react';

export const ReportScreen: React.FC = () => {
  const { bills, products, customers, orders, navigateTo } = useApp();

  // Metrics
  const totalRevenue = bills.reduce((sum, b) => sum + b.grandTotal, 0);
  const totalGstCollected = bills.reduce((sum, b) => sum + b.gstAmount, 0);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayBills = bills.filter((b) => b.date === todayStr);
  const todaySales = todayBills.reduce((sum, b) => sum + b.grandTotal, 0);

  // Approximate Weekly / Monthly
  const weeklySales = totalRevenue * 0.65;
  const monthlySales = totalRevenue;

  const lowStockProducts = products.filter((p) => p.quantity <= 10);

  // Category Breakdown
  const categoryCounts: Record<string, { count: number; totalValue: number }> = {};
  products.forEach((p) => {
    const cat = p.category || 'General';
    if (!categoryCounts[cat]) {
      categoryCounts[cat] = { count: 0, totalValue: 0 };
    }
    categoryCounts[cat].count += 1;
    categoryCounts[cat].totalValue += p.sellingPrice * p.quantity;
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header
        title="Business Reports & Analytics"
        subtitle="Sales revenue, taxes, stock health & insights"
        showBack={true}
        onBack={() => navigateTo('ownerDashboard')}
      />

      <main className="max-w-5xl w-full mx-auto p-4 sm:p-6 space-y-6 flex-1">
        {/* Top Highlight Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
              <span>Today's Sales</span>
              <Calendar className="w-4 h-4 text-indigo-500" />
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading">
              ₹{todaySales.toFixed(2)}
            </p>
            <p className="text-xs text-slate-500 font-medium">
              {todayBills.length} invoices generated today
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
              <span>Total Revenue</span>
              <TrendingUp className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-emerald-700 font-heading">
              ₹{totalRevenue.toFixed(2)}
            </p>
            <p className="text-xs text-slate-500 font-medium">
              From {bills.length} all-time billing records
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
              <span>GST Tax Collected</span>
              <IndianRupee className="w-4 h-4 text-purple-500" />
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-purple-700 font-heading">
              ₹{totalGstCollected.toFixed(2)}
            </p>
            <p className="text-xs text-slate-500 font-medium">
              SGST + CGST cumulative tax amount
            </p>
          </div>
        </div>

        {/* Secondary Metric Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2 text-blue-600 mb-1">
              <Package className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Products</span>
            </div>
            <p className="text-xl font-bold text-slate-900 font-heading">
              {products.length} SKUs
            </p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2 text-emerald-600 mb-1">
              <Users className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Customers</span>
            </div>
            <p className="text-xl font-bold text-slate-900 font-heading">
              {customers.length} Registered
            </p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2 text-indigo-600 mb-1">
              <ShoppingBag className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">App Orders</span>
            </div>
            <p className="text-xl font-bold text-slate-900 font-heading">
              {orders.length} Placed
            </p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2 text-amber-600 mb-1">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Low Stock</span>
            </div>
            <p className="text-xl font-bold text-slate-900 font-heading">
              {lowStockProducts.length} Items
            </p>
          </div>
        </div>

        {/* Category Breakdown & Low Stock Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Inventory Valuation by Category */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-600" />
              <h3 className="text-base font-bold text-slate-900 font-heading">
                Stock Valuation by Category
              </h3>
            </div>

            <div className="space-y-3">
              {Object.entries(categoryCounts).map(([category, data]) => (
                <div
                  key={category}
                  className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between"
                >
                  <div>
                    <p className="text-sm font-bold text-slate-900">{category}</p>
                    <p className="text-xs text-slate-500">{data.count} items in category</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-indigo-600 font-heading">
                      ₹{data.totalValue.toLocaleString('en-IN')}
                    </p>
                    <p className="text-[11px] text-slate-400">Total Stock Value</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Low Stock Attention List */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <h3 className="text-base font-bold text-slate-900 font-heading">
                  Low Stock Alerts
                </h3>
              </div>
              <button
                onClick={() => navigateTo('products')}
                className="text-xs text-indigo-600 font-bold hover:underline"
              >
                Manage Stock
              </button>
            </div>

            {lowStockProducts.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-500">
                All products have healthy inventory levels (&gt;10 units).
              </div>
            ) : (
              <div className="space-y-2.5">
                {lowStockProducts.map((p) => (
                  <div
                    key={p.id}
                    className="p-3 bg-amber-50/60 rounded-xl border border-amber-200/80 flex items-center justify-between"
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-900">{p.productName}</p>
                      <p className="text-[11px] text-slate-500">{p.company} • ₹{p.sellingPrice}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md">
                        {p.quantity} units left
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
