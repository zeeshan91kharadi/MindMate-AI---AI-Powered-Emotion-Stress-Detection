
'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, BrainCircuit, Edit, Bot, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { aiChatCompanion } from '@/ai/flows/ai-chat-companion';
import { useCollection, useFirestore, useUser, useMemoFirebase, errorEmitter } from '@/firebase';
import { collection, addDoc, serverTimestamp, query, orderBy, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { FirestorePermissionError } from '@/firebase/errors';
import { ChatInput } from './chat-input';
import { Button } from '../ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';
import { Textarea } from '../ui/textarea';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatMessage extends Message {
  id: string;
  timestamp?: any;
}

interface ChatInterfaceProps {
  sessionId: string | null;
  setSessionId: (id: string | null) => void;
}

export function ChatInterface({ sessionId, setSessionId }: ChatInterfaceProps) {
  const { user } = useUser();
  const firestore = useFirestore();
  const [isLoading, setIsLoading] = useState(false);
  const [editingMessage, setEditingMessage] = useState<ChatMessage | null>(null);

  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const messagesRef = useMemoFirebase(() => {
    if (!user || !firestore || !sessionId) return null;
    return collection(firestore, `users/${user.uid}/chatSessions/${sessionId}/chatMessages`);
  }, [user, firestore, sessionId]);

  const messagesQuery = useMemoFirebase(() => {
    if (!messagesRef) return null;
    return query(messagesRef, orderBy('timestamp', 'asc'));
  }, [messagesRef]);

  const { data: messages, isLoading: messagesLoading } = useCollection<ChatMessage>(messagesQuery);

  const localMessages = useMemo(() => {
    if (messages && messages.length > 0) {
      return messages;
    }
    if (sessionId) { // Only show initial message in an active session
      return [{
        id: 'initial',
        role: 'assistant',
        content: "Hello! I'm your AI Primary Psychologist. How can I help you today?",
      } as ChatMessage];
    }
    return []; // No messages if no session is selected
  }, [messages, sessionId]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight;
      }
    }
  }, [localMessages, isLoading]);
  
  const handleSaveEdit = async (newContent: string) => {
    if (!editingMessage || !user || !firestore || !sessionId || !messages) return;
    setIsLoading(true);

    const messageRef = doc(firestore, `users/${user.uid}/chatSessions/${sessionId}/chatMessages`, editingMessage.id);
    updateDoc(messageRef, { content: newContent }).catch((error) => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: messageRef.path,
        operation: 'update',
        requestResourceData: { content: newContent },
      }));
    });
    setEditingMessage(null);

    const editedMessageIndex = messages.findIndex(m => m.id === editingMessage.id);
    
    const currentSessionId = sessionId;

    if (editedMessageIndex !== -1) {
      const nextMessage = messages[editedMessageIndex + 1];
      if (nextMessage && nextMessage.role === 'assistant') {
        const nextMessageRef = doc(firestore, `users/${user.uid}/chatSessions/${sessionId}/chatMessages`, nextMessage.id);
        deleteDoc(nextMessageRef).catch(error => {
            errorEmitter.emit('permission-error', new FirestorePermissionError({
                path: nextMessageRef.path,
                operation: 'delete',
            }));
        });
      }
      
      const historyUpToEdit = messages.slice(0, editedMessageIndex).map(m => ({ role: m.role, content: m.content }));
      historyUpToEdit.push({ role: 'user', content: newContent });

      try {
        const result = await aiChatCompanion({
          message: newContent,
          chatHistory: historyUpToEdit.slice(0, -1),
        });
        
        if (currentSessionId) {
            handleAssistantResponse(result.response, currentSessionId);
        }

      } catch (error) {
        console.error('Chat error after edit:', error);
      }
    }
    setIsLoading(false);
  };

  const handleAssistantResponse = async (response: string, currentSessionId: string | null) => {
    if (!user || !firestore || !currentSessionId) return;

    const currentMessagesRef = collection(firestore, `users/${user.uid}/chatSessions/${currentSessionId}/chatMessages`);
    const assistantMessage = { 
        role: 'assistant' as const, 
        content: response,
        timestamp: serverTimestamp(), 
        userId: user.uid
    };

    addDoc(currentMessagesRef, assistantMessage).catch((error) => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: currentMessagesRef.path,
          operation: 'create',
          requestResourceData: assistantMessage,
        })
      );
    });
  };

  const handleSend = async (inputText: string) => {
    if (inputText.trim() === '' || !user || !firestore) {
        return;
    }
    setIsLoading(true);

    let currentSessionId = sessionId;

    // Create a new session if one doesn't exist
    if (!currentSessionId) {
      const sessionsRef = collection(firestore, `users/${user.uid}/chatSessions`);
      const newSessionData = {
        userId: user.uid,
        title: inputText.substring(0, 40) + '...',
        createdAt: serverTimestamp(),
      };
      const newSessionDoc = await addDoc(sessionsRef, newSessionData).catch((error) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: sessionsRef.path,
            operation: 'create',
            requestResourceData: newSessionData,
          })
        );
        return null;
      });

      if (!newSessionDoc) {
        setIsLoading(false);
        return;
      }
      currentSessionId = newSessionDoc.id;
      setSessionId(currentSessionId);
    }
    
    if (!currentSessionId) {
        setIsLoading(false);
        return;
    }

    const currentMessagesRef = collection(firestore, `users/${user.uid}/chatSessions/${currentSessionId}/chatMessages`);
    const userMessage = { role: 'user' as const, content: inputText, timestamp: serverTimestamp(), userId: user.uid };

    addDoc(currentMessagesRef, userMessage).catch((error) => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: currentMessagesRef.path,
          operation: 'create',
          requestResourceData: userMessage,
        })
      );
    });

    try {
      const chatHistory = messages?.map((m) => ({ role: m.role, content: m.content })) ?? [];
      const result = await aiChatCompanion({
        message: inputText,
        chatHistory: chatHistory,
      });

      handleAssistantResponse(result.response, currentSessionId);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = { role: 'assistant' as const, content: "I'm sorry, I encountered an error. Please try again.", timestamp: serverTimestamp(), userId: user.uid };
      addDoc(currentMessagesRef, errorMessage);
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="flex flex-col h-full">
      <header className="p-4 border-b flex justify-between items-center gap-4">
        <h1 className="text-xl font-bold flex items-center gap-2">
          AI Primary Psychologist
        </h1>
      </header>
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-6">
          {(messagesLoading && sessionId) && (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          )}
          {!sessionId && (
             <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-8">
                <BrainCircuit className="w-16 h-16 mb-4" />
                <h2 className="text-lg font-semibold">Welcome to your AI Primary Psychologist</h2>
                <p>Start a new chat or select a previous conversation to begin.</p>
            </div>
          )}
          {localMessages.map((message) => (
            <div
              key={message.id}
              className={cn(
                'flex items-start gap-3 group',
                message.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              {message.role === 'assistant' && (
                <Avatar className="w-8 h-8 border-2 border-primary">
                  <AvatarFallback className="bg-transparent">
                    <Bot className="w-5 h-5 text-primary" />
                  </AvatarFallback>
                </Avatar>
              )}
              <div
                className={cn(
                  'max-w-prose rounded-lg p-3 text-sm whitespace-pre-wrap relative',
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                )}
              >
                {message.content}
              </div>
               {message.role === 'user' && (
                 <>
                  <div className="flex-col self-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditingMessage(message)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                  <Avatar className="w-8 h-8 self-end">
                    <AvatarFallback><User /></AvatarFallback>
                  </Avatar>
                 </>
              )}
            </div>
          ))}
          {isLoading && !editingMessage && (
            <div className="flex items-start gap-3 justify-start">
              <Avatar className="w-8 h-8 border-2 border-primary">
                <AvatarFallback className="bg-transparent">
                  <Bot className="w-5 h-5 text-primary" />
                </AvatarFallback>
              </Avatar>
              <div className="bg-muted rounded-lg p-3">
                <Loader2 className="w-5 h-5 animate-spin" />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
       {editingMessage && (
          <AlertDialog open onOpenChange={() => setEditingMessage(null)}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Edit Message</AlertDialogTitle>
                <AlertDialogDescription>
                  Make changes to your message below. Regenerating the AI response will follow.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <Textarea
                defaultValue={editingMessage.content}
                id="edit-textarea"
                rows={5}
              />
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => {
                  const newContent = (document.getElementById('edit-textarea') as HTMLTextAreaElement).value;
                  handleSaveEdit(newContent);
                }}>Save & Regenerate</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      <div className="p-4 border-t bg-background/50 backdrop-blur-sm">
        <ChatInput
          onSend={handleSend}
          disabled={isLoading || messagesLoading || !user}
        />
      </div>
    </div>
  );
}
