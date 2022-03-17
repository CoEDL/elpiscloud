import DatasetViewer from 'components/datasets/DatasetViewer';
import Link from 'next/link';
import React from 'react';

export default function Datasets() {
  return (
    <div>
      <Description />
      <br />
      <Link href="/datasets/create">
        <button className="button">Create New Dataset</button>
      </Link>
      <p className="mt-8 mb-4 text-2xl font-semibold">Current datasets</p>
      <DatasetViewer />
    </div>
  );
}

const Description = () => {
  return (
    <div className="prose max-w-none lg:prose-xl">
      <h1>Datasets</h1>
      <p>
        Here you can adjust or create a new Dataset by organising the files
        you've already uploaded.
      </p>
    </div>
  );
};
