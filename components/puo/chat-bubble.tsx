import { Copy, ThumbsUp, Volume2, MessageSquare } from 'lucide-react';
import { Markdown } from '../markdown';

interface ChatBubbleProps {
  message: string;
  type: 'outgoing' | 'incoming';
  showActions?: boolean;
  onCopy?: () => void;
  onLike?: () => void;
  onSpeak?: () => void;
  onReply?: () => void;
}

export function ChatBubble({ 
  message, 
  type, 
  showActions = false,
  onCopy,
  onLike,
  onSpeak,
  onReply
}: ChatBubbleProps) {
  return (
    <div className={`flex ${type === 'outgoing' ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-[80%] ${type === 'outgoing' ? 'order-2' : 'order-1'}`}>
        <div
          className={`rounded-3xl px-5 py-3 shadow-sm ${
            type === 'outgoing'
              ? 'bg-blue-600 text-white rounded-tr-md'
              : 'bg-white text-gray-800 rounded-tl-md'
          }`}
        >
          {type === 'incoming' ? (
            <div className="prose prose-sm max-w-none prose-p:leading-relaxed prose-pre:p-0 prose-headings:mt-4 prose-headings:mb-2">
              <Markdown>{message}</Markdown>
            </div>
          ) : (
            <p className="leading-relaxed">{message}</p>
          )}
        </div>
        
        {showActions && type === 'incoming' && (
          <div className="flex items-center gap-3 mt-2 px-2">
            <button 
              onClick={onCopy}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Copy message"
            >
              <Copy className="size-4 text-blue-500" strokeWidth={1.5} />
            </button>
            <button 
              onClick={onLike}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Like message"
            >
              <ThumbsUp className="size-4 text-blue-500" strokeWidth={1.5} />
            </button>
            <button 
              onClick={onSpeak}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Speak message"
            >
              <Volume2 className="size-4 text-blue-500" strokeWidth={1.5} />
            </button>
            <button 
              onClick={onReply}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Reply to message"
            >
              <MessageSquare className="size-4 text-blue-500" strokeWidth={1.5} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
