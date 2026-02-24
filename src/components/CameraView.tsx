import React, { useRef, useEffect, useState } from 'react';
import { Camera, RefreshCw, Zap, ZoomIn, ZoomOut } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CameraViewProps {
  onCapture: (base64: string) => void;
  isAnalyzing: boolean;
}

export const CameraView: React.FC<CameraViewProps> = ({ onCapture, isAnalyzing }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [zoom, setZoom] = useState(1);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    startCamera();
    return () => {
      stream?.getTracks().forEach(track => track.stop());
    };
  }, []);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      setError('Could not access camera. Please ensure permissions are granted.');
      console.error(err);
    }
  };

  const capture = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const base64 = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
        onCapture(base64);
      }
    }
  };

  return (
    <div className="relative w-full h-full bg-black overflow-hidden flex items-center justify-center">
      {error ? (
        <div className="text-center p-6">
          <p className="text-warning mb-4">{error}</p>
          <button 
            onClick={startCamera}
            className="px-4 py-2 bg-accent-cyan text-bg-deep rounded-full font-display flex items-center gap-2 mx-auto"
          >
            <RefreshCw size={18} /> Retry
          </button>
        </div>
      ) : (
        <>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
            style={{ transform: `scale(${zoom})` }}
          />
          <canvas ref={canvasRef} className="hidden" />

          {/* Overlays */}
          <div className="absolute inset-0 pointer-events-none border-[2px] border-accent-cyan/20 m-4 rounded-2xl">
            <div className="absolute top-4 left-4 flex items-center gap-2 text-accent-cyan font-display text-xs bg-bg-deep/60 px-2 py-1 rounded-md backdrop-blur-sm">
              <div className="w-2 h-2 rounded-full bg-accent-cyan animate-pulse" />
              LIVE FEED
            </div>
          </div>

          {/* Controls */}
          <div className="absolute bottom-8 left-0 right-0 flex flex-col items-center gap-6 pointer-events-none">
            {/* Zoom Controls */}
            <div className="flex items-center gap-4 bg-bg-deep/80 backdrop-blur-md p-2 rounded-full border border-white/10 pointer-events-auto">
              <button 
                onClick={() => setZoom(prev => Math.max(1, prev - 0.2))}
                className="p-2 hover:text-accent-cyan transition-colors"
              >
                <ZoomOut size={20} />
              </button>
              <span className="text-xs font-mono w-12 text-center">{zoom.toFixed(1)}x</span>
              <button 
                onClick={() => setZoom(prev => Math.min(3, prev + 0.2))}
                className="p-2 hover:text-accent-cyan transition-colors"
              >
                <ZoomIn size={20} />
              </button>
            </div>

            {/* Main Action */}
            <div className="flex items-center gap-8 pointer-events-auto">
              <button 
                onClick={capture}
                disabled={isAnalyzing}
                className={`w-20 h-20 rounded-full border-4 border-white flex items-center justify-center transition-all active:scale-95 ${isAnalyzing ? 'opacity-50 cursor-not-allowed' : 'hover:border-accent-cyan'}`}
              >
                <div className={`w-16 h-16 rounded-full bg-white flex items-center justify-center ${isAnalyzing ? 'animate-pulse' : ''}`}>
                  <Camera size={32} className="text-bg-deep" />
                </div>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
