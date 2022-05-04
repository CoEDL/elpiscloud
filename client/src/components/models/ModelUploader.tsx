import LoadingIndicator from 'components/LoadingIndicator';
import Prose from 'components/Prose';
import {useAuth} from 'contexts/auth';
import {uploadModel} from 'lib/api/models';
import {useRouter} from 'next/router';
import React, {useState} from 'react';
import {Dataset} from 'types/Dataset';
import {UploadState} from 'types/LoadingStates';
import {Model} from 'types/Model';
import {TrainingOptions} from 'types/TrainingOptions';

type Props = {
  options: TrainingOptions;
  dataset: Dataset;
};

export default function ModelUploader({options, dataset}: Props) {
  const {user} = useAuth();
  const router = useRouter();

  const [name, setName] = useState('');
  const [uploadState, setUploadState] = useState<UploadState>('waiting');
  const [error, setError] = useState('');

  async function upload() {
    if (!name || user === null) {
      setError('You must be logged in and supply a valid dataset name');
      return;
    }

    setError('');
    const model: Model = {
      name,
      options,
      userId: user.uid,
      trainingStatus: 'training',
      dataset,
    };
    setUploadState('uploading');
    try {
      await uploadModel(user, model);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      }
    }
    setUploadState('completed');
    router.push('/models');
  }

  return (
    <div>
      <Prose>
        <h2>Upload</h2>
        <p>
          After uploading, you will be redirected to the datasets page. The new
          dataset will begin processing and should appear in your list of
          datasets.
        </p>
        <p>
          After processing has completed, you can use this dataset to train a
          model.
        </p>
      </Prose>

      {uploadState !== 'completed' ? (
        <div className="relative mt-8 flex items-center">
          {uploadState === 'uploading' && (
            <LoadingIndicator text="Uploading Model..." />
          )}
          <div className="flex flex-col">
            <label htmlFor="name" className="form-label mb-1">
              Model Name*
            </label>
            <input
              type="text"
              className="textbox"
              onChange={e => setName(e.target.value)}
              value={name}
            />
          </div>

          <button
            className="button ml-6 mt-6"
            onClick={upload}
            disabled={name === ''}
          >
            Upload Model
          </button>
        </div>
      ) : (
        <div>
          <p className="pt-8 text-xl font-bold text-accent">Upload Complete!</p>
        </div>
      )}

      {error !== '' && <p className="mt-4 text-red-400">{error}</p>}
    </div>
  );
}
