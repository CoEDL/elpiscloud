import ProgressBar from 'components/ProgressBar';
import React, {useEffect, useState} from 'react';
import {UploadState} from 'types/UploadState';

interface FileUploaderProps {
  file: File;
  name: string;
  sessionURL: string;
  completedCallback: () => void;
}

export default function FileUploader({
  file,
  name,
  sessionURL,
  completedCallback,
}: FileUploaderProps) {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<UploadState>('waiting');

  const beginFileUpload = () => {
    fetch(sessionURL, {
      method: 'PUT',
      headers: new Headers({
        'Content-Length': file.size.toString(),
      }),
      body: file,
    });
    setStatus('uploading');
  };

  // Begin file upload as soon as component loads
  useEffect(() => {
    if (status === 'waiting') beginFileUpload();
  }, []);

  const checkUploadStatus = async () => {
    const response = await fetch(sessionURL, {
      method: 'PUT',
      headers: new Headers({
        'Content-Length': '0',
        'Content-Range': 'bytes */*',
      }),
    });
    if (response.status === 200 || response.status === 201) {
      setProgress(100);
      setStatus('completed');
      completedCallback();
      console.log(name);
    }
    if (response.status === 308) {
      // Check the number of bytes persisted to google storage so far.
      const range = response.headers.get('Range');
      if (range !== null) {
        const progressPercent = Number.parseInt(range) / file.size;
        setProgress(Math.round(progressPercent * 100));
      }
    } else {
      setStatus('error');
    }
  };

  useEffect(() => {
    if (status !== 'uploading') return;
    const intervalId = setInterval(() => {
      checkUploadStatus();
    }, 2000);
    return () => clearInterval(intervalId);
  }, [status]);

  return (
    <div className="space-y-1 p-3">
      <p className="font-semibold text-gray-700">
        {name}
        <span className="font-thin text-gray-400">
          {' '}
          - {Math.round(file.size / 1000)} KB
        </span>
      </p>
      <ProgressBar percent={progress} />
    </div>
  );
}
