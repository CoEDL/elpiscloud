import React, {useState} from 'react';
import Dropzone from 'react-dropzone';
import {Grid, Header, Icon, Segment} from 'semantic-ui-react';
import {NAME_EXTENSION_MAP} from 'lib/file_extensions';
import FileList from 'components/files/FileList';
import {useAuth} from 'contexts/auth';
import {urls} from 'lib/urls';

type FileObject = {
  type: string;
  fileSize: number;
};

export default function Files() {
  const {user} = useAuth();
  const [files, setFiles] = useState(new Map<string, FileObject>());

  const updateAcceptedFiles = (acceptedFiles: File[]) => {
    acceptedFiles.forEach(file =>
      setFiles(
        prev =>
          new Map([
            ...prev,
            [
              file.name,
              {
                type: file.type,
                fileSize: file.size,
              },
            ],
          ])
      )
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
    return files.size > 0;
  };

  const uploadFiles = async () => {
    if (user === null || !canUpload()) return;

    const signedURLs = await getSignedUploadURLs();
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

    console.log(response);
    console.log(await response.json());
  };

  return (
    <div className="my-8">
      <Description />
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
              extension={extension}
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
