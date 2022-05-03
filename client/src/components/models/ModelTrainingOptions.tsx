import Prose from 'components/Prose';
import React, {useState} from 'react';
import {TrainingOptions} from 'types/TrainingOptions';

type Props = {
  options: TrainingOptions | null;
  saveOptions(options: TrainingOptions): void;
};

const defaultOptions: TrainingOptions = {
  wordDelimiterToken: '',
  epochs: 10,
  minDuration: 0,
  maxDuration: 60,
  learningRate: 0.0001,
  batchSize: 4,
  debugWithSubset: false,
  debugSubsetOptions: {
    trainingSetSize: 10,
    validationSetSize: 6,
  },
};

export default function ModelTrainingOptions({options, saveOptions}: Props) {
  const [trainingOptions, setTrainingOptions] = useState<TrainingOptions>(
    options ?? defaultOptions
  );

  const inputs = [
    {
      title: 'Word delimiter token',
      option: 'wordDelimiterToken',
      value: trainingOptions.wordDelimiterToken,
      min: 0,
      step: 1,
    },
    {
      title: 'Number of epochs',
      option: 'epochs',
      value: trainingOptions.epochs,
      min: 1,
      step: 1,
    },
    {
      title: 'Min duration',
      option: 'minDuration',
      value: trainingOptions.minDuration,
      min: 0,
      step: 1,
    },
    {
      title: 'Max duration',
      option: 'maxDuration',
      value: trainingOptions.maxDuration,
      min: 1,
      step: 1,
    },
    {
      title: 'Learning rate',
      option: 'learningRate',
      value: trainingOptions.learningRate,
      min: 0.0001,
      step: 0.0001,
    },
    {
      title: 'Batch size',
      option: 'batchSize',
      value: trainingOptions.batchSize,
      min: 1,
      step: 1,
    },
  ];

  const canSave = () => {
    return true;
  };

  return (
    <div className="space-y-4">
      <Description />

      <div className="rounded-md border p-6">
        <div className="grid grid-cols-3 items-center gap-4">
          {inputs.map(({title, option, value, min, step}) => (
            <>
              <label
                key={`label${option}`}
                htmlFor={option}
                className="form-label"
              >
                {title}
              </label>
              <input
                key={`input${option}`}
                className="textbox col-span-2"
                type={option === 'wordDelimiterToken' ? 'text' : 'number'}
                name={option}
                id={option}
                value={value}
                min={min}
                step={step}
                onChange={e =>
                  setTrainingOptions({
                    ...trainingOptions,
                    [option]: e.target.value,
                  })
                }
              />
            </>
          ))}
        </div>
      </div>

      <button
        className="button"
        disabled={!canSave()}
        onClick={() => saveOptions(trainingOptions)}
      >
        Save
      </button>
    </div>
  );
}

const Description = () => {
  return (
    <Prose>
      <h2>Training Options</h2>
    </Prose>
  );
};
