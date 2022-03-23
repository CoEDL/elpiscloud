import LoadingIndicator from 'components/LoadingIndicator';
import Prose from 'components/Prose';
import {useAuth} from 'contexts/auth';
import {doc, getDoc, setDoc} from 'firebase/firestore/lite';
import {firestore} from 'lib/firestore';
import {useRouter} from 'next/router';
import React, {useState} from 'react';
import {DataPreparationOptions} from 'types/DataPreparationOptions';
import {UploadState} from 'types/UploadState';
import {UserFile} from 'types/UserFile';

type Props = {
  options: DataPreparationOptions;
  trainingFiles: UserFile[];
};

export default function DatasetUploader({options, trainingFiles}: Props) {
  const {user} = useAuth();
  const router = useRouter();

  const [name, setName] = useState('');
  const [uploadState, setUploadState] = useState<UploadState>('waiting');
  const [error, setError] = useState('');

  async function uploadDataset() {
    if (!name || user === null) {
      setError('You must be logged in and supply a valid dataset name');
      return;
    }

    setError('');

    const docRef = doc(firestore, `users/${user.uid}/datasets/${name}`);
    const docSnap = await getDoc(docRef);

    // Check we're not overwriting anything
    if (docSnap.exists()) {
      setError('A dataset with this name already exists!');
      return;
    }

    const files = trainingFiles.map(file => file.fileName);
    setUploadState('uploading');
    await setDoc(docRef, {
      name,
      options,
      files,
      userId: user.uid,
      processed: false,
    });
    setUploadState('completed');

    router.push('/datasets');
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
            <LoadingIndicator text="Uploading Dataset..." />
          )}
          <div className="flex flex-col">
            <label htmlFor="name" className="form-label mb-1">
              Dataset Name*
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
            onClick={uploadDataset}
            disabled={name === ''}
          >
            Upload Dataset
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
