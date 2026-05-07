import { Wind, Waves, Leaf } from 'lucide-react';
import Link from 'next/link';

const suggestions = [
  { name: 'Breathing Exercise', icon: Wind, description: 'Calm your mind with deep breaths.' },
  { name: 'Meditation', icon: Leaf, description: 'Find your center and peace.' },
  { name: 'Grounding Technique', icon: Waves, description: 'Connect with the present moment.' },
];

export function RelaxationSuggestions() {
  return (
    <div className="space-y-4">
      {suggestions.map((suggestion) => (
        <Link href="/relax" key={suggestion.name} className="block group">
            <div className="flex items-center gap-4 p-3 rounded-md transition-colors hover:bg-primary/10">
                <div className="p-2 bg-primary/20 rounded-md">
                    <suggestion.icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                    <h4 className="font-semibold">{suggestion.name}</h4>
                    <p className="text-sm text-muted-foreground">{suggestion.description}</p>
                </div>
            </div>
        </Link>
      ))}
    </div>
  );
}
