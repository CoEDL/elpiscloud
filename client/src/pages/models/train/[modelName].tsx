import Prose from 'components/Prose';
import {useRouter} from 'next/router';
import React from 'react';

export default function ModelTrainingView() {
  const router = useRouter();
  const {modelName} = router.query;

  return (
    <div>
      <Prose>
        <h1>Training model: {modelName}</h1>
        <p>Here we somehow connect to the training job and display the logs</p>
      </Prose>
    </div>
  );
}
