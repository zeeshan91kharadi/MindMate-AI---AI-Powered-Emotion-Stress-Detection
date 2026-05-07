'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Camera, Loader2, RefreshCw, CheckCircle, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '../ui/button';
import { analyzeFacialExpression, type FacialExpressionAnalysisOutput } from '@/ai/flows/facial-expression-analysis';

interface FacialAnalysisProps {
    onAnalysisComplete: (score: number) => void;
}

type Status = 'pending' | 'denied' | 'ready' | 'capturing' | 'processing' | 'success' | 'error';
const MAX_CAPTURE_SIZE = 640;

export function FacialAnalysis({ onAnalysisComplete }: FacialAnalysisProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [status, setStatus] = useState<Status>('pending');
  const [result, setResult] = useState<FacialExpressionAnalysisOutput | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [videoReady, setVideoReady] = useState(false);
  const { toast } = useToast();

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach(track => track.stop());
    streamRef.current = null;
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setVideoReady(false);
  }, []);

  const getCameraPermission = useCallback(async () => {
    try {
      setStatus('pending');
      stopCamera();
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Camera access is not supported in this browser or context.');
      }
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setStatus('ready');
    } catch (err) {
      console.error("Error accessing camera:", err);
      setStatus('denied');
      const isUnsupported =
        err instanceof Error && err.message.includes('not supported');
      toast({
        variant: "destructive",
        title: isUnsupported ? "Camera unavailable" : "Camera permission denied",
        description: isUnsupported
          ? "Please open the app in a browser with camera support, using localhost or HTTPS."
          : "Please enable camera access in your browser settings to use this feature.",
      });
    }
  }, [stopCamera, toast]);

  useEffect(() => {
    getCameraPermission();
    return stopCamera;
  }, [getCameraPermission, stopCamera]);

  useEffect(() => {
    if (status === 'ready' && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [status]);

  const handleVideoReady = () => {
    const video = videoRef.current;
    if (!video || video.videoWidth === 0 || video.videoHeight === 0) {
      return;
    }
    video.play().catch(() => {
      // The video is already muted/inline, but browsers can still reject play briefly.
    });
    setVideoReady(true);
  };
  
  const handleAnalyze = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    if (!videoReady || video.videoWidth === 0 || video.videoHeight === 0) {
      toast({
        variant: 'destructive',
        title: 'Camera is not ready',
        description: 'Please wait until the camera preview appears, then try again.',
      });
      return;
    }

    setStatus('capturing');

    const canvas = canvasRef.current;
    const scale = Math.min(1, MAX_CAPTURE_SIZE / Math.max(video.videoWidth, video.videoHeight));
    canvas.width = Math.round(video.videoWidth * scale);
    canvas.height = Math.round(video.videoHeight * scale);
    const context = canvas.getContext('2d');
    if (!context) {
      setStatus('ready');
      toast({
        variant: 'destructive',
        title: 'Camera capture failed',
        description: 'Could not prepare the camera frame. Please try again.',
      });
      return;
    }
    
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageDataUri = canvas.toDataURL('image/jpeg', 0.8);

    setStatus('processing');
    try {
        const analysisResult = await analyzeFacialExpression({ imageDataUri });
        if (analysisResult.error === 'quota_exceeded') {
          const retryText = analysisResult.retryAfterSeconds
            ? ` Please retry in about ${analysisResult.retryAfterSeconds} seconds.`
            : '';
          setErrorMessage(`${analysisResult.analysis}${retryText}`);
          setStatus('error');
          toast({
            variant: 'destructive',
            title: 'Gemini quota exceeded',
            description: `Your Google AI free-tier quota is temporarily exhausted.${retryText}`,
          });
          return;
        }
        setResult(analysisResult);
        setStatus('success');
        onAnalysisComplete(analysisResult.stressLevel);
    } catch (error) {
        console.error("Facial analysis failed:", error);
        setErrorMessage(
          'AI analysis is unavailable. Add GEMINI_API_KEY or GOOGLE_API_KEY to .env.local, then restart the Next.js server.'
        );
        setStatus('error');
        toast({
            variant: 'destructive',
            title: 'Analysis Failed',
            description: 'AI analysis is unavailable. Check your Gemini API key configuration.',
        });
    }
  };
  
  const reset = () => {
    setResult(null);
    setErrorMessage('');
    if (streamRef.current) {
      setStatus('ready');
      return;
    }
    getCameraPermission();
  }

  const renderContent = () => {
    switch (status) {
        case 'pending':
            return <div className="flex flex-col items-center text-muted-foreground"><Loader2 className="w-8 h-8 animate-spin" /></div>;
        case 'denied':
            return (
                <div className="flex flex-col items-center text-muted-foreground">
                    <Camera className="w-12 h-12" />
                    <p className='mt-2 text-center'>Camera access denied.</p>
                    <Button onClick={getCameraPermission} variant="link">Try again</Button>
                </div>
            );
        case 'ready':
        case 'capturing':
            return (
                 <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    onLoadedMetadata={handleVideoReady}
                    onCanPlay={handleVideoReady}
                    className="w-full h-full object-cover"
                  />
            );
        case 'success':
            return (
                <div className="flex flex-col items-center gap-4 p-4">
                    <CheckCircle className="h-16 w-16 text-green-500" />
                    <Alert className="glass-card text-left w-full">
                        <AlertTitle>Analysis Complete</AlertTitle>
                        <AlertDescription>
                            <p><strong>Detected Stress Level:</strong> {result?.stressLevel} / 100</p>
                            <p><strong>Emotional State:</strong> {result?.emotionalState}</p>
                            <p className="mt-2"><strong>Analysis:</strong> {result?.analysis}</p>
                        </AlertDescription>
                    </Alert>
                </div>
            );
        case 'processing':
             return (
                <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-2 text-white">
                   <Loader2 className="w-8 h-8 animate-spin" />
                   <p>Analyzing...</p>
                </div>
            );
        case 'error':
            return (
                <div className="flex flex-col items-center justify-center gap-4 p-4 text-destructive">
                    <AlertTriangle className="h-16 w-16" />
                    <p className="text-center">{errorMessage || 'Analysis failed. Please try again.'}</p>
                </div>
            );
    }
  }
  
  const renderButton = () => {
    switch(status) {
        case 'ready':
            return <Button onClick={handleAnalyze} disabled={!videoReady} className="w-full">{videoReady ? 'Analyze Expression' : 'Starting Camera...'}</Button>
        case 'processing':
        case 'capturing':
            return <Button disabled className="w-full"><Loader2 className="mr-2 h-4 w-4 animate-spin" />Analyzing...</Button>
        case 'success':
        case 'error':
             return <Button onClick={reset} variant="outline" className="w-full"><RefreshCw className="mr-2 h-4 w-4" />Analyze Again</Button>
        default:
            return null;
    }
  }

  return (
    <div className="flex flex-col gap-4 items-center">
      <div className="relative w-full aspect-video bg-muted rounded-lg overflow-hidden flex items-center justify-center">
        {renderContent()}
        <canvas ref={canvasRef} className="hidden"></canvas>
      </div>
      <div className="w-full">
        {renderButton()}
      </div>
    </div>
  );
}
