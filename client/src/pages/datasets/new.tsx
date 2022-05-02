import DataPreparation from 'components/datasets/DataPreparation';
import DatasetUploader from 'components/datasets/DatasetUploader';
import FileSelector from 'components/datasets/FileSelector';
import Prose from 'components/Prose';
import Stepper from 'components/Stepper';
import React, {useState} from 'react';
import {DataPreparationOptions} from 'types/DataPreparationOptions';
import {UserFile} from 'types/UserFile';

export default function NewDataset() {
  const [trainingFiles, setTrainingFiles] = useState<UserFile[]>([]);
  const [dataOptions, setDataOptions] = useState<DataPreparationOptions | null>(
    null
  );

  const stages = [
    {
      title: 'Add training files',
      hasCompleted: () => trainingFiles.length !== 0,
      content: (
        <FileSelector
          create={setTrainingFiles}
          title="Select training files"
          createPrompt="Add training files"
        />
      ),
    },
    {
      title: 'Data preparation',
      hasCompleted: () => dataOptions !== null,
      content: (
        <DataPreparation
          trainingFiles={trainingFiles}
          saveOptions={setDataOptions}
        />
      ),
    },
    {
      title: 'Upload dataset',
      hasCompleted: () => false,
      content: (
        <DatasetUploader trainingFiles={trainingFiles} options={dataOptions!} />
      ),
    },
  ];

  return (
    <div className="space-y-10">
      <Description />

      <Stepper stages={stages} layout="horizontal" automaticProgression />
    </div>
  );
}

const Description = () => {
  return (
    <Prose>
      <h1>Create Dataset</h1>
      <p>
        On this page you can group a selection of files you've already uploaded
        and combine them into a dataset for training.
      </p>
    </Prose>
  );
};
