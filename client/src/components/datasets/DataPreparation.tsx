import Prose from 'components/Prose';
import React, {useState} from 'react';
import {
  DataPreparationOptions,
  ElanOptions,
  ElanSelectionMechanism,
} from 'types/DataPreparationOptions';
import {UserFile} from 'types/UserFile';

type Props = {
  trainingFiles: UserFile[];
  saveOptions(options: DataPreparationOptions): void;
};

const defaultOptions: DataPreparationOptions = {
  wordsToRemove: '',
  punctuationToRemove: '',
  punctuationToReplace: '',
  tagsToRemove: '',
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
    return options.elanOptions.selectionValue !== '';
  };

  return (
    <div className="space-y-8">
      <Description />
      <CleaningOptions options={options} setOptions={setOptions} />
      {usesElan() && (
        <ElanSelectionOptions
          options={options}
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

type CleaningProps = {
  options: DataPreparationOptions;
  setOptions(options: DataPreparationOptions): void;
};

function CleaningOptions({options, setOptions}: CleaningProps) {
  const inputs = [
    {
      title: 'Punctuation to remove',
      option: 'punctuationToRemove',
      value: options.punctuationToRemove,
    },
    {
      title: 'Punctuation to replace',
      option: 'punctuationToReplace',
      value: options.punctuationToReplace,
    },
    {
      title: 'Words to remove',
      option: 'wordsToRemove',
      value: options.wordsToRemove,
    },
    {
      title: 'Tags to remove',
      option: 'tagsToRemove',
      value: options.tagsToRemove,
    },
  ];
  return (
    <div className="rounded-md border p-6">
      <p className="text-lg font-bold">Data Cleaning</p>

      <div className="mt-4 ml-4 grid grid-cols-3 items-center gap-4">
        {inputs.map(({title, option, value}) => (
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
              type="text"
              name={option}
              id={option}
              value={value}
              onChange={e => setOptions({...options, [option]: e.target.value})}
            />
          </>
        ))}
      </div>
    </div>
  );
}

type ElanSelectionProps = {
  options: DataPreparationOptions;
  save(elanOptions: ElanOptions): void;
};

function ElanSelectionOptions({options, save}: ElanSelectionProps) {
  return (
    <div className="rounded-md border p-6">
      <p className="text-lg font-bold">Elan Options</p>

      <div className="mt-4 ml-4 grid grid-cols-3 items-center gap-4">
        <label htmlFor="selection" className="form-label">
          Selection Mechanism
        </label>
        <select
          className="textbox col-span-2"
          name="selection"
          id="selection"
          value={options.elanOptions?.selectionMechanism ?? 'tier_name'}
          onChange={e =>
            save({
              ...options.elanOptions,
              selectionMechanism: e.target.value as ElanSelectionMechanism,
            })
          }
        >
          {['tier_name', 'tier_type', 'tier_order'].map(selectionType => (
            <option key={selectionType} value={selectionType}>
              {selectionType}
            </option>
          ))}
        </select>

        <label htmlFor="selectionValue" className="form-label">
          {options.elanOptions.selectionMechanism.split('_').join(' ') + '*'}
        </label>
        <input
          className="textbox col-span-2"
          type="text"
          name="selectionValue"
          id="selectionValue"
          value={options.elanOptions.selectionValue}
          onChange={e =>
            save({
              ...options.elanOptions,
              selectionValue: e.target.value,
            })
          }
        />
      </div>
    </div>
  );
}
