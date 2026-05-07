import { JournalView } from '@/components/journal/journal-view';
import { BookText } from 'lucide-react';

export default function JournalPage() {
  return (
    <div className="p-4 md:p-8">
        <header className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2"><BookText/> Mood Journal</h1>
            <p className="text-muted-foreground">Track your mood, thoughts, and stress triggers over time.</p>
        </header>
        <JournalView />
    </div>
  );
}
