import { ChevronLeft, Menu, MessageSquare, Mic } from 'lucide-react';

interface PuoHeaderProps {
  onBack?: () => void;
  title?: string;
  rightIcon?: 'menu' | 'message' | 'mic';
  onRightClick?: () => void;
}

export function PuoHeader({ onBack, title, rightIcon, onRightClick }: PuoHeaderProps) {
  return (
    <header className="flex items-center justify-between p-4">
      <button
        onClick={onBack}
        className="size-10 flex items-center justify-center rounded-full bg-white shadow-sm hover:shadow-md transition-shadow"
        aria-label="Go back"
      >
        <ChevronLeft className="size-5 text-gray-700" strokeWidth={1.5} />
      </button>

      {title && (
        <h1 className="flex-1 text-center mx-4 text-lg font-medium">{title}</h1>
      )}

      {rightIcon && (
        <button
          onClick={onRightClick}
          className="size-10 flex items-center justify-center rounded-full bg-white shadow-sm hover:shadow-md transition-shadow"
          aria-label={rightIcon === 'menu' ? 'Menu' : rightIcon === 'message' ? 'Messages' : 'Microphone'}
        >
          {rightIcon === 'menu' && <Menu className="size-5 text-gray-700" strokeWidth={1.5} />}
          {rightIcon === 'message' && <MessageSquare className="size-5 text-gray-700" strokeWidth={1.5} />}
          {rightIcon === 'mic' && <Mic className="size-5 text-gray-700" strokeWidth={1.5} />}
        </button>
      )}
      {!rightIcon && <div className="w-10" />}
    </header>
  );
}
