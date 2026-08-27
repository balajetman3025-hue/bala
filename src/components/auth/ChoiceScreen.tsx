import React from 'react';
import { useApp } from '../../context/AppContext';
import { Building2, User, ChevronRight, Store, Sparkles, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';

export const ChoiceScreen: React.FC = () => {
  const { navigateTo, loginAsOwner, loginAsCustomer } = useApp();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full mx-auto space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-200 mb-2">
            <Store className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 font-heading tracking-tight">
            MERIDUKAN
          </h2>
          <p className="text-sm text-slate-500 font-medium">
            Choose your account type to get started
          </p>
        </div>

        <div className="space-y-4">
          {/* Business Owner Card */}
          <motion.div
            whileHover={{ scale: 1.01, y: -2 }}
            whileTap={{ scale: 0.99 }}
            className="cursor-pointer"
          >
            <button
              onClick={() => navigateTo('ownerLogin')}
              id="choice-owner-btn"
              className="w-full text-left p-6 bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-indigo-500 hover:shadow-md hover:shadow-indigo-100 transition-all group relative overflow-hidden"
            >
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <Building2 className="w-7 h-7" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                      Business Owner
                    </h3>
                    <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                  </div>
                  <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                    Manage products, inventory, customers, GST billing & business analytics
                  </p>
                  <div className="flex flex-wrap gap-2 mt-3 text-xs font-semibold text-slate-600">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 rounded-md">
                      <CheckCircle2 className="w-3 h-3 text-indigo-500" /> GST Billing
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 rounded-md">
                      <CheckCircle2 className="w-3 h-3 text-indigo-500" /> Inventory
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 rounded-md">
                      <CheckCircle2 className="w-3 h-3 text-indigo-500" /> Reports
                    </span>
                  </div>
                </div>
              </div>
            </button>
          </motion.div>

          {/* Customer Card */}
          <motion.div
            whileHover={{ scale: 1.01, y: -2 }}
            whileTap={{ scale: 0.99 }}
            className="cursor-pointer"
          >
            <button
              onClick={() => navigateTo('customerLogin')}
              id="choice-customer-btn"
              className="w-full text-left p-6 bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-500 hover:shadow-md hover:shadow-emerald-100 transition-all group relative overflow-hidden"
            >
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                  <User className="w-7 h-7" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                      Customer
                    </h3>
                    <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
                  </div>
                  <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                    Browse shop catalog, place orders, track purchases & contact customer support
                  </p>
                  <div className="flex flex-wrap gap-2 mt-3 text-xs font-semibold text-slate-600">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 rounded-md">
                      <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Easy Orders
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 rounded-md">
                      <CheckCircle2 className="w-3 h-3 text-emerald-500" /> UPI / COD
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 rounded-md">
                      <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Instant Bills
                    </span>
                  </div>
                </div>
              </div>
            </button>
          </motion.div>
        </div>

        {/* Quick Demo Access Bar */}
        <div className="p-4 bg-indigo-50/60 border border-indigo-100 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
            <p className="text-xs font-bold text-indigo-900 uppercase tracking-wide">
              Quick Test / Instant Demo Access
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => loginAsOwner('owner@meridukan.com')}
              id="quick-demo-owner-btn"
              className="py-2 px-3 bg-white hover:bg-indigo-600 hover:text-white text-indigo-700 font-semibold rounded-lg border border-indigo-200 transition-colors shadow-2xs"
            >
              1-Click Owner Demo
            </button>
            <button
              onClick={() => loginAsCustomer('Priya Mehta', '+91 9820011223', 'priya@example.com')}
              id="quick-demo-customer-btn"
              className="py-2 px-3 bg-white hover:bg-emerald-600 hover:text-white text-emerald-700 font-semibold rounded-lg border border-emerald-200 transition-colors shadow-2xs"
            >
              1-Click Customer Demo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
