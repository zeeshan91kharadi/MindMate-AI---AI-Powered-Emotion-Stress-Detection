'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { formatDistanceToNow } from 'date-fns';
import {
  addDoc,
  collection,
  orderBy,
  query,
  serverTimestamp,
  type Timestamp,
} from 'firebase/firestore';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2, Send } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useCollection, useFirestore, useUser, useMemoFirebase, errorEmitter } from '@/firebase';
import { FirestorePermissionError } from '@/firebase/errors';

const replySchema = z.object({
  content: z
    .string()
    .min(1, 'Reply cannot be empty.')
    .max(500, 'Reply cannot exceed 500 characters.'),
});

type CommunityReply = {
  id: string;
  content: string;
  createdAt?: Timestamp | null;
};

interface ReplySectionProps {
  postId: string;
}

export function ReplySection({ postId }: ReplySectionProps) {
  const { user } = useUser();
  const firestore = useFirestore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const repliesRef = useMemoFirebase(() => {
    if (!firestore || !postId) return null;
    return collection(firestore, `communityPosts/${postId}/replies`);
  }, [firestore, postId]);

  const repliesQuery = useMemoFirebase(() => {
    if (!repliesRef) return null;
    return query(repliesRef, orderBy('createdAt', 'asc'));
  }, [repliesRef]);

  const { data: replies, isLoading: repliesLoading } =
    useCollection<CommunityReply>(repliesQuery);

  const form = useForm<z.infer<typeof replySchema>>({
    resolver: zodResolver(replySchema),
    defaultValues: { content: '' },
  });

  const onSubmit = async (values: z.infer<typeof replySchema>) => {
    if (!user || !repliesRef || !firestore) return;
    setIsSubmitting(true);

    const newReply = {
      creatorId: user.uid,
      postId: postId,
      content: values.content.trim(),
      createdAt: serverTimestamp(),
    };

    addDoc(repliesRef, newReply)
      .then(() => {
        form.reset();
        toast({ title: 'Reply posted successfully!' });
      })
      .catch((error) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: repliesRef.path,
            operation: 'create',
            requestResourceData: newReply,
        }));
        toast({
          variant: 'destructive',
          title: 'Failed to post reply',
          description: 'Please check your permissions and try again.',
        });
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  return (
    <div className="mt-4 border-t pt-4">
      <h4 className="text-sm font-semibold mb-2">Replies</h4>
       <div className="space-y-4">
        {repliesLoading && (
          <Loader2 className="mx-auto my-4 h-6 w-6 animate-spin" />
        )}

        {replies?.map((reply) => (
          <div key={reply.id} className="p-3 rounded-lg bg-background/50 text-sm">
            <p className="text-xs text-muted-foreground mb-1">
              Anonymous •{' '}
              {reply.createdAt
                ? formatDistanceToNow(reply.createdAt.toDate(), {
                    addSuffix: true,
                  })
                : 'just now'}
            </p>
            <p>{reply.content}</p>
          </div>
        ))}

        {!repliesLoading && (!replies || replies.length === 0) && (
          <p className="text-xs text-center text-muted-foreground py-4">
            No replies yet.
          </p>
        )}
      </div>

      <Separator className='my-4' />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Textarea
                    placeholder="Write a reply..."
                    rows={2}
                    {...field}
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" size="sm" disabled={isSubmitting} className="w-full sm:w-auto">
            {isSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Send className="mr-2 h-4 w-4" />
            )}
            Reply
          </Button>
        </form>
      </Form>
    </div>
  );
}
