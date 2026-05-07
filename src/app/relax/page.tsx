import { Techniques } from '@/components/relax/techniques';
import { Wind } from 'lucide-react';

export default function RelaxPage() {
  return (
    <div className="p-4 md:p-8">
        <header className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2"><Wind/> Relaxation Techniques</h1>
            <p className="text-muted-foreground">Find calm and peace with these guided exercises.</p>
        </header>
        <Techniques />
    </div>
  );
}
