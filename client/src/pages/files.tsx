import React, {useState} from 'react';
import Dropzone from 'react-dropzone';
import {Grid, Header, Icon, Segment} from 'semantic-ui-react';
import {NAME_EXTENSION_MAP} from 'lib/file_extensions';
import FileList from 'components/files/FileList';
import {useAuth} from 'contexts/auth';
import {urls} from 'lib/urls';
import LoadingIndicator from 'components/LoadingIndicator';
import FileUploader from 'components/files/FileUploader';
import Link from 'next/link';

type UploadState = 'waiting' | 'signing' | 'uploading' | 'done';

export default function Files() {
  const {user} = useAuth();
  const [files, setFiles] = useState(new Map<string, File>());
  const [uploadState, setUploadState] = useState<UploadState>('waiting');
  const [sessionURLs, setSessionURLs] = useState(null);

  /**
   * Takes a list of user added files to be added to our pre-uploaded files.
   *
   * @param acceptedFiles The Files from the Dropzone element
   */
  const updateAcceptedFiles = (acceptedFiles: File[]) => {
    acceptedFiles.forEach(file =>
      setFiles(prev => new Map([...prev, [file.name, file]]))
    );
  };

  const deleteFile = (fileName: string) => {
    setFiles(prev => {
      const newState = new Map(prev);
      newState.delete(fileName);
      return newState;
    });
  };

  const canUpload = () => {
    return (
      (files.size > 0 && uploadState === 'waiting') || uploadState === 'done'
    );
  };

  const uploadFiles = async () => {
    if (user === null || !canUpload()) return;
    setUploadState('signing');
    const signedURLs = await getSignedUploadURLs();
    setSessionURLs(signedURLs);
    setUploadState('uploading');
  };

  const getSignedUploadURLs = async () => {
    const data = {
      file_names: [...files.keys()],
    };

    const token = await user!.getIdToken();
    const response = await fetch(urls.api.signFiles, {
      method: 'POST',
      mode: 'cors',
      headers: new Headers({
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      }),
      body: JSON.stringify(data),
    });

    return response.json();
  };

  const reset = () => {
    setUploadState('waiting');
    setFiles(new Map<string, File>());
    setSessionURLs(null);
  };

  function WaitingView() {
    return (
      <div className="relative">
        {uploadState === 'signing' && <LoadingIndicator text="Signing files" />}
        <Dropzone onDrop={acceptedFiles => updateAcceptedFiles(acceptedFiles)}>
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
          <button
            disabled={!canUpload()}
            className="button"
            onClick={uploadFiles}
          >
            Upload
          </button>
        </div>
      </div>
    );
  }

  function UploadingView() {
    if (sessionURLs === null) return <p>Error retrieving sessionUrls</p>;

    return (
      <div className="mt-8">
        <p className="text-center text-3xl font-bold">Uploading Files</p>
        <div className="grid grid-cols-1">
          {Array.from(files)
            .map(([filename, file]) => ({
              name: filename,
              file: file,
              sessionURL: sessionURLs[filename],
            }))
            .map(props => (
              <FileUploader key={props.name} {...props} />
            ))}
          <div className="mt-8 flex justify-between">
            <button className="button" onClick={reset}>
              Upload more files
            </button>
            <button className="button">
              <Link href="/datasets">Edit Datasets</Link>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="my-8">
      <Description />

      {uploadState === 'uploading' || uploadState === 'done' ? (
        <UploadingView />
      ) : (
        <WaitingView />
      )}
    </div>
  );
}

const Description = () => {
  return (
    <div className="prose max-w-none lg:prose-xl">
      <h1>Files</h1>
      <p>
        Here you can create Files by collecting and uploading audio. There are
        two types of transcription supported in Elpisnet: word and phoneme.
      </p>
      <ul>
        <li>
          <b>Word transcription</b> requires recordings, corresponding
          transcriptions and a letter-to-sound file. The letter-to-sound file is
          required to generate a pronunciation dictionary, which we call the{' '}
          <i>grapheme-to-phoneme</i> or <i>G2P</i> process.
        </li>
        <li>
          <b>Phoneme transcription</b> only requires recordings and
          corresponding transcriptions.
        </li>
      </ul>
    </div>
  );
};
