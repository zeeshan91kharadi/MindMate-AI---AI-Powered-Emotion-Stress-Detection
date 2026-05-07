'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useCollection, useFirestore, useUser, errorEmitter, useMemoFirebase } from '@/firebase';
import { addDoc, collection, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2, Send } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { FirestorePermissionError } from '@/firebase/errors';
import { PostCard } from './post-card';

const postSchema = z.object({
  content: z.string().min(1, 'Post cannot be empty.').max(500, 'Post cannot exceed 500 characters.'),
});

export type CommunityPost = {
  id: string;
  creatorId: string;
  content: string;
  createdAt: any;
};

export function CommunityWall() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const postsRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'communityPosts');
  }, [firestore]);
  
  const postsQuery = useMemoFirebase(() => {
    if (!postsRef) return null;
    return query(postsRef, orderBy('createdAt', 'desc'));
  }, [postsRef]);
  
  const { data: posts, isLoading: postsLoading } = useCollection<CommunityPost>(postsQuery);

  const form = useForm<z.infer<typeof postSchema>>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      content: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof postSchema>) => {
    if (!user || !postsRef) return;
    setIsSubmitting(true);
    const newPost = {
      creatorId: user.uid,
      content: values.content,
      createdAt: serverTimestamp(),
    };
    
    addDoc(postsRef, newPost)
      .then(() => {
        form.reset();
      })
      .catch(error => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: postsRef.path,
          operation: 'create',
          requestResourceData: newPost,
        }));
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  return (
    <div className="grid md:grid-cols-3 gap-8">
      <div className="md:col-span-2 space-y-4">
        {postsLoading && (
          <div className="flex justify-center p-8">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        )}
        {posts?.map(post => (
          <PostCard key={post.id} post={post} />
        ))}
        {!postsLoading && posts?.length === 0 && (
          <div className="text-center text-muted-foreground py-16">
            <p>No posts yet. Be the first to share something!</p>
          </div>
        )}
      </div>
      <div className="md:col-span-1">
        <Card className="glass-card sticky top-20">
          <CardHeader>
            <CardTitle>Create a New Post</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea
                          placeholder="What's on your mind?"
                          rows={4}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={isSubmitting} className="w-full">
                  {isSubmitting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="mr-2 h-4 w-4" />
                  )}
                  Post Anonymously
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
