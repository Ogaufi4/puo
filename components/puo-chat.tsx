'use client';

import type { Attachment, Message } from 'ai';
import { useChat } from 'ai/react';
import { useState } from 'react';
import useSWR, { useSWRConfig } from 'swr';

import { ChatHeader } from '@/components/chat-header';
import type { Vote } from '@/lib/db/schema';
import { fetcher } from '@/lib/utils';

import { Block } from './block';
import { MultimodalInput } from './multimodal-input';
import { Messages } from './messages';
import { VisibilityType } from './visibility-selector';
import { useBlockSelector } from '@/hooks/use-block';
import { ChatBubble, TranslationInputBar, MicrophoneButton, PuoHeader, BottomIconBar } from './puo';

export function PuoChat({
  id,
  initialMessages,
  selectedModelId,
  selectedVisibilityType,
  isReadonly,
}: {
  id: string;
  initialMessages: Array<Message>;
  selectedModelId: string;
  selectedVisibilityType: VisibilityType;
  isReadonly: boolean;
}) {
  const { mutate } = useSWRConfig();

  const {
    messages,
    setMessages,
    handleSubmit,
    input,
    setInput,
    append,
    isLoading,
    stop,
    reload,
  } = useChat({
    api: '/api/chat', // corrected endpoint
    id,
    body: { id, modelId: selectedModelId },
    initialMessages,
    experimental_throttle: 100,
    onFinish: () => {
      mutate('/api/history');
    },
  });

  const { data: votes } = useSWR<Array<Vote>>(
    `/api/vote?chatId=${id}`,
    fetcher,
  );

  const [attachments, setAttachments] = useState<Array<Attachment>>([]);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [viewMode, setViewMode] = useState<'voice' | 'chat'>('voice');
  const isBlockVisible = useBlockSelector((state) => state.isVisible);

  const handleSendMessage = (text: string) => {
    if (text.trim() && !isLoading) {
      append({
        role: 'user',
        content: text,
      });
      setViewMode('chat'); // Switch to chat when sending a message
    }
  };

  const handleCopyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    // You can add a toast notification here
  };

  const handleSpeakMessage = (content: string) => {
    // Implement text-to-speech functionality
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(content);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleVoiceInput = () => {
    setIsVoiceActive(!isVoiceActive);
    
    // Implement speech-to-text functionality
    if ('webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US'; // You can change this to 'tn-BW' for Setswana when available
      
      recognition.onstart = () => {
        console.log('Voice recognition started');
        setIsVoiceActive(true);
      };
      
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        console.log('Transcript:', transcript);
        setInput(transcript);
        setIsVoiceActive(false);
        // Optional: Automatically send or just switch to chat
        // handleSendMessage(transcript); 
      };
      
      recognition.onerror = (event: any) => {
        if (event.error === 'no-speech') {
          console.log('No speech detected.');
        } else {
          console.error('Speech recognition error:', event.error);
        }
        setIsVoiceActive(false);
      };
      
      recognition.onend = () => {
        console.log('Voice recognition ended');
        setIsVoiceActive(false);
      };
      
      if (!isVoiceActive) {
        recognition.start();
      } else {
        recognition.stop();
      }
    } else {
      console.log('Speech recognition not supported');
      alert('Voice recognition is not supported in your browser. Please use Chrome or Edge.');
    }
  };

  return (
    <>
      <div className="flex flex-col min-w-0 h-dvh bg-gray-50">
        <PuoHeader 
          title="PuoAi Chat"
          rightIcon="mic"
          onRightClick={() => {
            if (viewMode === 'chat') {
              setViewMode('voice');
            } else {
              handleVoiceInput();
            }
          }}
        />
        
        {viewMode === 'voice' ? (
          <div className="flex-1 flex flex-col items-center justify-center relative">
            <div className="flex-1 flex items-center justify-center w-full">
               {/* Optional: Add a large visual indicator or just keeping it clean as per request */}
               <div className="text-center space-y-4">
                 <h2 className="text-2xl font-semibold text-gray-700">Tap to Speak</h2>
                 <p className="text-gray-500">I&apos;m listening...</p>
               </div>
            </div>
            <div className="pb-12">
              <BottomIconBar 
                onSwap={() => setViewMode('chat')}
                onMic={handleVoiceInput}
                onClose={() => console.log('Close')}
                isGlowing={true}
              />
            </div>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-4 py-6">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full gap-6">
                  <div className="text-center text-gray-500">
                    <p className="text-lg mb-2">Start a conversation</p>
                    <p className="text-sm">Type a message or use voice input</p>
                  </div>
                  
                  {/* Suggested Actions */}
                  <div className="w-full max-w-2xl grid sm:grid-cols-2 gap-3">
                    <button
                      onClick={() => handleSendMessage('Translate "Hello, how are you?" to Setswana')}
                      className="text-left border border-gray-300 rounded-3xl px-5 py-4 text-sm flex flex-col gap-1 bg-white hover:bg-gray-50 hover:border-blue-400 transition-all"
                    >
                      <span className="font-medium text-gray-900">Translate to Setswana</span>
                      <span className="text-gray-600">&ldquo;Hello, how are you?&rdquo;</span>
                    </button>
                    
                    <button
                      onClick={() => handleSendMessage('How do I say "thank you" in Setswana?')}
                      className="text-left border border-gray-300 rounded-3xl px-5 py-4 text-sm flex flex-col gap-1 bg-white hover:bg-gray-50 hover:border-blue-400 transition-all"
                    >
                      <span className="font-medium text-gray-900">Learn Setswana</span>
                      <span className="text-gray-600">How do I say &ldquo;thank you&rdquo;?</span>
                    </button>
                    
                    <button
                      onClick={() => handleSendMessage('Teach me basic Setswana greetings')}
                      className="text-left border border-gray-300 rounded-3xl px-5 py-4 text-sm flex flex-col gap-1 bg-white hover:bg-gray-50 hover:border-blue-400 transition-all"
                    >
                      <span className="font-medium text-gray-900">Basic Greetings</span>
                      <span className="text-gray-600">Teach me Setswana greetings</span>
                    </button>
                    
                    <button
                      onClick={() => handleSendMessage('What are common Setswana phrases for travelers?')}
                      className="text-left border border-gray-300 rounded-3xl px-5 py-4 text-sm flex flex-col gap-1 bg-white hover:bg-gray-50 hover:border-blue-400 transition-all"
                    >
                      <span className="font-medium text-gray-900">Travel Phrases</span>
                      <span className="text-gray-600">Common phrases for travelers</span>
                    </button>
                  </div>
                </div>
              )}
              
              {messages.map((message, index) => (
                <ChatBubble
                  key={message.id}
                  message={typeof message.content === 'string' ? message.content : JSON.stringify(message.content)}
                  type={message.role === 'user' ? 'outgoing' : 'incoming'}
                  showActions={message.role === 'assistant' && index === messages.length - 1}
                  onCopy={() => handleCopyMessage(typeof message.content === 'string' ? message.content : '')}
                  onLike={() => console.log('Liked message:', message.id)}
                  onSpeak={() => handleSpeakMessage(typeof message.content === 'string' ? message.content : '')}
                  onReply={() => setInput(`Reply to: ${typeof message.content === 'string' ? message.content.substring(0, 50) : ''}...`)}
                />
              ))}
              
              {isLoading && (
                <ChatBubble
                  message="Thinking..."
                  type="incoming"
                  showActions={false}
                />
              )}
            </div>
            
            {!isReadonly && (
              <TranslationInputBar
                onSend={handleSendMessage}
                onMicPress={handleVoiceInput}
                onAttachment={() => console.log('Attachment clicked')}
                placeholder="Type your message..."
                disabled={isLoading}
              />
            )}
          </>
        )}
      </div>

      <Block
        chatId={id}
        input={input}
        setInput={setInput}
        handleSubmit={handleSubmit}
        isLoading={isLoading}
        stop={stop}
        attachments={attachments}
        setAttachments={setAttachments}
        append={append}
        messages={messages}
        setMessages={setMessages}
        reload={reload}
        votes={votes}
        isReadonly={isReadonly}
      />
    </>
  );
}
