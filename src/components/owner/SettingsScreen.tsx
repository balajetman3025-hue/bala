import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Header } from '../common/Header';
import {
  Settings,
  User,
  Download,
  Upload,
  RefreshCw,
  Info,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  FileText,
} from 'lucide-react';

export const SettingsScreen: React.FC = () => {
  const {
    ownerProfile,
    navigateTo,
    exportDatabaseJson,
    importDatabaseJson,
    resetToDefaults,
  } = useApp();

  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = importDatabaseJson(content);
      if (success) {
        setImportStatus('Database restored successfully!');
      } else {
        setImportStatus('Error: Invalid backup JSON format.');
      }
      setTimeout(() => setImportStatus(null), 4000);
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    resetToDefaults();
    setShowResetConfirm(false);
    setImportStatus('Workspace restored to initial sample data.');
    setTimeout(() => setImportStatus(null), 4000);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header
        title="Settings & System"
        subtitle="Manage business configuration & database backups"
        showBack={true}
        onBack={() => navigateTo('ownerDashboard')}
      />

      <main className="max-w-3xl w-full mx-auto p-4 sm:p-6 space-y-6 flex-1">
        {importStatus && (
          <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-2xl text-indigo-900 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>{importStatus}</span>
          </div>
        )}

        {/* Business Profile Shortcut Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <User className="w-6 h-6" />
            </div>
            <div className="truncate">
              <h3 className="text-base font-bold text-slate-900 font-heading">
                Business & Owner Profile
              </h3>
              <p className="text-xs text-slate-500 truncate">
                {ownerProfile.businessName} • {ownerProfile.ownerName}
              </p>
            </div>
          </div>
          <button
            onClick={() => navigateTo('ownerProfile')}
            id="settings-edit-profile-btn"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors shrink-0 cursor-pointer"
          >
            Edit Profile
          </button>
        </div>

        {/* Backup and Restore Section */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Download className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900 font-heading">
              Data Backup & Restore
            </h3>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Download an offline JSON backup containing all your products, bills, customer records, staff, and settings. You can re-import this data at any time.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <button
              onClick={exportDatabaseJson}
              id="settings-export-json-btn"
              className="flex items-center justify-center gap-2 p-3 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4 text-indigo-600" />
              <span>Export Database (JSON)</span>
            </button>

            <label className="flex items-center justify-center gap-2 p-3 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-colors cursor-pointer">
              <Upload className="w-4 h-4 text-indigo-600" />
              <span>Restore from JSON File</span>
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Reset Database Section */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <RefreshCw className="w-5 h-5 text-rose-600" />
            <h3 className="text-base font-bold text-slate-900 font-heading">
              Reset Workspace to Defaults
            </h3>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Resetting clears changes and re-seeds your shop with standard sample products, invoices, customers, and staff for testing.
          </p>

          {!showResetConfirm ? (
            <button
              onClick={() => setShowResetConfirm(true)}
              id="settings-reset-defaults-btn"
              className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Reset to Sample Data
            </button>
          ) : (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl space-y-3">
              <p className="text-xs font-bold text-rose-800">
                Are you sure you want to reset all stored items to factory defaults?
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleReset}
                  id="confirm-reset-workspace-btn"
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-colors"
                >
                  Yes, Reset Everything
                </button>
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Application Information */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3 text-xs text-slate-500">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Info className="w-4 h-4 text-indigo-600" />
            <h4 className="font-bold text-slate-900 font-heading">
              About MERIDUKAN
            </h4>
          </div>
          <p>
            <strong>Application:</strong> MERIDUKAN — Retail Shop & Business Management Suite
          </p>
          <p>
            <strong>Version:</strong> 1.0.0 (Production Release)
          </p>
          <p>
            <strong>Features:</strong> Multi-role POS, Real-time GST calculation, Inventory tracking, Customer CRM, Staff registry & Order management.
          </p>
        </div>
      </main>
    </div>
  );
};
