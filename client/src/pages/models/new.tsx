import DatasetSelector from 'components/models/DatasetSelector';
import ModelTrainingOptions from 'components/models/ModelTrainingOptions';
import ModelUploader from 'components/models/ModelUploader';
import Prose from 'components/Prose';
import Stepper from 'components/Stepper';
import React, {useState} from 'react';
import {Dataset} from 'types/Dataset';
import {TrainingOptions} from 'types/TrainingOptions';
import Link from 'next/link';

export default function NewModel() {
  const [dataset, setDataset] = useState<Dataset | null>(null);
  const [trainingOptions, setTrainingOptions] =
    useState<TrainingOptions | null>(null);

  const stages = [
    {
      title: 'Select a Dataset',
      hasCompleted: () => dataset !== null,
      content: (
        <DatasetSelector currentDataset={dataset} selectDataset={setDataset} />
      ),
    },
    {
      title: 'Training Options',
      hasCompleted: () => trainingOptions !== null,
      content: (
        <ModelTrainingOptions options={null} saveOptions={setTrainingOptions} />
      ),
    },
    {
      title: 'Begin Training',
      hasCompleted: () => false,
      content: <ModelUploader options={trainingOptions!} dataset={dataset!} />,
    },
  ];

  return (
    <>
      <div className="flex justify-end">
        <Link href="/models">
          <button className="button-secondary m-1">Back to models</button>
        </Link>
      </div>

      <div>
        <Description />
        <br />
        <br />
        <Stepper stages={stages} layout={'horizontal'} automaticProgression />
      </div>
    </>
  );
}

const Description = () => {
  return (
    <Prose>
      <h1 className="title">Train a new Model</h1>
      <p>
        Here you can train a new model from one of your processed datasets.
        Trained models can subsequently be used for transcription tasks.
      </p>
    </Prose>
  );
};
