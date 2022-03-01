import React from 'react';

interface ProgressBarProps {
  percent: number;
}

export default function ProgressBar({percent}: ProgressBarProps) {
  return (
    <div className="relative h-6 w-full overflow-hidden rounded-full bg-gray-400">
      {/* Progress text */}
      <div className="absolute top-0 left-0 flex h-full w-full flex-col items-center justify-center">
        <p className="text-sm text-white">{percent}%</p>
      </div>
      {/* Background progress indicator */}
      <div
        className="h-full bg-accent transition"
        style={{width: `${percent}%`}}
      ></div>
    </div>
  );
}
