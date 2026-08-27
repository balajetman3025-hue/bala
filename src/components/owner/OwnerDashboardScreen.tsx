import React from 'react';
import { useApp } from '../../context/AppContext';
import { Header } from '../common/Header';
import {
  Package,
  Users,
  UserCheck,
  Receipt,
  BarChart3,
  Settings,
  User,
  LogOut,
  TrendingUp,
  Plus,
  AlertTriangle,
} from 'lucide-react';
import { motion } from 'motion/react';

export const OwnerDashboardScreen: React.FC = () => {
  const {
    ownerProfile,
    products,
    customers,
    employees,
    bills,
    navigateTo,
    logout,
  } = useApp();

  // Calculate today's sales
  const todayStr = new Date().toISOString().split('T')[0];
  const todaySales = bills
    .filter((b) => b.date === todayStr)
    .reduce((sum, b) => sum + b.grandTotal, 0);

  const lowStockCount = products.filter((p) => p.quantity <= 10).length;

  const dashboardItems = [
    {
      title: 'Products',
      description: 'Catalog & Stock',
      count: `${products.length} Items`,
      icon: Package,
      color: 'bg-blue-50 text-blue-600 border-blue-200',
      action: () => navigateTo('products'),
    },
    {
      title: 'Customers',
      description: 'Client Directory',
      count: `${customers.length} Clients`,
      icon: Users,
      color: 'bg-emerald-50 text-emerald-600 border-emerald-200',
      action: () => navigateTo('customers'),
    },
    {
      title: 'Employees',
      description: 'Staff & Roles',
      count: `${employees.length} Staff`,
      icon: UserCheck,
      color: 'bg-amber-50 text-amber-600 border-amber-200',
      action: () => navigateTo('employees'),
    },
    {
      title: 'Billing',
      description: 'Create GST Bill',
      count: `${bills.length} Invoices`,
      icon: Receipt,
      color: 'bg-indigo-50 text-indigo-600 border-indigo-200',
      action: () => navigateTo('billing'),
    },
    {
      title: 'Reports',
      description: 'Analytics & Trends',
      count: 'Sales Insights',
      icon: BarChart3,
      color: 'bg-purple-50 text-purple-600 border-purple-200',
      action: () => navigateTo('reports'),
    },
    {
      title: 'Settings',
      description: 'Backup & Store Info',
      count: 'Configurations',
      icon: Settings,
      color: 'bg-slate-100 text-slate-700 border-slate-200',
      action: () => navigateTo('settings'),
    },
    {
      title: 'Profile',
      description: 'Business Profile',
      count: ownerProfile.ownerName || 'Owner Details',
      icon: User,
      color: 'bg-teal-50 text-teal-600 border-teal-200',
      action: () => navigateTo('ownerProfile'),
    },
    {
      title: 'Logout',
      description: 'Exit Workspace',
      count: 'Switch Account',
      icon: LogOut,
      color: 'bg-rose-50 text-rose-600 border-rose-200',
      action: logout,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header
        title={ownerProfile.businessName || 'MERIDUKAN'}
        subtitle={ownerProfile.address ? `${ownerProfile.address.slice(0, 45)}...` : 'Owner Portal'}
      />

      <main className="max-w-5xl w-full mx-auto p-4 sm:p-6 space-y-6 flex-1">
        {/* Welcome Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading">
              Welcome, {ownerProfile.ownerName || 'Owner'} 👋
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Here is what's happening in your shop today
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigateTo('billing')}
              id="dashboard-quick-bill-btn"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm shadow-indigo-200 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Bill</span>
            </button>
            <button
              onClick={() => navigateTo('addProduct')}
              id="dashboard-quick-product-btn"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 shadow-2xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Product</span>
            </button>
          </div>
        </div>

        {/* Highlight Summary Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Today's Sales Revenue
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-heading">
                  ₹{todaySales.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                  <TrendingUp className="w-3.5 h-3.5" /> Live
                </span>
              </div>
            </div>

            {lowStockCount > 0 && (
              <div className="flex items-center gap-2.5 px-3.5 py-2 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs font-medium">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  <strong>{lowStockCount} items</strong> running low on stock
                </span>
                <button
                  onClick={() => navigateTo('products')}
                  className="font-bold underline ml-1 hover:text-amber-900"
                >
                  View
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-xs text-slate-500 font-medium">Total Products</p>
              <p className="text-xl font-bold text-slate-900 font-heading mt-0.5">
                {products.length}
              </p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-xs text-slate-500 font-medium">Total Customers</p>
              <p className="text-xl font-bold text-slate-900 font-heading mt-0.5">
                {customers.length}
              </p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-xs text-slate-500 font-medium">Active Staff</p>
              <p className="text-xl font-bold text-slate-900 font-heading mt-0.5">
                {employees.length}
              </p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-xs text-slate-500 font-medium">Total Invoices</p>
              <p className="text-xl font-bold text-slate-900 font-heading mt-0.5">
                {bills.length}
              </p>
            </div>
          </div>
        </div>

        {/* 2-Column Grid corresponding to Android LazyVerticalGrid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {dashboardItems.map((item, idx) => {
            const IconComponent = item.icon;
            return (
              <motion.button
                key={idx}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={item.action}
                id={`owner-dash-tile-${item.title.toLowerCase()}`}
                className="flex flex-col items-center text-center p-5 bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md hover:border-indigo-400 transition-all group cursor-pointer"
              >
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-3.5 border transition-transform group-hover:scale-110 ${item.color}`}
                >
                  <IconComponent className="w-7 h-7" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm sm:text-base group-hover:text-indigo-600 transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5 truncate max-w-full">
                  {item.description}
                </p>
              </motion.button>
            );
          })}
        </div>
      </main>
    </div>
  );
};
