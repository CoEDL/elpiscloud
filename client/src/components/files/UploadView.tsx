import {useRouter} from 'next/router';
import {useMemo, useState} from 'react';
import FileUploader from './FileUploader';

interface Props {
  sessionURLs: Map<string, string>;
  files: Map<string, File>;
  reset: () => void;
  completedUploadsCallback: () => void;
}

export default function UploadingView({
  sessionURLs,
  files,
  reset,
  completedUploadsCallback,
}: Props) {
  const router = useRouter();
  const [completedUploads, setCompletedUploads] = useState(
    new Map<string, boolean>(
      [...files.keys()].map(filename => [filename, false])
    )
  );

  if (sessionURLs === null || sessionURLs.size === 0)
    return <p>Error retrieving sessionUrls</p>;

  const hasCompletedUploads = () =>
    [...completedUploads.values()].every(completed => completed);

  const setCompleted = (filename: string) => {
    setCompletedUploads(completedUploads.set(filename, true));
    if (hasCompletedUploads()) {
      completedUploadsCallback();
    }
  };

  const uploads = useMemo(
    () =>
      Array.from(files).map(([filename, file]) => ({
        name: filename,
        file: file,
        sessionURL: sessionURLs.get(filename) ?? '',
        completedCallback: () => setCompleted(filename),
      })),
    [files, sessionURLs]
  );

  return (
    <div className="mt-8">
      <p className="text-center text-3xl font-bold">Uploading Files...</p>
      <div className="grid grid-cols-1">
        {uploads.map(props => (
          <FileUploader key={props.name} {...props} />
        ))}
        <div className="mt-8 flex justify-between px-3">
          <button
            disabled={!hasCompletedUploads()}
            className="button-secondary"
            onClick={reset}
          >
            Upload more files
          </button>
          <button
            disabled={!hasCompletedUploads()}
            className="button-secondary"
            onClick={() => router.push('/datasets')}
          >
            Edit Datasets
          </button>
        </div>
      </div>
    </div>
  );
}
