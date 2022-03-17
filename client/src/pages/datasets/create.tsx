import FileSelector from 'components/datasets/FileSelector';
import React from 'react';
import {UserFile} from 'types/UserFile';

export default function create() {
  const createDataset = (files: UserFile[]) => {
    console.log(files);
  };

  return (
    <div>
      <Description />
      <br />

      <FileSelector create={createDataset} />
    </div>
  );
}

const Description = () => {
  return (
    <div className="prose max-w-none lg:prose-xl">
      <h1>Create Dataset</h1>
      <p>
        On this page you can group a selection of files you've already uploaded
        and combine them into a dataset for training.
      </p>
    </div>
  );
};
