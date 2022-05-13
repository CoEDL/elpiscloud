import Prose from 'components/Prose';
import Link from 'next/link';
import React, {useEffect, useState} from 'react';
import {getUserFiles} from 'lib/api/files';
import {UserFile} from 'types/UserFile';

import {useAuth} from 'contexts/auth';

export default function Files() {
  const {user} = useAuth();
  const [userFiles, setUserFiles] = useState<UserFile[]>([]);

  useEffect(() => {
    if (user) {
      getUserUploadedFiles();
    }
  }, [user]);

  async function getUserUploadedFiles() {
    const userDatasets = await getUserFiles(user!);
    setUserFiles(userDatasets);
  }

  return (
    <div>
      <Description />
      <Link href="/files/addFiles">
        <button className="button m-5">Add Files</button>
      </Link>
      <Link href="/files/addTags">
        <button className="button m-5">Add Tags</button>
      </Link>
      <table className="w-full rounded">
        <thead className="bg-slate-200">
          <tr className="text-left font-bold">
            <th className="table-padding">File name</th>
            <th className="table-padding">Type</th>
            <th className="table-padding">File size</th>
          </tr>
        </thead>
        <tbody>
          {Array.from(userFiles)
            .sort()
            .map(userFile => (
              <tr
                key={userFile.fileName}
                className="border border-y border-slate-200 py-4 font-normal text-slate-600"
              >
                <td className="table-padding">{userFile.fileName}</td>
                <td className="table-padding">{userFile.contentType}</td>
                <td className="table-padding">{userFile.size}</td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}

const Description = () => {
  return (
    <Prose>
      <h1 className="title">Files</h1>
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
      <p>
        Once signed in, you will be able view all your uploaded files in the
        table below. You can click on the <b>Add Files</b> button to upload more
        files. You can also click on the <b>Add Tags</b> button to add tags to
        your uploaded files. These tags can then be used to organize your
        uploaded files.
      </p>
    </Prose>
  );
};
