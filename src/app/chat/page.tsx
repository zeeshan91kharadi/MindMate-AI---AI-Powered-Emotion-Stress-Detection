
'use client';

import { useState } from 'react';
import { ChatSidebar } from '@/components/chat/chat-sidebar';
import { ChatInterface } from '@/components/chat/chat-interface';

export default function ChatPage() {
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);

  return (
    <div className="flex h-[calc(100vh-theme(spacing.14))]">
      <ChatSidebar
        selectedSessionId={selectedSessionId}
        onSessionSelect={setSelectedSessionId}
      />
      <div className="flex-1 flex flex-col">
        <ChatInterface
          sessionId={selectedSessionId}
          setSessionId={setSelectedSessionId}
        />
      </div>
    </div>
  );
}
