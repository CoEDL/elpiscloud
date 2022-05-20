import Prose from 'components/Prose';
import {useRouter} from 'next/router';
import React from 'react';
import Link from 'next/link';

export default function ModelTrainingView() {
  const router = useRouter();
  const {modelName} = router.query;

  return (
    <>
      <div className="flex justify-end">
        <Link href="/models">
          <button className="button-secondary m-1">Back to models</button>
        </Link>
      </div>

      <div>
        <Prose>
          <h1 className="title">Training model: {modelName}</h1>
          <p>
            Here we somehow connect to the training job and display the logs
          </p>
        </Prose>
      </div>
    </>
  );
}
