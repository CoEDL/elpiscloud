import ModelViewer from 'components/models/ModelViewer';
import Prose from 'components/Prose';
import Link from 'next/link';
import React from 'react';

export default function Models() {
  return (
    <div>
      <Description />
      <br />
      <Link href="/models/train">
        <button className="button">Train new Model</button>
      </Link>

      <h2 className="mt-10 text-3xl">Current Models</h2>
      <ModelViewer />
    </div>
  );
}

const Description = () => {
  return (
    <Prose>
      <h1>Models</h1>
      <p>
        Here you can train a new model from one of your processed datasets.
        Trained models can subsequently be used for transcription tasks.
      </p>
      <p>
        From here you should also be able to see a list of your models that are
        training, and their statuses.
      </p>
    </Prose>
  );
};
