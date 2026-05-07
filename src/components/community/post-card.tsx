'use client';

import { useState } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { CommunityPost } from './community-wall';
import { ReplySection } from './reply-section';

interface PostCardProps {
  post: CommunityPost;
}

export function PostCard({ post }: PostCardProps) {
  const [showReplies, setShowReplies] = useState(false);

  return (
    <Card className="glass-card">
      <CardContent className="p-6">
        <p className="text-sm text-muted-foreground mb-2">
          Posted {post.createdAt ? formatDistanceToNow(post.createdAt.toDate(), { addSuffix: true }) : 'just now'}
        </p>
        <p className="whitespace-pre-wrap">{post.content}</p>
      </CardContent>
      <CardFooter className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => setShowReplies(!showReplies)}>
          <MessageSquare className="mr-2 h-4 w-4" />
          Reply
        </Button>
      </CardFooter>
      {showReplies && (
        <div className="px-6 pb-4">
          <ReplySection postId={post.id} />
        </div>
      )}
    </Card>
  );
}
