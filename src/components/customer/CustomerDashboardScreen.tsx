import React from 'react';
import { useApp } from '../../context/AppContext';
import { Header } from '../common/Header';
import {
  Package,
  ShoppingBag,
  HeadphonesIcon,
  LogOut,
  Search,
  ChevronRight,
  Store,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { motion } from 'motion/react';

export const CustomerDashboardScreen: React.FC = () => {
  const {
    customerProfile,
    ownerProfile,
    products,
    orders,
    navigateTo,
    logout,
  } = useApp();

  const customerMenuItems = [
    {
      title: 'Products Catalog',
      description: 'Explore store items, groceries & electronics',
      count: `${products.length} Items Available`,
      icon: Package,
      color: 'bg-emerald-50 text-emerald-600 border-emerald-200',
      action: () => navigateTo('customerProducts'),
    },
    {
      title: 'My Orders',
      description: 'View purchase history, receipts & statuses',
      count: `${orders.length} Past Orders`,
      icon: ShoppingBag,
      color: 'bg-indigo-50 text-indigo-600 border-indigo-200',
      action: () => navigateTo('customerOrders'),
    },
    {
      title: 'Customer Support',
      description: 'Contact store manager & helpline',
      count: 'Direct Help',
      icon: HeadphonesIcon,
      color: 'bg-blue-50 text-blue-600 border-blue-200',
      action: () => navigateTo('customerSupport'),
    },
    {
      title: 'Logout',
      description: 'Switch user or return to login',
      count: 'Sign Out',
      icon: LogOut,
      color: 'bg-rose-50 text-rose-600 border-rose-200',
      action: logout,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header
        title={ownerProfile.businessName || 'MERIDUKAN Store'}
        subtitle={`Welcome, ${customerProfile.customerName || 'Valued Customer'}`}
      />

      <main className="max-w-5xl w-full mx-auto p-4 sm:p-6 space-y-6 flex-1">
        {/* Welcome Greeting Banner */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-3xl p-6 sm:p-8 text-white shadow-lg shadow-emerald-500/10 relative overflow-hidden">
          <div className="relative z-10 space-y-3 max-w-lg">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/15 rounded-full text-xs font-semibold backdrop-blur-xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              Verified Local Merchant
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-heading">
              Welcome, {customerProfile.customerName || 'Customer'}!
            </h2>
            <p className="text-emerald-100 text-xs sm:text-sm leading-relaxed">
              Order daily essentials, groceries, electronics & confectionery directly from{' '}
              <strong>{ownerProfile.businessName}</strong> with doorstep delivery and genuine GST invoices.
            </p>
            <div className="pt-2">
              <button
                onClick={() => navigateTo('customerProducts')}
                id="customer-banner-shop-now-btn"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-emerald-800 hover:bg-emerald-50 font-bold rounded-xl text-xs shadow-md transition-all cursor-pointer"
              >
                <span>Browse Product Catalog</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <Store className="absolute -right-8 -bottom-8 w-60 h-60 text-white/10 pointer-events-none" />
        </div>

        {/* Featured Store Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-slate-900">100% Genuine Items</p>
              <p className="text-slate-500">Direct from trusted suppliers</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-slate-900">GST Invoice Provided</p>
              <p className="text-slate-500">Valid tax receipts for every buy</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <HeadphonesIcon className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-slate-900">Dedicated Support</p>
              <p className="text-slate-500">{ownerProfile.mobile || 'Instant Help'}</p>
            </div>
          </div>
        </div>

        {/* Grid menu matching Android customer dashboard */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {customerMenuItems.map((item, idx) => {
            const IconComponent = item.icon;
            return (
              <motion.button
                key={idx}
                whileHover={{ scale: 1.01, y: -2 }}
                whileTap={{ scale: 0.99 }}
                onClick={item.action}
                id={`customer-menu-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
                className="flex items-center gap-4 p-5 bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md hover:border-emerald-500 transition-all text-left group cursor-pointer"
              >
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border transition-transform group-hover:scale-110 ${item.color}`}
                >
                  <IconComponent className="w-7 h-7" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-900 text-base group-hover:text-emerald-600 transition-colors">
                      {item.title}
                    </h3>
                    <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                    {item.description}
                  </p>
                  <span className="inline-block text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md mt-2">
                    {item.count}
                  </span>
                </div>
              </motion.button>
            );
          })}
        </div>
      </main>
    </div>
  );
};
