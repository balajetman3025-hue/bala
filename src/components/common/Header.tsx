import React from 'react';
import { useApp } from '../../context/AppContext';
import { ArrowLeft, Store, User, LogOut, ShieldCheck, ShoppingBag } from 'lucide-react';

interface HeaderProps {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
  subtitle?: string;
  rightAction?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  showBack = false,
  onBack,
  subtitle,
  rightAction,
}) => {
  const { goBack, currentRole, logout, navigateTo, ownerProfile } = useApp();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      goBack();
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          {showBack && (
            <button
              onClick={handleBack}
              id="header-back-btn"
              className="p-2 -ml-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}

          <div className="flex items-center gap-2.5 truncate">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shrink-0 shadow-sm shadow-indigo-200">
              <Store className="w-5 h-5" />
            </div>
            <div className="truncate">
              <h1 className="text-lg font-bold text-slate-900 leading-tight truncate font-heading">
                {title}
              </h1>
              {subtitle && (
                <p className="text-xs text-slate-500 truncate">{subtitle}</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {rightAction}

          {currentRole && (
            <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200">
              {currentRole === 'owner' ? (
                <button
                  onClick={() => navigateTo('ownerProfile')}
                  id="header-profile-btn"
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold transition-colors"
                  title="Owner Profile"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                  <span className="hidden sm:inline truncate max-w-[120px]">
                    {ownerProfile.businessName || 'Owner'}
                  </span>
                </button>
              ) : (
                <button
                  onClick={() => navigateTo('customerOrders')}
                  id="header-orders-btn"
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold transition-colors"
                  title="My Orders"
                >
                  <ShoppingBag className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="hidden sm:inline">My Orders</span>
                </button>
              )}

              <button
                onClick={logout}
                id="header-logout-btn"
                className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                title="Logout / Switch Account"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
