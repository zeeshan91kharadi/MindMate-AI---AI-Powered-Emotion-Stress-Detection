
"use client";

import { useEffect, useState } from "react";

interface StressScoreProps {
  score: number | null;
}

export function StressScore({ score }: StressScoreProps) {
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    if (score === null) {
      setDisplayScore(0);
      return;
    }
    const animation = requestAnimationFrame(() => {
      setDisplayScore(score);
    });
    return () => cancelAnimationFrame(animation);
  }, [score]);

  const getScoreDetails = (value: number | null) => {
    if (value === null) {
        return { label: "Not Available", colorClass: "text-muted-foreground" };
    }
    if (value <= 20) return { label: "Excellent", colorClass: "text-green-500" };
    if (value <= 40) return { label: "Good", colorClass: "text-blue-500" };
    if (value <= 60) return { label: "Moderate", colorClass: "text-yellow-400" };
    if (value <= 80) return { label: "High", colorClass: "text-orange-500" };
    return { label: "Severe", colorClass: "text-destructive" };
  };

  const { label, colorClass } = getScoreDetails(score);
  const circumference = 2 * Math.PI * 52;
  const strokeDashoffset = circumference - (displayScore / 100) * circumference;

  return (
    <div className="flex items-center justify-center">
      <div className="relative h-48 w-48">
        <svg className="h-full w-full" viewBox="0 0 120 120">
          <circle
            className="text-primary/10"
            strokeWidth="8"
            stroke="currentColor"
            fill="transparent"
            r="52"
            cx="60"
            cy="60"
          />
          <circle
            className={`transform -rotate-90 origin-center transition-all duration-1000 ease-out ${colorClass}`}
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            stroke="currentColor"
            fill="transparent"
            r="52"
            cx="60"
            cy="60"
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {score === null ? (
            <span className="text-lg text-muted-foreground">N/A</span>
          ) : (
            <>
              <span className={`text-5xl font-bold ${colorClass}`}>
                {displayScore}
              </span>
              <span className={`text-lg font-medium ${colorClass}`}>{label}</span>
              <span className="text-sm text-muted-foreground">out of 100</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
