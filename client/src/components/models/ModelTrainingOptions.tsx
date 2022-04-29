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

  return (
    <div>
      <Description />
    </div>
  );
}

const Description = () => {
  return (
    <Prose>
      <h2>Training Options</h2>
      <p>Here are some options to customise how the model is trained.</p>
    </Prose>
  );
};
