import ProgressBar from 'components/ProgressBar';
import React, {useEffect, useState} from 'react';

interface FileUploaderProps {
  file: File;
  name: string;
  sessionURL: string;
}

type UploadStatus = 'waiting' | 'uploading' | 'complete' | 'error';

export default function FileUploader({
  file,
  name,
  sessionURL,
}: FileUploaderProps) {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<UploadStatus>('waiting');

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
  useEffect(beginFileUpload, []);

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
      setStatus('complete');
    }
    if (response.status === 308) {
      console.log(response.headers);
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
