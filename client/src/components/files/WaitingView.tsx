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
              <div className="grid h-60 cursor-pointer place-items-center rounded-lg bg-slate-100">
                <div className="justify-center">
                  <div className="grid place-items-center">
                    <i className="bi bi-upload text-4xl"></i>
                  </div>
                  <h1 className="mt-3 text-xl font-semibold">
                    Drag and drop or click to select files.
                  </h1>
                </div>
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
