// client/src/components/shared/LoadingPage.tsx

import { useState, useEffect } from 'react';
import { Progress } from '@/components/ui/progress';

export const LoadingPage = () => {
  const [progress, setProgress] = useState(10);

  useEffect(() => {
    // This simulates a more realistic loading progress
    const timer1 = setTimeout(() => setProgress(30), 200);
    const timer2 = setTimeout(() => setProgress(60), 500);
    const timer3 = setTimeout(() => setProgress(80), 1000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="w-full max-w-md text-center">
        <p className="text-lg font-semibold text-gray-700 mb-4">Loading Content...</p>
        <Progress value={progress} className="w-full" />
      </div>
    </div>
  );
};