import React, { useState } from 'react';
import { Microscope, Settings2, Info, ChevronRight, Globe, Zap, CheckCircle2, AlertCircle } from 'lucide-react';
import { MicroscopeType } from '../types';
import { testConnection } from '../services/gemini';

interface SettingsProps {
  magnification: string;
  setMagnification: (v: string) => void;
  microscopeType: MicroscopeType;
  setMicroscopeType: (v: MicroscopeType) => void;
  studentLevel: string;
  setStudentLevel: (v: string) => void;
  customApiKey: string;
  setCustomApiKey: (v: string) => void;
}

export const Settings: React.FC<SettingsProps> = ({
  magnification,
  setMagnification,
  microscopeType,
  setMicroscopeType,
  studentLevel,
  setStudentLevel,
  customApiKey,
  setCustomApiKey
}) => {
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'fail'>('idle');

  const handleTest = async () => {
    if (!customApiKey) return;
    setTestStatus('testing');
    const ok = await testConnection(customApiKey);
    setTestStatus(ok ? 'success' : 'fail');
    setTimeout(() => setTestStatus('idle'), 3000);
  };

  return (
    <div className="flex flex-col h-full bg-bg-deep p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-display mb-2">Settings</h1>
        <p className="text-text-light/60 text-sm">Configure your hardware and analysis</p>
      </div>

      <div className="space-y-8 overflow-y-auto pb-20">
        {/* API Key Fallback */}
        <section>
          <div className="flex items-center gap-2 text-warning font-display text-sm mb-4">
            <Zap size={16} /> API CONFIGURATION (FALLBACK)
          </div>
          <div className="bg-card border border-warning/20 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-mono text-text-light/40 uppercase">Manual API Key</label>
              {customApiKey && (
                <button 
                  onClick={() => setCustomApiKey('')}
                  className="text-[10px] text-warning hover:underline"
                >
                  Clear Key
                </button>
              )}
            </div>
            <div className="flex gap-2">
              <input
                type="password"
                placeholder="Paste AIzaSy... key here"
                value={customApiKey}
                onChange={(e) => setCustomApiKey(e.target.value)}
                className={`flex-1 bg-transparent text-sm font-mono focus:outline-none border-b pb-1 transition-colors ${
                  customApiKey && !customApiKey.trim().startsWith('AIza') 
                    ? 'border-warning text-warning' 
                    : 'border-white/10 text-accent-cyan'
                }`}
              />
              <button
                onClick={handleTest}
                disabled={!customApiKey || testStatus !== 'idle'}
                className={`px-3 py-1 rounded-lg text-[10px] font-display transition-all flex items-center gap-1 ${
                  testStatus === 'success' ? 'bg-accent-green text-bg-deep' :
                  testStatus === 'fail' ? 'bg-warning text-white' :
                  'bg-white/10 text-text-light hover:bg-white/20'
                }`}
              >
                {testStatus === 'testing' ? '...' : 
                 testStatus === 'success' ? <><CheckCircle2 size={12}/> OK</> :
                 testStatus === 'fail' ? <><AlertCircle size={12}/> ERR</> : 
                 'TEST'}
              </button>
            </div>
            {customApiKey && !customApiKey.trim().startsWith('AIza') && (
              <p className="text-[10px] text-warning mt-1">Key must start with "AIza"</p>
            )}
            <p className="text-[10px] text-text-light/30 mt-2">
              Use this if you cannot find the AI Studio Secrets panel.
            </p>
          </div>
        </section>

        {/* Hardware */}
        <section>
          <div className="flex items-center gap-2 text-accent-cyan font-display text-sm mb-4">
            <Microscope size={16} /> HARDWARE CONFIGURATION
          </div>
          <div className="space-y-4">
            <div className="bg-card border border-white/5 rounded-2xl p-4">
              <label className="block text-xs font-mono text-text-light/40 mb-2 uppercase">Magnification</label>
              <select 
                value={magnification}
                onChange={(e) => setMagnification(e.target.value)}
                className="w-full bg-transparent text-lg font-display focus:outline-none"
              >
                <option value="40x">40x</option>
                <option value="100x">100x</option>
                <option value="400x">400x</option>
                <option value="1000x">1000x</option>
              </select>
            </div>

            <div className="bg-card border border-white/5 rounded-2xl p-4">
              <label className="block text-xs font-mono text-text-light/40 mb-2 uppercase">Microscope Type</label>
              <div className="grid grid-cols-3 gap-2">
                {(['brightfield', 'darkfield', 'fluorescence'] as MicroscopeType[]).map(type => (
                  <button
                    key={type}
                    onClick={() => setMicroscopeType(type)}
                    className={`py-2 px-1 rounded-xl text-[10px] font-display uppercase transition-all ${
                      microscopeType === type 
                        ? 'bg-accent-cyan text-bg-deep' 
                        : 'bg-white/5 text-text-light/60'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Education */}
        <section>
          <div className="flex items-center gap-2 text-accent-green font-display text-sm mb-4">
            <Globe size={16} /> EDUCATIONAL CONTEXT
          </div>
          <div className="bg-card border border-white/5 rounded-2xl p-4">
            <label className="block text-xs font-mono text-text-light/40 mb-2 uppercase">Student Level</label>
            <select 
              value={studentLevel}
              onChange={(e) => setStudentLevel(e.target.value)}
              className="w-full bg-transparent text-lg font-display focus:outline-none"
            >
              <option value="Middle School">Middle School</option>
              <option value="Grade 9">Grade 9</option>
              <option value="Grade 10">Grade 10</option>
              <option value="Grade 11">Grade 11</option>
              <option value="Grade 12">Grade 12</option>
              <option value="University">University</option>
            </select>
          </div>
        </section>

        {/* About */}
        <section className="pt-8 border-t border-white/5">
          <div className="flex items-center justify-between text-text-light/40 text-sm">
            <div className="flex items-center gap-2">
              <Info size={16} /> Version 1.0.0
            </div>
            <div className="flex items-center gap-1">
              Powered by Gemini <div className="w-2 h-2 rounded-full bg-accent-cyan" />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
