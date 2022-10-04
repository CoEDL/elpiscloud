import Prose from 'components/Prose';
import React, {useState} from 'react';
import {
  DataPreparationOptions,
  ElanOptions,
} from 'types/DataPreparationOptions';
import {UserFile} from 'types/UserFile';
import CleaningOptions from './DataCleaningOptions';
import ElanSelectionOptions from './ElanSelectionOptions';

type Props = {
  trainingFiles: UserFile[];
  saveOptions(options: DataPreparationOptions): void;
};

const defaultOptions: DataPreparationOptions = {
  punctuationToRemove: '',
  punctuationToExplode: '',
  textToRemove: [],
  elanOptions: {
    selectionMechanism: 'tier_name',
    selectionValue: '',
  },
};

export default function DataPreparation({trainingFiles, saveOptions}: Props) {
  const [options, setOptions] =
    useState<DataPreparationOptions>(defaultOptions);

  const usesElan = () => {
    for (const file of trainingFiles) {
      if (file.fileName.endsWith('.eaf')) {
        return true;
      }
    }
    return false;
  };

  const canSave = () => {
    if (!usesElan()) return true;
    return options.elanOptions!.selectionValue !== '';
  };

  return (
    <div className="space-y-8">
      <Description />
      <CleaningOptions options={options} setOptions={setOptions} />
      {usesElan() && (
        <ElanSelectionOptions
          options={options.elanOptions}
          save={(elanOptions: ElanOptions) =>
            setOptions({...options, elanOptions})
          }
        />
      )}
      <button
        className="button"
        disabled={!canSave()}
        onClick={() => saveOptions(options)}
      >
        Save options
      </button>
    </div>
  );
}

const Description = () => {
  return (
    <Prose>
      <h2>Data Preparation </h2>
      <p>Here are some options to clean the training data.</p>
      <p>
        If you use the Elan file format for transcription, there are some
        additional options for which tiers you might want to extract data from.
      </p>
    </Prose>
  );
};
