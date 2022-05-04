import DatasetViewer from 'components/datasets/DatasetViewer';
import Prose from 'components/Prose';
import Link from 'next/link';
import React from 'react';

export default function Datasets() {
  return (
    <div>
      <Description />
      <br />
      <Link href="/datasets/new">
        <button className="button">Create New Dataset</button>
      </Link>
      <p className="mt-8 mb-4 text-2xl font-semibold">Current datasets</p>
      <DatasetViewer />
    </div>
  );
}

const Description = () => {
  return (
    <Prose>
      <h1>Datasets</h1>
      <p>
        Here you can view the Datasets you've created and their status, or
        create a new Dataset by organising the files you've already uploaded.
      </p>
    </Prose>
  );
};
