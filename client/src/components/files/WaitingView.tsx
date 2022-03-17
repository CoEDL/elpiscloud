import Dropzone from 'react-dropzone';
import {Grid, Header, Icon, Segment} from 'semantic-ui-react';
import {NAME_EXTENSION_MAP} from 'lib/fileExtensions';
import FileList from 'components/files/FileList';
import LoadingIndicator from 'components/LoadingIndicator';
import {UploadState} from 'types/UploadState';

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
              <Segment placeholder>
                <Header icon>
                  <Icon name="long arrow alternate down" />
                  Drag and drop or click to select files.
                </Header>
              </Segment>
            </div>
          </section>
        )}
      </Dropzone>
      <br />
      <Grid columns={2}>
        {Array.from(NAME_EXTENSION_MAP).map(([title, extension]) => (
          <Grid.Column key={title}>
            <FileList
              title={title}
              extensionFilter={extension}
              deleteFile={deleteFile}
              files={files}
            />
          </Grid.Column>
        ))}
      </Grid>
      <div className="mt-8 text-center">
        <button disabled={!canUpload} className="button" onClick={uploadFiles}>
          Upload
        </button>
      </div>
    </div>
  );
}
