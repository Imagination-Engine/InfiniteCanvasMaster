import { useState, useEffect } from 'react';
import { Settings, X, Save, AlertTriangle } from 'lucide-react';
import { apiRequest } from '../lib/api';
import { useAuth } from '../auth/AuthContext';

export default function SettingsModal({ onClose }: { onClose: () => void }) {
  const { accessToken } = useAuth();
  const [llmConfig, setLlmConfig] = useState({ provider: 'ollama', model: '', apiKey: '', baseUrl: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadConfig() {
      if (!accessToken) return;
      try {
        const data = await apiRequest<any>('/api/settings/llm', {}, accessToken);
        if (data && data.provider) {
          setLlmConfig(prev => ({ ...prev, ...data }));
        }
      } catch (err) {
        console.error('Failed to load LLM config', err);
      }
    }
    void loadConfig();
  }, [accessToken]);

  const saveConfig = async () => {
    if (!accessToken) return;
    setSaving(true);
    setError(null);
    try {
      await apiRequest('/api/settings/llm', {
        method: 'PUT',
        body: JSON.stringify(llmConfig)
      }, accessToken);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save configuration');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-slate-900 w-full max-w-lg rounded-[24px] border border-white/10 shadow-2xl p-8 animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center mb-8 pb-4 border-b border-white/10">
          <h2 className="text-2xl font-black uppercase tracking-widest text-white flex items-center gap-3">
            <Settings className="text-brand-cyan" size={28} /> Configuration
          </h2>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
            <X size={28} />
          </button>
        </div>

        {error && (
          <div className="mb-6 bg-rose-500/10 border border-rose-500/20 text-rose-400 px-4 py-3 rounded-xl text-[12px] font-medium tracking-wide uppercase">
            {error}
          </div>
        )}

        <div className="space-y-6">
          <div>
            <label className="block text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2">Provider</label>
            <select 
              className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl text-white outline-none focus:border-brand-purple/50 focus:bg-white/[0.05] transition-all appearance-none"
              value={llmConfig.provider}
              onChange={(e) => setLlmConfig({...llmConfig, provider: e.target.value as any})}
            >
              <option value="ollama" className="bg-slate-900">Ollama (Local)</option>
              <option value="openai" className="bg-slate-900">OpenAI (Cloud)</option>
              <option value="gemini" className="bg-slate-900">Gemini (Cloud)</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2">Model Name</label>
            <input 
              type="text" 
              placeholder={llmConfig.provider === 'ollama' ? 'e.g. llama3' : 'e.g. gpt-4o'}
              className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl text-white placeholder:text-slate-600 outline-none focus:border-brand-purple/50 focus:bg-white/[0.05] transition-all"
              value={llmConfig.model}
              onChange={(e) => setLlmConfig({...llmConfig, model: e.target.value})}
            />
          </div>

          {llmConfig.provider !== 'ollama' && (
            <div className="animate-in slide-in-from-top-2">
              <label className="block text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2">API Key</label>
              <input 
                type="password" 
                placeholder="sk-..."
                className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl text-white placeholder:text-slate-600 outline-none focus:border-brand-purple/50 focus:bg-white/[0.05] transition-all"
                value={llmConfig.apiKey}
                onChange={(e) => setLlmConfig({...llmConfig, apiKey: e.target.value})}
              />
              <div className="mt-4 flex items-start gap-3 text-amber-500 bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl text-xs leading-relaxed">
                <AlertTriangle size={18} className="shrink-0 mt-0.5" />
                <div>
                  External API calls will send data to {llmConfig.provider.toUpperCase()} servers.
                  Your key is stored locally in SQLite.
                </div>
              </div>
            </div>
          )}

          {llmConfig.provider === 'ollama' && (
            <div className="animate-in slide-in-from-top-2">
              <label className="block text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2">Base URL (Optional)</label>
              <input 
                type="text" 
                placeholder="http://localhost:11434"
                className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl text-white placeholder:text-slate-600 outline-none focus:border-brand-purple/50 focus:bg-white/[0.05] transition-all"
                value={llmConfig.baseUrl}
                onChange={(e) => setLlmConfig({...llmConfig, baseUrl: e.target.value})}
              />
            </div>
          )}

          <div className="pt-6 flex gap-3">
            <button 
              onClick={saveConfig}
              disabled={saving}
              className="flex-1 rounded-xl bg-gradient-to-r from-brand-purple to-brand-cyan text-white py-3.5 text-[12px] font-black uppercase tracking-widest shadow-[0_10px_20px_-5px_--theme(--color-brand-purple/40%)] hover:shadow-[0_15px_30px_-5px_--theme(--color-brand-cyan/50%)] active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2"
            >
              {saving ? 'Saving...' : <><Save size={18} /> Save Settings</>}
            </button>
            <button 
              onClick={onClose}
              disabled={saving}
              className="px-6 py-3.5 rounded-xl border border-white/10 bg-white/5 text-[12px] font-black uppercase tracking-widest text-slate-300 hover:bg-white/10 hover:text-white transition-all disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
