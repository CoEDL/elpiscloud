import React, {ReactNode, useEffect, useState} from 'react';

type Stage = {
  title: string;
  hasCompleted(): boolean;
  content: ReactNode;
};

type Props = {
  stages: Stage[];
  layout: 'vertical' | 'horizontal';
  automaticProgression?: boolean;
};

export default function Stepper({
  layout,
  stages,
  automaticProgression = false,
}: Props) {
  const [stageIndex, setStageIndex] = useState(0);

  const hasCompletedAllStages = () => {
    return stages.every(stage => stage.hasCompleted());
  };

  const nextStage = () => {
    for (const stage of stages) {
      if (!stage.hasCompleted()) {
        return stages.indexOf(stage);
      }
    }
    return stages.length - 1;
  };

  // Automatic stage progression
  useEffect(() => {
    if (!automaticProgression || hasCompletedAllStages()) return;
    setStageIndex(nextStage());
  }, [nextStage()]);

  if (layout === 'horizontal') {
    return (
      <div>
        {/* Stage Headers */}
        <div className="mb-8 flex items-center justify-between space-x-4">
          {stages.map((stage, index) => (
            <div
              key={index}
              className={
                'flex items-center ' +
                (index !== stages.length - 1 ? 'flex-1' : '')
              }
            >
              <StageHeader
                index={index}
                isAvailable={index <= nextStage()}
                isFocused={index === stageIndex}
                hasCompleted={stage.hasCompleted()}
                title={stage.title}
                onClick={() => {
                  if (index <= nextStage()) setStageIndex(index);
                }}
              />

              {index !== stages.length - 1 && (
                <div className="ml-4 h-0.5 w-full flex-1 border border-t border-dashed"></div>
              )}
            </div>
          ))}
        </div>

        <div className="">{stages[stageIndex].content}</div>
      </div>
    );
  } else {
    // TODO make vertical layout
    return <div>Vertical layout not yet supported</div>;
  }
}

type HeaderProps = {
  index: number;
  isAvailable: boolean;
  hasCompleted: boolean;
  isFocused: boolean;
  title: string;
  onClick(): void;
};

function StageHeader({
  index,
  isAvailable,
  isFocused,
  hasCompleted,
  title,
  onClick,
}: HeaderProps) {
  const indicatorStyle = () => {
    if (!isAvailable) {
      return 'bg-gray-200 text-gray-400';
    }
    if (isFocused) {
      return 'bg-accent shadow-md text-white';
    }
    if (hasCompleted) {
      return 'bg-primary text-white';
    }
    return 'bg-gray-200 text-gray-800';
  };

  return (
    <div className="flex items-center space-x-4" onClick={onClick}>
      <div
        className={
          'flex h-8 w-8 flex-col items-center justify-center rounded-full ' +
          indicatorStyle()
        }
      >
        <p>{index + 1}</p>
      </div>
      <p className="text-lg font-thin text-gray-700">{title}</p>
    </div>
  );
}
