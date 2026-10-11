import React, { useState, useEffect } from 'react';
import { isSupabaseConfigured, testSupabaseConnection } from '../lib/supabase';

interface SupabaseStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseStatusModal: React.FC<SupabaseStatusModalProps> = ({ isOpen, onClose }) => {
  const [testing, setTesting] = useState(false);
  const [status, setStatus] = useState<{
    connected: boolean;
    message: string;
    latencyMs?: number;
  }>({
    connected: isSupabaseConfigured,
    message: isSupabaseConfigured
      ? 'Supabase environment detected. Testing live connection...'
      : 'Supabase credentials not configured in environment variables (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY). Running in local sandbox persistence mode with 48 seeded questions.',
  });

  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen && isSupabaseConfigured) {
      handleTest();
    }
  }, [isOpen]);

  const handleTest = async () => {
    setTesting(true);
    const res = await testSupabaseConnection();
    setStatus(res);
    setTesting(false);
  };

  const copyEnvSnippet = () => {
    const text = `# Add to .env:
VITE_SUPABASE_URL="https://your-project.supabase.co"
VITE_SUPABASE_ANON_KEY="your-anon-key"`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#0A1128]/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 transition-all">
      <div className="bg-white w-full max-w-2xl rounded-2xl border border-[#c7c4d8] shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#c7c4d8] flex items-center justify-between bg-[#f2f3ff]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-700 flex items-center justify-center text-white">
              <span className="material-symbols-outlined text-lg">database</span>
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#131b2e] font-headline">
                Supabase PostgreSQL Connection Status
              </h2>
              <p className="text-xs text-[#464555]">
                Logic Legends Data Persistence & Cloud Integration
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-[#777587] hover:text-[#131b2e] cursor-pointer">
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 overflow-y-auto max-h-[75vh]">
          {/* Status Badge */}
          <div
            className={`p-4 rounded-xl border flex items-start gap-3 ${
              status.connected
                ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                : 'bg-amber-50 border-amber-300 text-amber-900'
            }`}
          >
            <span
              className={`material-symbols-outlined text-xl mt-0.5 ${
                status.connected ? 'text-emerald-600' : 'text-amber-600'
              }`}
            >
              {status.connected ? 'check_circle' : 'info'}
            </span>
            <div className="text-xs leading-relaxed">
              <div className="font-bold text-sm mb-0.5">
                {status.connected ? 'Cloud Supabase Instance Connected' : 'Local Persistence Sandbox Mode Active'}
              </div>
              <p>{status.message}</p>
            </div>
          </div>

          {/* Test Connection Button */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-xs font-semibold text-[#131b2e]">Real-time Health Diagnostic:</span>
            <button
              onClick={handleTest}
              disabled={testing}
              className="px-3 py-1.5 rounded-lg bg-[#3525cd] text-white text-xs font-semibold hover:bg-[#4f46e5] flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
            >
              <span className={`material-symbols-outlined text-sm ${testing ? 'animate-spin' : ''}`}>
                {testing ? 'sync' : 'speed'}
              </span>
              <span>{testing ? 'Testing...' : 'Test Connection'}</span>
            </button>
          </div>

          {/* How to Connect instructions */}
          <div className="p-4 rounded-xl bg-[#f2f3ff] border border-[#c7c4d8] text-xs space-y-2">
            <div className="font-bold text-[#131b2e] flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm text-[#3525cd]">link</span>
              <span>Connecting your Supabase Project</span>
            </div>
            <p className="text-[#464555]">
              To connect your live database, add your Supabase credentials in your environment variables:
            </p>
            <pre className="bg-[#0f172a] text-emerald-300 p-2.5 rounded-lg font-mono text-[11px] overflow-x-auto">
{`VITE_SUPABASE_URL="https://<your-project-id>.supabase.co"
VITE_SUPABASE_ANON_KEY="<your-public-anon-key>"`}
            </pre>
            <button
              onClick={copyEnvSnippet}
              className="px-2.5 py-1 rounded bg-white border border-[#c7c4d8] text-xs font-semibold text-[#131b2e] hover:bg-[#eaedff] transition-colors cursor-pointer"
            >
              {copied ? '✓ Copied' : 'Copy Variables'}
            </button>
          </div>

          {/* Schema migrations info */}
          <div className="p-4 rounded-xl bg-[#f2f3ff] border border-[#c7c4d8] text-xs space-y-2">
            <div className="font-bold text-[#131b2e] flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm text-emerald-700">schema</span>
              <span>Pre-generated Database Migration File</span>
            </div>
            <p className="text-[#464555]">
              Full database schema with Row Level Security (RLS) policies for all tables (<code>profiles</code>, <code>assessment_categories</code>, <code>questions</code>, <code>assessment_attempts</code>, <code>assessment_responses</code>, <code>communication_evaluations</code>, <code>audit_logs</code>) is available in:
            </p>
            <div className="p-2 rounded bg-white border border-[#c7c4d8] font-mono text-[11px] text-[#3525cd]">
              supabase/schema.sql
            </div>
            <p className="text-[#464555] text-[11px]">
              Execute it in your Supabase SQL Editor with a single click to prepare all tables and RLS security rules.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#f2f3ff] border-t border-[#c7c4d8] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-[#3525cd] text-white text-xs font-semibold hover:bg-[#4f46e5] cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
