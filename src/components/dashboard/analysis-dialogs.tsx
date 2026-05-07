'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Mic, FileText, Smile } from 'lucide-react';
import { TextAnalysis } from '@/components/analysis/text-analysis';
import { VoiceAnalysis } from '@/components/analysis/voice-analysis';
import { FacialAnalysis } from '@/components/analysis/facial-analysis';

interface AnalysisDialogsProps {
  onAnalysisComplete: (score: number) => void;
}

export function AnalysisDialogs({ onAnalysisComplete }: AnalysisDialogsProps) {
  const [openDialog, setOpenDialog] = useState<'text' | 'voice' | 'face' | null>(null);

  const handleComplete = (score: number) => {
    onAnalysisComplete(score);
  }

  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-around items-center h-full">
      <Dialog open={openDialog === 'text'} onOpenChange={(isOpen) => !isOpen && setOpenDialog(null)}>
        <DialogTrigger asChild>
          <Button variant="outline" size="lg" className="w-full sm:w-auto flex-1 h-24" onClick={() => setOpenDialog('text')}>
            <FileText className="mr-2" /> Text Analysis
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md glass-card">
          <DialogHeader>
            <DialogTitle>Text Emotion Analysis</DialogTitle>
            <DialogDescription>
              Enter a short journal-style note to estimate your current stress level.
            </DialogDescription>
          </DialogHeader>
          <TextAnalysis onAnalysisComplete={handleComplete} />
        </DialogContent>
      </Dialog>

      <Dialog open={openDialog === 'voice'} onOpenChange={(isOpen) => !isOpen && setOpenDialog(null)}>
        <DialogTrigger asChild>
          <Button variant="outline" size="lg" className="w-full sm:w-auto flex-1 h-24" onClick={() => setOpenDialog('voice')}>
            <Mic className="mr-2" /> Voice Analysis
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md glass-card">
          <DialogHeader>
            <DialogTitle>Voice Tone Stress Analysis</DialogTitle>
            <DialogDescription>
              Record a brief voice sample so the app can estimate stress from tone.
            </DialogDescription>
          </DialogHeader>
          <VoiceAnalysis onAnalysisComplete={handleComplete} />
        </DialogContent>
      </Dialog>
      
      <Dialog open={openDialog === 'face'} onOpenChange={(isOpen) => !isOpen && setOpenDialog(null)}>
        <DialogTrigger asChild>
          <Button variant="outline" size="lg" className="w-full sm:w-auto flex-1 h-24" onClick={() => setOpenDialog('face')}>
            <Smile className="mr-2" /> Facial Analysis
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md glass-card">
          <DialogHeader>
            <DialogTitle>Facial Expression Analysis</DialogTitle>
            <DialogDescription>
              Capture a camera frame so the app can estimate stress from facial expression.
            </DialogDescription>
          </DialogHeader>
          <FacialAnalysis onAnalysisComplete={handleComplete} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
