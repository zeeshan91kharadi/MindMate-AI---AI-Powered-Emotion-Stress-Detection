
'use client';

import { useState } from 'react';
import { useCollection, useFirestore, useUser, useMemoFirebase, errorEmitter } from '@/firebase';
import { collection, query, orderBy, doc, deleteDoc } from 'firebase/firestore';
import { Button, buttonVariants } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PlusCircle, MessageSquare, Loader2, Trash2, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FirestorePermissionError } from '@/firebase/errors';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';

interface ChatSession {
  id: string;
  title: string;
  createdAt: any;
}

interface ChatSidebarProps {
  selectedSessionId: string | null;
  onSessionSelect: (id: string | null) => void;
}

export function ChatSidebar({ selectedSessionId, onSessionSelect }: ChatSidebarProps) {
  const { user } = useUser();
  const firestore = useFirestore();
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);

  const sessionsRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return collection(firestore, `users/${user.uid}/chatSessions`);
  }, [user, firestore]);

  const sessionsQuery = useMemoFirebase(() => {
    if (!sessionsRef) return null;
    return query(sessionsRef, orderBy('createdAt', 'desc'));
  }, [sessionsRef]);

  const { data: sessions, isLoading } = useCollection<ChatSession>(sessionsQuery);

  const handleNewChat = () => {
    onSessionSelect(null);
  };
  
  const handleDeleteSession = (sessionId: string) => {
    if (!user || !firestore) return;
    const sessionDocRef = doc(firestore, `users/${user.uid}/chatSessions`, sessionId);
    
    // Note: This only deletes the session doc, not the subcollection of messages.
    // For a production app, a Firebase Function would be needed to delete subcollections.
    deleteDoc(sessionDocRef).catch((error) => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: sessionDocRef.path,
        operation: 'delete',
      }));
    });

    if (selectedSessionId === sessionId) {
      onSessionSelect(null);
    }
    setSessionToDelete(null);
  };

  return (
    <>
      <div className="w-64 border-r bg-background/50 flex flex-col">
        <div className="p-2">
          <Button variant="outline" className="w-full justify-start" onClick={handleNewChat}>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Chat
          </Button>
        </div>
        <ScrollArea className="flex-1 p-2">
          <div className="space-y-1">
            {isLoading && (
              <div className="flex justify-center p-4">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            )}
            {sessions?.map((session) => (
              <div key={session.id} className="relative group">
                  <Button
                      variant="ghost"
                      className={cn(
                          'w-full justify-start truncate pr-8',
                          selectedSessionId === session.id && 'bg-accent text-accent-foreground'
                      )}
                      onClick={() => onSessionSelect(session.id)}
                  >
                      <MessageSquare className="mr-2 h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{session.title}</span>
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 opacity-0 group-hover:opacity-100">
                          <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => setSessionToDelete(session.id)} className="text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      <AlertDialog open={!!sessionToDelete} onOpenChange={(open) => !open && setSessionToDelete(null)}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                    This will permanently delete the chat session. This action cannot be undone.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => sessionToDelete && handleDeleteSession(sessionToDelete)} className={cn(buttonVariants({variant: 'destructive'}))}>
                    Delete
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
