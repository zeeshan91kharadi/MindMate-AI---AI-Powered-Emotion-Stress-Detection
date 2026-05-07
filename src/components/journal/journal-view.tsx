
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from 'date-fns';

import { Button, buttonVariants } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Trash2 } from "lucide-react";
import { analyzeTextEmotion } from "@/ai/flows/text-emotion-analysis";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { useCollection, useFirestore, useUser, useMemoFirebase, errorEmitter } from "@/firebase";
import { addDoc, collection, serverTimestamp, query, orderBy, Timestamp, doc, deleteDoc } from "firebase/firestore";
import { FirestorePermissionError } from "@/firebase/errors";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../ui/alert-dialog";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  entryText: z.string().min(10, "Entry must be at least 10 characters long."),
});

type JournalEntry = {
    id: string;
    date: Timestamp;
    text: string;
    emotionalState: string;
    stressLevel: number;
    userId: string;
};

export function JournalView() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();

  const entriesRef = useMemoFirebase(() => {
      if (!user || !firestore) return null;
      return collection(firestore, `users/${user.uid}/moodJournalEntries`);
  }, [user, firestore]);

  const entriesQuery = useMemoFirebase(() => {
    if (!entriesRef) return null;
    return query(entriesRef, orderBy("date", "desc"));
  }, [entriesRef]);

  const { data: entries, isLoading: entriesLoading } = useCollection<JournalEntry>(entriesQuery);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      entryText: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!entriesRef || !user) return;
    setIsLoading(true);
    try {
        const analysis = await analyzeTextEmotion({ text: values.entryText });
        const newEntry = {
            userId: user.uid,
            date: serverTimestamp(),
            text: values.entryText,
            emotionalState: analysis.emotionalState,
            stressLevel: analysis.stressLevel
        };

        addDoc(entriesRef, newEntry).catch(error => {
          errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: entriesRef.path,
            operation: 'create',
            requestResourceData: newEntry
          }));
        });
        
        form.reset();
        toast({
            title: "Entry Saved",
            description: "Your mood journal has been updated.",
        });
    } catch (error) {
        console.error("Failed to save journal entry:", error);
        toast({
            variant: "destructive",
            title: "Save Failed",
            description: "Could not save your entry. Please try again.",
        });
    } finally {
        setIsLoading(false);
    }
  }

  const handleDeleteEntry = async (entryId: string) => {
    if (!user || !firestore) return;

    const entryDocRef = doc(firestore, `users/${user.uid}/moodJournalEntries`, entryId);
    await deleteDoc(entryDocRef).catch((error) => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: entryDocRef.path,
        operation: 'delete'
      }));
    });

    toast({
        title: "Entry Deleted",
        description: "Your journal entry has been removed.",
    });
  };

  const getBadgeVariant = (stressLevel: number) => {
    if (stressLevel > 70) return 'destructive';
    if (stressLevel > 40) return 'secondary';
    return 'default';
  }

  return (
    <div className="grid md:grid-cols-3 gap-8">
      <div className="md:col-span-1">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>New Entry</CardTitle>
            <CardDescription>How are you feeling right now?</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="entryText"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea placeholder="Describe your day..." {...field} rows={8} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Entry
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
      <div className="md:col-span-2">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Past Entries</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 max-h-[60vh] overflow-y-auto">
            {entriesLoading ? (
                <div className="flex justify-center items-center h-40">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </div>
            ) : entries?.length === 0 ? (
                <p className="text-muted-foreground text-center pt-8">No entries yet.</p>
            ) : (
                entries?.map(entry => (
                    <div key={entry.id} className="p-4 rounded-lg border bg-background/50 group relative">
                        <div className="flex justify-between items-center mb-2">
                            <p className="font-semibold">{entry.date ? format(entry.date.toDate(), 'MMMM d, yyyy') : 'Just now'}</p>
                            <Badge variant={getBadgeVariant(entry.stressLevel)}>
                                {entry.emotionalState} - {entry.stressLevel}
                            </Badge>
                        </div>
                        <p className="text-muted-foreground pr-10">{entry.text}</p>
                        
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100">
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This will permanently delete this journal entry. This action cannot be undone.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeleteEntry(entry.id)} className={cn(buttonVariants({variant: 'destructive'}))}>
                                        Delete
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

    