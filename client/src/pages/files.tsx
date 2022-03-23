import React, {useMemo, useState} from 'react';

import {useAuth} from 'contexts/auth';
import {urls} from 'lib/urls';
import {UploadState} from 'types/UploadState';
import WaitingView from 'components/files/WaitingView';
import UploadingView from 'components/files/UploadView';
import Prose from 'components/Prose';

export default function Files() {
  const {user} = useAuth();
  const [files, setFiles] = useState(new Map<string, File>());
  const [uploadState, setUploadState] = useState<UploadState>('waiting');
  const [sessionURLs, setSessionURLs] = useState(new Map<string, string>());

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

  const canUpload = useMemo(
    () =>
      files.size > 0 &&
      (uploadState === 'waiting' || uploadState === 'completed'),
    [files, uploadState]
  );

  const uploadFiles = async () => {
    if (user === null || !canUpload) return;
    setUploadState('signing');
    const signedURLs = await getSignedUploadURLs();
    setSessionURLs(new Map<string, string>(Object.entries(signedURLs)));
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
    setSessionURLs(new Map<string, string>());
  };

  return (
    <div>
      <Description />

      {uploadState === 'uploading' || uploadState === 'completed' ? (
        <UploadingView
          sessionURLs={sessionURLs}
          files={files}
          reset={reset}
          completedUploadsCallback={() => setUploadState('completed')}
        />
      ) : (
        <WaitingView
          uploadState={uploadState}
          files={files}
          updateLocalFiles={updateAcceptedFiles}
          deleteFile={deleteFile}
          canUpload={canUpload}
          uploadFiles={uploadFiles}
        />
      )}
    </div>
  );
}

const Description = () => {
  return (
    <Prose>
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
    </Prose>
  );
};
