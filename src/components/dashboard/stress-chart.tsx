
'use client';

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ChartConfig, ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit, Timestamp } from 'firebase/firestore';
import { format } from 'date-fns';
import { useMemo } from 'react';
import { Loader2 } from 'lucide-react';


type StressRecord = {
    id: string;
    score: number;
    timestamp: Timestamp;
};

const chartConfig = {
  stress: {
    label: 'Stress Level',
    color: 'hsl(var(--primary))',
  },
} satisfies ChartConfig;

export function StressChart() {
  const { user } = useUser();
  const firestore = useFirestore();

  const stressHistoryRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return collection(firestore, 'users', user.uid, 'stressHistory');
  }, [user, firestore]);

  const stressHistoryQuery = useMemoFirebase(() => {
    if (!stressHistoryRef) return null;
    return query(stressHistoryRef, orderBy("timestamp", "desc"), limit(7));
  }, [stressHistoryRef]);

  const { data: stressHistory, isLoading } = useCollection<StressRecord>(stressHistoryQuery);

  const chartData = useMemo(() => {
    if (!stressHistory) return [];
    return stressHistory
      .map(record => ({
        date: record.timestamp ? format(record.timestamp.toDate(), 'MMM d') : 'N/A',
        stress: record.score,
      }))
      .reverse();
  }, [stressHistory]);
  
  if (isLoading) {
    return (
        <div className="h-64 w-full flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    );
  }

  if (chartData.length === 0) {
    return (
        <div className="h-64 w-full flex items-center justify-center">
            <p className="text-muted-foreground">No stress history yet. Complete an analysis to see your trends.</p>
        </div>
    );
  }


  return (
    <div className="h-64 w-full">
      <ChartContainer config={chartConfig} className="h-full w-full">
        <ResponsiveContainer>
          <AreaChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="colorStress" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border) / 0.5)" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis
              domain={[0, 100]}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <Tooltip
              cursor={{ stroke: 'hsl(var(--border))', strokeWidth: 1, strokeDasharray: '3 3' }}
              content={<ChartTooltipContent indicator="dot" />}
            />
            <Area
              dataKey="stress"
              type="monotone"
              fill="url(#colorStress)"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={true}
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
}
