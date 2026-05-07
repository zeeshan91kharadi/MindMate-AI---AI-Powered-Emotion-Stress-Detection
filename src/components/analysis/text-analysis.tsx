'use client';

import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2, Send } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { analyzeTextEmotion, type TextEmotionAnalysisOutput } from '@/ai/flows/text-emotion-analysis';
import { useToast } from '@/hooks/use-toast';

interface TextAnalysisProps {
    onAnalysisComplete: (score: number) => void;
}

export function TextAnalysis({ onAnalysisComplete }: TextAnalysisProps) {
    const [text, setText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<TextEmotionAnalysisOutput | null>(null);
    const { toast } = useToast();

    const handleSubmit = async () => {
        if (!text.trim()) {
            toast({
                variant: 'destructive',
                title: 'Text is empty',
                description: 'Please enter some text to analyze.',
            });
            return;
        }
        setIsLoading(true);
        setResult(null);
        try {
            const analysisResult = await analyzeTextEmotion({ text });
            setResult(analysisResult);
            onAnalysisComplete(analysisResult.stressLevel);
        } catch (error) {
            console.error('Text analysis failed:', error);
            toast({
                variant: 'destructive',
                title: 'Analysis Failed',
                description: 'Could not analyze the text. Please try again.',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-4">
            <Textarea
                placeholder="How are you feeling today? Describe your thoughts and feelings..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={5}
                disabled={isLoading}
            />
            <Button onClick={handleSubmit} disabled={isLoading || !text.trim()}>
                {isLoading ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Analyzing...
                    </>
                ) : (
                    <>
                        <Send className="mr-2 h-4 w-4" />
                        Analyze Text
                    </>
                )}
            </Button>

            {result && (
                <Alert className="glass-card">
                    <AlertTitle>Analysis Result</AlertTitle>
                    <AlertDescription>
                        <p><strong>Emotional State:</strong> {result.emotionalState}</p>
                        <p><strong>Stress Level:</strong> {result.stressLevel} / 100</p>
                        <p className="mt-2"><strong>Summary:</strong> {result.summary}</p>
                    </AlertDescription>
                </Alert>
            )}
        </div>
    );
}
