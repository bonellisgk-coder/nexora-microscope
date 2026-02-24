import React, { useEffect, useState } from 'react';
import { Search, Calendar, Trash2, Microscope, ChevronRight } from 'lucide-react';
import { Specimen } from '../types';
import { format } from 'date-fns';

interface GalleryProps {
  onSelect: (specimen: Specimen) => void;
}

export const Gallery: React.FC<GalleryProps> = ({ onSelect }) => {
  const [specimens, setSpecimens] = useState<Specimen[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSpecimens();
  }, []);

  const fetchSpecimens = async () => {
    try {
      const res = await fetch('/api/specimens');
      const data = await res.json();
      setSpecimens(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const deleteSpecimen = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this specimen?')) return;
    
    try {
      await fetch(`/api/specimens/${id}`, { method: 'DELETE' });
      setSpecimens(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = specimens.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.magnification.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-bg-deep p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-display mb-2">Specimen Library</h1>
        <p className="text-text-light/60 text-sm">Your collection of analyzed samples</p>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-light/40" size={20} />
        <input
          type="text"
          placeholder="Search specimens..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-card border border-white/5 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-accent-cyan/50 transition-colors"
        />
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-accent-cyan border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 opacity-40">
            <Microscope size={48} className="mx-auto mb-4" />
            <p>No specimens found</p>
          </div>
        ) : (
          filtered.map(specimen => (
            <div
              key={specimen.id}
              onClick={() => onSelect(specimen)}
              className="group bg-card border border-white/5 rounded-2xl p-4 flex items-center gap-4 active:scale-[0.98] transition-all cursor-pointer hover:border-accent-cyan/30"
            >
              <div className="w-20 h-20 rounded-xl overflow-hidden bg-black flex-shrink-0">
                <img 
                  src={`data:image/jpeg;base64,${specimen.image_data}`} 
                  alt={specimen.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-display text-accent-cyan truncate">{specimen.name}</h3>
                <div className="flex items-center gap-3 mt-1 text-xs text-text-light/50">
                  <span className="flex items-center gap-1">
                    <Microscope size={12} /> {specimen.magnification}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar size={12} /> {format(new Date(specimen.created_at), 'MMM d, yyyy')}
                  </span>
                </div>
              </div>
              <button
                onClick={(e) => deleteSpecimen(e, specimen.id)}
                className="p-3 hover:bg-warning/10 hover:text-warning rounded-xl transition-colors opacity-0 group-hover:opacity-100"
              >
                <Trash2 size={18} />
              </button>
              <ChevronRight size={20} className="text-text-light/20" />
            </div>
          ))
        )}
      </div>
    </div>
  );
};
