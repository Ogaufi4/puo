import { Mic, X, MessageSquare } from 'lucide-react';

interface BottomIconBarProps {
  onSwap?: () => void;
  onMic?: () => void;
  onClose?: () => void;
}

export function BottomIconBar({ onSwap, onMic, onClose, isGlowing = false }: BottomIconBarProps & { isGlowing?: boolean }) {
  return (
    <div className="flex justify-center px-8 py-6">
      <div className="rounded-full px-8 py-4 flex items-center gap-8 shadow-xl relative"
        style={{
          background: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)'
        }}
      >
        <button
          onClick={onSwap}
          className="p-3 rounded-full bg-white/20 hover:bg-white/30 transition-colors relative z-10"
          aria-label="Swap languages"
        >
          <MessageSquare className="w-6 h-6 text-white" strokeWidth={1.5} />
        </button>
        
        <div className="relative">
          {isGlowing && (
            <>
              <div className="absolute inset-0 rounded-full bg-white/30 animate-ping" />
              <div className="absolute inset-[-4px] rounded-full bg-white/20 animate-pulse" />
            </>
          )}
          <button
            onClick={onMic}
            className="p-5 rounded-full bg-white/30 hover:bg-white/40 transition-all transform hover:scale-105 relative z-10"
            aria-label="Voice input"
          >
            <Mic className="w-8 h-8 text-white" strokeWidth={1.5} />
          </button>
        </div>
        
        <button
          onClick={onClose}
          className="p-3 rounded-full bg-white/20 hover:bg-white/30 transition-colors relative z-10"
          aria-label="Close"
        >
          <X className="w-6 h-6 text-white" strokeWidth={1.5} />
        </button>
      </div>
    </div>
  );
}
