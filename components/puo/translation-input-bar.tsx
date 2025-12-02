import { Mic, Plus, Send } from 'lucide-react';
import { useState } from 'react';

interface TranslationInputBarProps {
  onSend?: (message: string) => void;
  onMicPress?: () => void;
  onAttachment?: () => void;
  placeholder?: string;
  disabled?: boolean;
}

export function TranslationInputBar({ 
  onSend, 
  onMicPress,
  onAttachment,
  placeholder = 'Send message...',
  disabled = false
}: TranslationInputBarProps) {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSend?.(message);
      setMessage('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-white border-t border-gray-200">
      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            className="w-full px-4 py-3 pr-24 rounded-full border border-gray-300 focus:outline-none focus:border-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
            <button
              type="button"
              onClick={onMicPress}
              disabled={disabled}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Voice input"
            >
              <Mic className="size-5 text-gray-700" strokeWidth={1.5} />
            </button>
            <button
              type="button"
              onClick={onAttachment}
              disabled={disabled}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Add attachment"
            >
              <Plus className="size-5 text-gray-700" strokeWidth={1.5} />
            </button>
          </div>
        </div>
        {message.trim() && (
          <button
            type="submit"
            disabled={disabled}
            className="p-3 rounded-full bg-blue-600 hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Send message"
          >
            <Send className="size-5 text-white" strokeWidth={1.5} />
          </button>
        )}
      </div>
    </form>
  );
}
