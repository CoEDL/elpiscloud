import Dropzone from 'react-dropzone';
import FileList from 'components/files/FileList';
import LoadingIndicator from 'components/LoadingIndicator';
import {UploadState} from 'types/LoadingStates';

interface WaitingViewProps {
  uploadState: UploadState;
  files: Map<string, File>;
  deleteFile: (filename: string) => void;
  updateLocalFiles: (files: File[]) => void;
  canUpload: boolean;
  uploadFiles: () => void;
}

export default function WaitingView({
  uploadState,
  files,
  updateLocalFiles,
  deleteFile,
  canUpload,
  uploadFiles,
}: WaitingViewProps) {
  return (
    <div className="relative">
      {uploadState === 'signing' && <LoadingIndicator text="Signing files" />}
      <Dropzone onDrop={acceptedFiles => updateLocalFiles(acceptedFiles)}>
        {({getRootProps, getInputProps}) => (
          <section>
            <div {...getRootProps()}>
              <input {...getInputProps()} />
              <div className="h-60 flex-col rounded-lg bg-slate-100 align-middle">
                {/* TODO TODO TODO add an arrow icon */}
                <h1 className="text-2xl font-semibold">
                  Drag and drop or click to select files.
                </h1>
              </div>
            </div>
          </section>
        )}
      </Dropzone>
      <br />
      <FileList deleteFile={deleteFile} files={files} />
      <div className="mt-8 text-center">
        <button disabled={!canUpload} className="button" onClick={uploadFiles}>
          Upload
        </button>
      </div>
    </div>
  );
}
