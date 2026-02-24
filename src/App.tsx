import React, { useState } from 'react';
import { Microscope, Camera, Library, Settings as SettingsIcon, Loader2, ChevronLeft, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CameraView } from './components/CameraView';
import { AnalysisPanel } from './components/AnalysisPanel';
import { Gallery } from './components/Gallery';
import { Settings } from './components/Settings';
import { analyzeImage, generateLabReport } from './services/gemini';
import { MicroscopeType, Specimen } from './types';
import Markdown from 'react-markdown';

type Tab = 'live' | 'gallery' | 'settings';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('live');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [labReport, setLabReport] = useState<string | null>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  // Settings
  const [magnification, setMagnification] = useState('400x');
  const [microscopeType, setMicroscopeType] = useState<MicroscopeType>('brightfield');
  const [studentLevel, setStudentLevel] = useState('Grade 10');
  const [customApiKey, setCustomApiKey] = useState(() => {
    const saved = localStorage.getItem('microscope_api_key');
    // Default to the key provided by the user if nothing is saved
    return saved || 'AIzaSyBjKAx-X5vKLHgD8blm4EdR7Kd2lZrsPcQ';
  });

  const handleCustomApiKeyChange = (val: string) => {
    setCustomApiKey(val);
    localStorage.setItem('microscope_api_key', val);
  };

  const handleCapture = async (base64: string) => {
    setIsAnalyzing(true);
    setCapturedImage(base64);
    try {
      const result = await analyzeImage(base64, magnification, microscopeType, studentLevel, customApiKey);
      setAnalysis(result.text);
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Analysis failed. Please check your connection and API key.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const saveToLibrary = async () => {
    if (!analysis || !capturedImage) return;
    setIsSaving(true);
    try {
      // Extract name
      const match = analysis.match(/🔬 \*\*Specimen\*\*: (.*)/);
      const name = match ? match[1].trim() : 'Unknown Specimen';

      await fetch('/api/specimens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          image_data: capturedImage,
          analysis,
          magnification,
          microscope_type: microscopeType
        })
      });
      alert('Specimen saved to library!');
      setAnalysis(null);
      setCapturedImage(null);
    } catch (err) {
      console.error(err);
      alert('Failed to save specimen.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleGenerateReport = async () => {
    if (!analysis) return;
    setIsGeneratingReport(true);
    try {
      const report = await generateLabReport(analysis, customApiKey);
      setLabReport(report);
    } catch (err) {
      console.error(err);
      alert('Failed to generate report.');
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const handleSelectFromGallery = (specimen: Specimen) => {
    setAnalysis(specimen.analysis);
    setCapturedImage(specimen.image_data);
    setActiveTab('live');
  };

  return (
    <div className="fixed inset-0 flex flex-col bg-bg-deep text-text-light overflow-hidden">
      {/* Main Content */}
      <main className="flex-1 relative overflow-hidden">
        <AnimatePresence mode="wait">
          {activeTab === 'live' && (
            <motion.div 
              key="live"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full h-full"
            >
              <CameraView onCapture={handleCapture} isAnalyzing={isAnalyzing} />
            </motion.div>
          )}

          {activeTab === 'gallery' && (
            <motion.div 
              key="gallery"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              className="w-full h-full"
            >
              <Gallery onSelect={handleSelectFromGallery} />
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div 
              key="settings"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              className="w-full h-full"
            >
              <Settings 
                magnification={magnification}
                setMagnification={setMagnification}
                microscopeType={microscopeType}
                setMicroscopeType={setMicroscopeType}
                studentLevel={studentLevel}
                setStudentLevel={setStudentLevel}
                customApiKey={customApiKey}
                setCustomApiKey={handleCustomApiKeyChange}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Missing API Key Warning */}
        {!customApiKey && !process.env.GEMINI_API_KEY && activeTab === 'live' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-20 left-6 right-6 z-30 bg-warning/90 backdrop-blur-md p-4 rounded-2xl border border-white/20 shadow-xl"
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="text-white shrink-0" size={24} />
              <div>
                <h3 className="font-display text-sm text-white">API Key Required</h3>
                <p className="text-xs text-white/80 mt-1">Please go to Settings and paste your Gemini API key to enable analysis.</p>
                <button 
                  onClick={() => setActiveTab('settings')}
                  className="mt-3 px-4 py-2 bg-white text-warning rounded-xl font-display text-[10px] uppercase tracking-wider"
                >
                  Go to Settings
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Loading Overlay */}
        <AnimatePresence>
          {isAnalyzing && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-40 bg-bg-deep/80 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center"
            >
              <div className="relative w-24 h-24 mb-6">
                <div className="absolute inset-0 border-4 border-accent-cyan/20 rounded-full" />
                <div className="absolute inset-0 border-4 border-accent-cyan border-t-transparent rounded-full animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Microscope size={32} className="text-accent-cyan" />
                </div>
              </div>
              <h2 className="text-2xl font-display mb-2 text-accent-cyan">Analyzing Specimen</h2>
              <p className="text-text-light/60 max-w-xs">Gemini AI is identifying structures and biological patterns...</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Analysis Result Panel */}
        <AnimatePresence>
          {analysis && !labReport && (
            <AnalysisPanel 
              analysis={analysis}
              onClose={() => {
                setAnalysis(null);
                setCapturedImage(null);
              }}
              onSave={saveToLibrary}
              onGenerateReport={handleGenerateReport}
              isSaving={isSaving}
            />
          )}
        </AnimatePresence>

        {/* Lab Report Modal */}
        <AnimatePresence>
          {(labReport || isGeneratingReport) && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute inset-0 z-[60] bg-bg-deep flex flex-col"
            >
              <div className="p-4 border-b border-white/5 flex items-center justify-between">
                <button 
                  onClick={() => setLabReport(null)}
                  className="flex items-center gap-2 text-accent-cyan font-display text-sm"
                >
                  <ChevronLeft size={20} /> Back to Analysis
                </button>
                <h2 className="font-display">Lab Report</h2>
                <div className="w-10" />
              </div>
              
              <div className="flex-1 overflow-y-auto p-6">
                {isGeneratingReport ? (
                  <div className="flex flex-col items-center justify-center h-full gap-4">
                    <Loader2 className="animate-spin text-accent-green" size={48} />
                    <p className="font-display text-accent-green">Generating Lab Report...</p>
                  </div>
                ) : (
                  <div className="bg-white text-gray-900 p-8 rounded-sm shadow-xl max-w-2xl mx-auto min-h-full">
                    <div className="markdown-body prose prose-sm max-w-none">
                      <Markdown>{labReport || ''}</Markdown>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Navigation Bar */}
      <nav className="h-20 bg-card border-t border-white/5 flex items-center justify-around px-4 pb-safe">
        <NavButton 
          active={activeTab === 'live'} 
          onClick={() => setActiveTab('live')}
          icon={<Camera size={24} />}
          label="Live"
        />
        <NavButton 
          active={activeTab === 'gallery'} 
          onClick={() => setActiveTab('gallery')}
          icon={<Library size={24} />}
          label="Library"
        />
        <NavButton 
          active={activeTab === 'settings'} 
          onClick={() => setActiveTab('settings')}
          icon={<SettingsIcon size={24} />}
          label="Settings"
        />
      </nav>
    </div>
  );
}

function NavButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center gap-1 transition-all ${active ? 'text-accent-cyan' : 'text-text-light/40 hover:text-text-light/60'}`}
    >
      <div className={`p-2 rounded-xl transition-all ${active ? 'bg-accent-cyan/10' : ''}`}>
        {icon}
      </div>
      <span className="text-[10px] font-display uppercase tracking-wider">{label}</span>
    </button>
  );
}
