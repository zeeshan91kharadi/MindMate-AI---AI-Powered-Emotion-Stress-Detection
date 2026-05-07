'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, StopCircle, Loader2, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';
import { analyzeVoiceTone, type AnalyzeVoiceToneOutput } from '@/ai/flows/voice-tone-stress-analysis';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

interface VoiceAnalysisProps {
    onAnalysisComplete: (score: number) => void;
}

type RecordingStatus = 'inactive' | 'recording' | 'processing' | 'error' | 'success';

export function VoiceAnalysis({ onAnalysisComplete }: VoiceAnalysisProps) {
    const [permission, setPermission] = useState(false);
    const mediaRecorder = useRef<MediaRecorder | null>(null);
    const [recordingStatus, setRecordingStatus] = useState<RecordingStatus>('inactive');
    const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
    const [result, setResult] = useState<AnalyzeVoiceToneOutput | null>(null);
    const { toast } = useToast();

    useEffect(() => {
        getMicrophonePermission();
    }, []);

    const getMicrophonePermission = async () => {
        if ("MediaRecorder" in window) {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                setPermission(true);
            } catch (err) {
                console.error(err);
                setPermission(false);
                toast({
                    variant: 'destructive',
                    title: 'Microphone permission denied',
                    description: 'Please allow microphone access in your browser settings.',
                });
            }
        } else {
            alert("The MediaRecorder API is not supported in your browser.");
        }
    };

    const startRecording = async () => {
        setRecordingStatus('recording');
        setResult(null);
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const media = new MediaRecorder(stream); // Use default mimeType
        mediaRecorder.current = media;
        mediaRecorder.current.start();
        const localAudioChunks: Blob[] = [];
        mediaRecorder.current.ondataavailable = (event) => {
            if (typeof event.data === "undefined") return;
            if (event.data.size === 0) return;
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
                        const analysisResult = await analyzeVoiceTone({ audioDataUri: base64Audio });
                        setResult(analysisResult);
                        onAnalysisComplete(analysisResult.stressLevel);
                        setRecordingStatus('success');
                    } catch (error) {
                        console.error('Voice analysis failed:', error);
                        setRecordingStatus('error');
                        toast({
                            variant: 'destructive',
                            title: 'Analysis Failed',
                            description: 'Could not analyze your voice. Please try again.',
                        });
                    }
                };
                setAudioChunks([]);
            };
        }
    };
    
    const reset = () => {
        setRecordingStatus('inactive');
        setResult(null);
    }

    const renderContent = () => {
        switch (recordingStatus) {
            case 'recording':
                return (
                    <div className="flex flex-col items-center gap-4">
                        <div className="relative h-20 w-20">
                            <div className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></div>
                            <Mic className="h-20 w-20 text-destructive" />
                        </div>
                        <p className="text-lg">Recording...</p>
                        <Button onClick={stopRecording} variant="destructive">
                            <StopCircle className="mr-2 h-4 w-4" />
                            Stop Recording
                        </Button>
                    </div>
                );
            case 'processing':
                 return (
                    <div className="flex flex-col items-center gap-4 py-8">
                        <Loader2 className="h-16 w-16 animate-spin text-primary" />
                        <p className="text-lg">Analyzing your voice...</p>
                    </div>
                );
            case 'success':
                return (
                     <div className="flex flex-col items-center gap-4">
                        <CheckCircle className="h-16 w-16 text-green-500" />
                        <Alert className="glass-card text-left w-full">
                            <AlertTitle>Analysis Complete</AlertTitle>
                            <AlertDescription>
                                <p><strong>Detected Stress Level:</strong> {result?.stressLevel} / 100</p>
                                <p className="mt-2"><strong>Analysis:</strong> {result?.analysis}</p>
                            </AlertDescription>
                        </Alert>
                        <Button onClick={reset} variant="outline">
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Analyze Again
                        </Button>
                    </div>
                );
            case 'error':
                 return (
                    <div className="flex flex-col items-center gap-4">
                        <AlertTriangle className="h-16 w-16 text-destructive" />
                        <p className="text-destructive">Analysis failed. Please try again.</p>
                        <Button onClick={reset} variant="outline">
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Try Again
                        </Button>
                    </div>
                );
            case 'inactive':
            default:
                return (
                    <div className="flex flex-col items-center gap-4">
                        {permission ? (
                            <Button onClick={startRecording} size="lg" className="h-24 w-full">
                                <Mic className="mr-2 h-6 w-6" />
                                Start Recording
                            </Button>
                        ) : (
                            <Button onClick={getMicrophonePermission} size="lg" className="h-24 w-full">Enable Microphone</Button>
                        )}
                        <p className="text-sm text-muted-foreground text-center">Record a short sample of your voice (5-10 seconds) for stress analysis.</p>
                    </div>
                );
        }
    }

    return (
        <div className="py-4 text-center">
            {renderContent()}
        </div>
    );
}
