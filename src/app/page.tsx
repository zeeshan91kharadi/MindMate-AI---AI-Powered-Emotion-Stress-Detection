
"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StressScore } from "@/components/dashboard/stress-score";
import { AnalysisDialogs } from "@/components/dashboard/analysis-dialogs";
import { RelaxationSuggestions } from "@/components/dashboard/relaxation-suggestions";
import { StressChart } from "@/components/dashboard/stress-chart";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { BrainCircuit } from 'lucide-react';
import { useFirestore, useUser, errorEmitter } from '@/firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { FirestorePermissionError } from '@/firebase/errors';

export default function DashboardPage() {
  const [stressScore, setStressScore] = useState<number | null>(null);
  const { user } = useUser();
  const firestore = useFirestore();

  const handleAnalysisComplete = async (score: number) => {
    const newScore = Math.round(score);
    setStressScore(newScore);

    if (user && firestore) {
      const stressHistoryRef = collection(firestore, 'users', user.uid, 'stressHistory');
      const newRecord = {
        score: newScore,
        timestamp: serverTimestamp()
      };
      addDoc(stressHistoryRef, newRecord).catch(error => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: stressHistoryRef.path,
          operation: 'create',
          requestResourceData: newRecord,
        }));
      });
    }
  };
  
  return (
    <div className="flex flex-col gap-8 p-4 md:p-8">
      <div className="grid gap-8 md:grid-cols-3">
        <header className="md:col-span-3 flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        </header>

        <Card className="md:col-span-1 glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BrainCircuit className="text-primary" />
              Current Stress Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <StressScore score={stressScore} />
          </CardContent>
        </Card>

        <Card className="md:col-span-2 glass-card">
          <CardHeader>
            <CardTitle>Start an Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <AnalysisDialogs onAnalysisComplete={handleAnalysisComplete} />
          </CardContent>
        </Card>
      </div>

      {stressScore !== null && stressScore > 65 && (
        <Alert variant="destructive" className="bg-destructive/20 border-destructive/50">
          <BrainCircuit className="h-4 w-4" />
          <AlertTitle>High Stress Detected!</AlertTitle>
          <AlertDescription>
            Your stress levels seem high. Consider trying one of the relaxation exercises below.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-8 md:grid-cols-2">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Weekly Stress Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <StressChart />
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Relaxation Techniques</CardTitle>
          </CardHeader>
          <CardContent>
            <RelaxationSuggestions />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
