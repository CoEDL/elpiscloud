import LoadingIndicator from 'components/LoadingIndicator';
import Prose from 'components/Prose';
import {useAuth} from 'contexts/auth';
import {getDatasets} from 'lib/api/datasets';
import Link from 'next/link';
import React, {useEffect, useState} from 'react';
import {Dataset} from 'types/Dataset';
import {DownloadState} from 'types/LoadingStates';

type Props = {
  currentDataset: Dataset | null;
  selectDataset(dataset: Dataset): void;
};

export default function DatasetSelector({
  currentDataset,
  selectDataset,
}: Props) {
  const {user} = useAuth();
  const [loadingState, setLoadingState] = useState<DownloadState>('waiting');
  const [datasets, setDatasets] = useState<Dataset[]>([]);

  useEffect(() => {
    if (user) {
      setLoadingState('downloading');
      try {
        getUserDatasets();
        setLoadingState('completed');
      } catch {
        setLoadingState('error');
      }
    }
  }, [user]);

  async function getUserDatasets() {
    const userDatasets = await getDatasets(user!);
    setDatasets(userDatasets);
  }

  const chooseDataset = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (e.target.value === '') return;

    const dataset = datasets.find(
      (dataset: Dataset) => dataset.name === e.target.value
    );
    selectDataset(dataset!);
  };

  // Loading state
  if (loadingState === 'waiting' || loadingState === 'downloading') {
    return (
      <div className="relative">
        <LoadingIndicator text="Loading Datasets..."></LoadingIndicator>;
      </div>
    );
  }

  // Empty datasets view
  if (loadingState === 'completed' && datasets.length === 0) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Select a Dataset</h2>
        <p className="">You have not created any Datasets for this account!</p>
        <p>
          To create a new dataset, click{' '}
          <span className="text-accent">
            {' '}
            <Link href="/datasets/create">here</Link>
          </span>
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Select a Dataset</h2>

      <select
        name=""
        id=""
        className="rounded-md"
        value={currentDataset?.name}
        onChange={chooseDataset}
      >
        <option value="">Choose a Dataset</option>
        {datasets.map((dataset: Dataset) => (
          <option
            key={dataset.name}
            disabled={!dataset.processed}
            value={dataset.name}
          >
            {dataset.name}
          </option>
        ))}
      </select>

      <p className="pt-4 text-gray-600">
        To be eligible for training, the dataset must have completed processing.
      </p>
      <p className="text-gray-600">
        <b>Unprocessed datasets will appear greyed out in the above menu.</b> If
        none of your uploaded datasets have been processed, you must wait for
        that step to complete before proceeding with training.
      </p>
    </div>
  );
}
