
'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, StopCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { speechToText } from '@/ai/flows/speech-to-text';
import { cn } from '@/lib/utils';

interface VoiceRecorderProps {
  onTranscription: (text: string) => void;
  disabled?: boolean;
}

type RecordingStatus = 'inactive' | 'recording' | 'processing';

export function VoiceRecorder({ onTranscription, disabled }: VoiceRecorderProps) {
  const [permission, setPermission] = useState(false);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const [recordingStatus, setRecordingStatus] = useState<RecordingStatus>('inactive');
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    getMicrophonePermission();
  }, []);

  const getMicrophonePermission = async () => {
    if ('MediaRecorder' in window) {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        setPermission(true);
      } catch (err) {
        console.error(err);
        setPermission(false);
      }
    }
  };

  const startRecording = async () => {
    if (!permission) {
      toast({
        variant: 'destructive',
        title: 'Microphone permission denied',
        description: 'Please allow microphone access in your browser settings.',
      });
      await getMicrophonePermission();
      return;
    }
    setRecordingStatus('recording');
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const media = new MediaRecorder(stream);
    mediaRecorder.current = media;
    mediaRecorder.current.start();
    const localAudioChunks: Blob[] = [];
    mediaRecorder.current.ondataavailable = (event) => {
      if (typeof event.data === 'undefined' || event.data.size === 0) return;
      localAudioChunks.push(event.data);
    };
    setAudioChunks(localAudioChunks);
  };

  const stopRecording = () => {
    if (mediaRecorder.current) {
      mediaRecorder.current.stop();
      mediaRecorder.current.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: mediaRecorder.current?.mimeType });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Audio = reader.result as string;
          setRecordingStatus('processing');
          try {
            const result = await speechToText({ audioDataUri: base64Audio });
            onTranscription(result.text);
          } catch (error) {
            console.error('Speech-to-text failed:', error);
            toast({
              variant: 'destructive',
              title: 'Transcription Failed',
              description: 'Could not process your voice input. Please try again.',
            });
          } finally {
            setRecordingStatus('inactive');
          }
        };
        setAudioChunks([]);
      };
    }
  };

  const handleMicClick = () => {
    if (disabled) return;
    if (recordingStatus === 'inactive') {
      startRecording();
    } else if (recordingStatus === 'recording') {
      stopRecording();
    }
  };

  return (
    <Button
      type="button"
      size="icon"
      variant="ghost"
      onClick={handleMicClick}
      disabled={disabled || recordingStatus === 'processing'}
      className={cn('h-8 w-8', {
        'text-destructive': recordingStatus === 'recording',
      })}
    >
      {recordingStatus === 'processing' && <Loader2 className="h-4 w-4 animate-spin" />}
      {recordingStatus === 'recording' && <StopCircle className="h-4 w-4" />}
      {recordingStatus === 'inactive' && <Mic className="h-4 w-4" />}
    </Button>
  );
}
