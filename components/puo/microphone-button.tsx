import { Mic } from 'lucide-react';
import { useState } from 'react';

interface MicrophoneButtonProps {
  variant?: 'default' | 'glowing' | 'active';
  size?: 'small' | 'medium' | 'large';
  onClick?: () => void;
  onHoldStart?: () => void;
  onHoldEnd?: () => void;
}

export function MicrophoneButton({ 
  variant = 'default', 
  size = 'large',
  onClick,
  onHoldStart,
  onHoldEnd
}: MicrophoneButtonProps) {
  const [isPressed, setIsPressed] = useState(false);

  const sizeClasses = {
    small: 'w-16 h-16',
    medium: 'w-24 h-24',
    large: 'w-32 h-32'
  };

  const iconSizes = {
    small: 'w-6 h-6',
    medium: 'w-10 h-10',
    large: 'w-12 h-12'
  };

  const handleMouseDown = () => {
    setIsPressed(true);
    onHoldStart?.();
  };

  const handleMouseUp = () => {
    setIsPressed(false);
    onHoldEnd?.();
  };

  const handleClick = () => {
    onClick?.();
  };

  return (
    <div className="relative flex items-center justify-center">
      {/* Glowing ring animation */}
      {variant === 'glowing' && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="absolute size-48 rounded-full border-2 border-blue-500 opacity-20 animate-ping" />
          <div className="absolute size-40 rounded-full border-2 border-blue-500 opacity-30 animate-pulse" />
        </div>
      )}

      {/* Active pulsing ring */}
      {(variant === 'active' || isPressed) && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="absolute size-48 rounded-full bg-blue-500 opacity-10 animate-pulse" />
        </div>
      )}

      {/* Main button */}
      <button
        onClick={handleClick}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleMouseDown}
        onTouchEnd={handleMouseUp}
        className={`${sizeClasses[size]} rounded-full shadow-xl transition-all duration-300 flex items-center justify-center relative overflow-hidden`}
        style={{
          background: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)',
          transform: isPressed ? 'scale(0.95)' : 'scale(1)'
        }}
        aria-label="Microphone"
      >
        <Mic 
          className={`${iconSizes[size]} text-white`}
          strokeWidth={1.5}
          fill={variant === 'active' || isPressed ? 'white' : 'none'}
        />
      </button>
    </div>
  );
}
