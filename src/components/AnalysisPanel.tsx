import React from 'react';
import Markdown from 'react-markdown';
import { motion } from 'motion/react';
import { X, Save, FileText, Share2 } from 'lucide-react';

interface AnalysisPanelProps {
  analysis: string | null;
  onClose: () => void;
  onSave: () => void;
  onGenerateReport: () => void;
  isSaving: boolean;
}

export const AnalysisPanel: React.FC<AnalysisPanelProps> = ({ 
  analysis, 
  onClose, 
  onSave, 
  onGenerateReport,
  isSaving 
}) => {
  if (!analysis) return null;

  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed inset-x-0 bottom-0 z-50 bg-bg-deep border-t border-accent-cyan/30 rounded-t-3xl shadow-2xl max-h-[85vh] flex flex-col"
    >
      {/* Header */}
      <div className="p-4 border-bottom border-white/5 flex items-center justify-between sticky top-0 bg-bg-deep/95 backdrop-blur-md rounded-t-3xl z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-accent-cyan/10 rounded-lg">
            <FileText size={20} className="text-accent-cyan" />
          </div>
          <h2 className="font-display text-lg">Analysis Results</h2>
        </div>
        <button 
          onClick={onClose}
          className="p-2 hover:bg-white/5 rounded-full transition-colors"
        >
          <X size={24} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 pb-32">
        <div className="markdown-body">
          <Markdown>{analysis}</Markdown>
        </div>
      </div>

      {/* Actions */}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-bg-deep via-bg-deep to-transparent">
        <div className="flex gap-3">
          <button
            onClick={onSave}
            disabled={isSaving}
            className="flex-1 py-4 bg-accent-cyan text-bg-deep rounded-2xl font-display font-bold flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
          >
            <Save size={20} />
            {isSaving ? 'Saving...' : 'Save to Library'}
          </button>
          <button
            onClick={onGenerateReport}
            className="px-6 py-4 bg-card border border-white/10 rounded-2xl font-display flex items-center justify-center gap-2 transition-all active:scale-95 hover:bg-white/5"
          >
            <FileText size={20} className="text-accent-green" />
            Report
          </button>
        </div>
      </div>
    </motion.div>
  );
};
