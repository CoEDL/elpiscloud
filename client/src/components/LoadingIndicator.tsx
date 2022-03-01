import React from 'react';

export default function LoadingIndicator({text = 'Loading...'}) {
  return (
    <div className="absolute top-0 left-0 z-10 flex h-full w-full flex-col items-center justify-center backdrop-blur-sm">
      <p className="text-xl font-bold">{text}</p>
    </div>
  );
}
