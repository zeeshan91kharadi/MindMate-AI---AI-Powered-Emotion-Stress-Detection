
'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, Mic } from 'lucide-react';
import { cn } from '@/lib/utils';
import { VoiceRecorder } from './voice-recorder';

interface ChatInputProps {
  onSend: (text: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (input.trim() === '') return;
    onSend(input);
    setInput('');
  };

  const handleTranscription = (text: string) => {
    setInput(text);
    onSend(text);
    setInput('');
  };

  return (
    <div className="relative flex items-center">
      <Input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && !disabled && handleSend()}
        placeholder="Type your message..."
        className="pr-20"
        disabled={disabled}
      />
      <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center">
        <VoiceRecorder onTranscription={handleTranscription} disabled={disabled} />
        <Button
          type="submit"
          size="icon"
          onClick={handleSend}
          disabled={disabled || input.trim() === ''}
          className="h-8 w-8"
        >
          <Send className="h-4 w-4" />
           <span className="sr-only">Send message</span>
        </Button>
      </div>
    </div>
  );
}
