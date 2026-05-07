'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Leaf, Waves, Wind, Link as LinkIcon, Copy } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

const BreathingExercise = () => {
    const [text, setText] = useState('Get Ready...');
    const [count, setCount] = useState(4);

    useEffect(() => {
        const stages = ['Inhale', 'Hold', 'Exhale', 'Hold'];
        let currentStage = -1;
    
        const interval = setInterval(() => {
            setCount(prevCount => {
                if (prevCount > 1) {
                    return prevCount - 1;
                } else {
                    currentStage = (currentStage + 1) % 4;
                    setText(stages[currentStage]);
                    return 4;
                }
            });
        }, 1000);

        // Initial start
        const startTimeout = setTimeout(() => {
            currentStage = 0;
            setText(stages[0]);
            setCount(4);
        }, 2000);
    
        return () => {
            clearInterval(interval)
            clearTimeout(startTimeout);
        };
    }, []);

    return (
    <div className="flex flex-col items-center justify-center gap-4 py-8">
        <div className="relative w-48 h-48">
            <div 
                className="w-full h-full rounded-full bg-primary/20"
                style={{ animation: 'pulse 16s ease-in-out infinite' }}
            ></div>
            <div className="absolute inset-0 flex items-center justify-center">
                <div 
                    className="w-24 h-24 bg-primary rounded-full"
                    style={{ animation: 'breathe 16s ease-in-out infinite' }}
                ></div>
            </div>
        </div>
        <p className="text-3xl font-medium text-center h-10 tabular-nums">
          <span>{text}: {count}</span>
        </p>
        <style jsx>{`
            @keyframes breathe {
                0%, 100% { transform: scale(1.2); } /* Inhale end / start */
                25% { transform: scale(1.2); } /* Hold In */
                50% { transform: scale(0.8); } /* Exhale end */
                75% { transform: scale(0.8); } /* Hold Out */
            }
            @keyframes pulse {
                0%, 100% { opacity: 0.4; }
                25% { opacity: 0.4; }
                50% { opacity: 0.2; }
                75% { opacity: 0.2; }
            }
        `}</style>
    </div>
);
}

const meditationLinks = [
  { title: '10-Minute Meditation for Beginners', url: 'https://youtu.be/cI4ryatVkKw?si=iMRuOFl1UVf3-NZW' },
  { title: 'Guided Meditation for Anxiety and Stress', url: 'https://youtu.be/C1wFmXGPbUg?si=qAVEaDgTbPNArizv' },
  { title: '1-Minute Calming Meditation Short', url: 'https://youtube.com/shorts/D0h9v0K99kM?si=4lIP6OVr5a_zIh_b' },
  { title: 'Quick Anxiety Relief Short', url: 'https://youtube.com/shorts/1NQwPFDvGvg?si=DOJRwqj453pp6T7F' },
  { title: 'Let Go of Overthinking Short', url: 'https://youtube.com/shorts/sbib9tRlNNg?si=0gafK36lxybTh_D_' },
  { title: '30-Second Mindfulness Short', url: 'https://youtube.com/shorts/TYGtaKydZaY?si=nTEUJijWF3qIiohL' },
];

const GuidedMeditationContent = () => {
    const { toast } = useToast();

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast({
            title: "Copied to clipboard!",
            description: "You can now paste the link in your browser.",
        });
    };

    return (
        <div className="space-y-3 py-4">
            {meditationLinks.map((link, index) => (
                <div key={index} className="flex items-center justify-between gap-2 p-2 rounded-md bg-muted/50">
                    <Link href={link.url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium hover:underline truncate">
                        {link.title}
                    </Link>
                    <div className='flex items-center gap-1'>
                        <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                           <Link href={link.url} target="_blank" rel="noopener noreferrer">
                             <LinkIcon className="h-4 w-4" />
                           </Link>
                        </Button>
                         <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => copyToClipboard(link.url)}>
                            <Copy className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            ))}
        </div>
    );
};


const techniques = [
  {
    name: 'Box Breathing',
    icon: Wind,
    description: 'A simple technique to calm your nervous system.',
    content: <BreathingExercise />,
    details: 'Inhale for 4s, hold for 4s, exhale for 4s, hold for 4s. Repeat.'
  },
  {
    name: 'Guided Meditation',
    icon: Leaf,
    description: 'Follow a guided audio to find your inner peace.',
    content: <GuidedMeditationContent />,
    details: 'Find a quiet place, close your eyes, and follow the voice.'
  },
  {
    name: '5-4-3-2-1 Grounding',
    icon: Waves,
    description: 'Use your five senses to connect with the present.',
    content: (
        <div className='space-y-2 py-4'>
            <p>Acknowledge <strong>5</strong> things you can see.</p>
            <p>Acknowledge <strong>4</strong> things you can touch.</p>
            <p>Acknowledge <strong>3</strong> things you can hear.</p>
            <p>Acknowledge <strong>2</strong> things you can smell.</p>
            <p>Acknowledge <strong>1</strong> thing you can taste.</p>
        </div>
    ),
    details: 'A powerful way to manage anxiety by grounding yourself.'
  },
];

export function Techniques() {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {techniques.map((technique) => (
        <Dialog key={technique.name}>
          <DialogTrigger asChild>
            <Card className="glass-card cursor-pointer hover:border-primary/50 transition-all group">
              <CardHeader className="flex-row items-center gap-4">
                <technique.icon className="w-8 h-8 text-primary" />
                <CardTitle>{technique.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{technique.description}</CardDescription>
              </CardContent>
            </Card>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md glass-card">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <technique.icon className="w-6 h-6 text-primary" />
                {technique.name}
              </DialogTitle>
              <DialogDescription>{technique.details}</DialogDescription>
            </DialogHeader>
            <div className="py-4">{technique.content}</div>
          </DialogContent>
        </Dialog>
      ))}
    </div>
  );
}
