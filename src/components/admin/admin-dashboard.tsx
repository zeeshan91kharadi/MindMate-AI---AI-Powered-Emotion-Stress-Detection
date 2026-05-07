
'use client';

import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartConfig, ChartContainer, ChartTooltipContent } from '@/components/ui/chart';

const weeklyStressData = [
  { week: 'Week 1', avgStress: 65 },
  { week: 'Week 2', avgStress: 62 },
  { week: 'Week 3', avgStress: 70 },
  { week: 'Week 4', avgStress: 58 },
  { week: 'Week 5', avgStress: 63 },
];

const stressDistributionData = [
  { range: '0-20', count: 15 },
  { range: '21-40', count: 45 },
  { range: '41-60', count: 80 },
  { range: '61-80', count: 120 },
  { range: '81-100', count: 40 },
];

const chartConfig: ChartConfig = {
  avgStress: {
    label: 'Avg. Stress',
    color: 'hsl(var(--primary))',
  },
  count: {
    label: 'User Count',
    color: 'hsl(var(--accent))',
  },
};

export function AdminDashboard() {
  return (
    <div className="py-8">
      <div className="grid gap-6 md:grid-cols-3 mb-6">
        <Card className="glass-card">
            <CardHeader>
                <CardTitle>Total Users</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-4xl font-bold">300</p>
            </CardContent>
        </Card>
        <Card className="glass-card">
            <CardHeader>
                <CardTitle>Average Stress (This Week)</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-4xl font-bold text-destructive">71</p>
            </CardContent>
        </Card>
         <Card className="glass-card">
            <CardHeader>
                <CardTitle>Most Used Technique</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-4xl font-bold text-primary">Box Breathing</p>
            </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Average Stress Over Time</CardTitle>
            <CardDescription>Weekly average stress score across all users.</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ChartContainer config={chartConfig} className="h-full w-full">
              <ResponsiveContainer>
                <LineChart data={weeklyStressData}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="week" tickLine={false} axisLine={false} />
                  <YAxis domain={[0, 100]} tickLine={false} axisLine={false} />
                  <Tooltip content={<ChartTooltipContent />} />
                  <Line type="monotone" dataKey="avgStress" stroke="var(--color-avgStress)" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Stress Score Distribution</CardTitle>
            <CardDescription>Distribution of the latest stress scores.</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ChartContainer config={chartConfig} className="h-full w-full">
              <ResponsiveContainer>
                <BarChart data={stressDistributionData}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="range" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} />
                  <Tooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="count" fill="var(--color-count)" radius={4} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
