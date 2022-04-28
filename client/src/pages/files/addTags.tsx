import Prose from 'components/Prose';
import React, {
  useState,
  useEffect,
  KeyboardEvent,
  useRef,
  useMemo,
} from 'react';

import {getUserFiles, updateDocumentWithData} from 'lib/api/files';
import {UserFile} from 'types/UserFile';
import {Table} from 'semantic-ui-react';

import {useAuth} from 'contexts/auth';

export default function TaggingView() {
  const {user} = useAuth();
  const [userFiles, setUserFiles] = useState<Map<string, [UserFile, boolean]>>(
    new Map<string, [UserFile, boolean]>()
  );

  useEffect(() => {
    if (user) {
      getUserUploadedFiles();
    }
  }, [user]);

  // TODO Need error handling here if there are errors with fetching data
  async function getUserUploadedFiles() {
    const newUserFiles = await getUserFiles(user!);
    setUserFiles(
      new Map(
        Array.from(newUserFiles).map(userFile => {
          return [userFile.fileName, [userFile, false]];
        })
      )
    );
  }

  const removeTagFromFile = (tagIndex: number, fileName: string) => {
    const newFiles = new Map(userFiles);
    const oldFileInfo = newFiles.get(fileName)!;
    const newFileInfo: UserFile = {
      fileName: oldFileInfo[0].fileName,
      size: oldFileInfo[0].size,
      contentType: oldFileInfo[0].contentType,
      tags: oldFileInfo[0].tags.slice(),
      timeCreated: oldFileInfo[0].timeCreated,
      userId: oldFileInfo[0].userId,
    };
    newFileInfo.tags.splice(tagIndex, 1);
    newFiles.set(oldFileInfo[0].fileName, [newFileInfo, true]);
    setUserFiles(newFiles);
  };

  const addTagToFile = (tag: string, fileName: string) => {
    if (
      userFiles
        .get(fileName)![0]
        .tags.find(fileTag => fileTag.toLowerCase() === tag.toLowerCase())
    ) {
      return false; // False if nothing added
    }
    const newFiles = new Map(userFiles);
    const oldFileInfo = newFiles.get(fileName)!;
    const newFileInfo: UserFile = {
      fileName: oldFileInfo[0].fileName,
      size: oldFileInfo[0].size,
      contentType: oldFileInfo[0].contentType,
      tags: [...oldFileInfo[0].tags.slice(), tag],
      timeCreated: oldFileInfo[0].timeCreated,
      userId: oldFileInfo[0].userId,
    };
    newFiles.set(oldFileInfo[0].fileName, [newFileInfo, true]);
    setUserFiles(newFiles);
    return true; // True if something added
  };

  const canUploadTags = useMemo(() => !(user === null), [user]);

  const uploadAllTags = () => {
    if (canUploadTags) {
      userFiles.forEach(async ([fileInfo, reUpload], filename) => {
        if (reUpload) {
          await updateDocumentWithData(user!, filename, fileInfo.tags);
          const newFiles = new Map(userFiles);
          const oldFileInfo = newFiles.get(filename)!;
          const newFileInfo: UserFile = {
            fileName: oldFileInfo[0].fileName,
            size: oldFileInfo[0].size,
            contentType: oldFileInfo[0].contentType,
            tags: oldFileInfo[0].tags.slice(),
            timeCreated: oldFileInfo[0].timeCreated,
            userId: oldFileInfo[0].userId,
          };
          newFiles.set(oldFileInfo[0].fileName, [newFileInfo, false]);
          // Refactor out this code that sets user files because it is used a few times
          // and is very similar for the most part
          setUserFiles(newFiles);
        }
      });
      // After uploading, make all of them false again so you don't upload anymore
    }
  };

  return (
    <div>
      <Description />
      <br />
      <button
        disabled={!canUploadTags}
        className="button"
        onClick={uploadAllTags}
      >
        Update Tags
      </button>
      <Table>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>File name</Table.HeaderCell>
            <Table.HeaderCell>Type</Table.HeaderCell>
            <Table.HeaderCell>File size</Table.HeaderCell>
            <Table.HeaderCell>Tags</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {Array.from(userFiles)
            .sort(([filenameA], [filenameB]) => {
              return filenameA.localeCompare(filenameB);
            })
            .map(([filename, [userFile]]) => (
              <Table.Row key={filename}>
                <Table.Cell>{filename}</Table.Cell>
                <Table.Cell>{userFile.type}</Table.Cell>
                <Table.Cell>{userFile.size}</Table.Cell>
                <Table.Cell>
                  <InputTag
                    fileTags={userFile.tags}
                    removeTag={tagIndex => {
                      removeTagFromFile(tagIndex, userFile.fileName);
                    }}
                    addTag={tag => {
                      return addTagToFile(tag, userFile.fileName);
                    }}
                  />
                </Table.Cell>
              </Table.Row>
            ))}
        </Table.Body>
      </Table>
    </div>
  );
}

type InputTagProps = {
  fileTags: string[];
  removeTag: (tagIndex: number) => void;
  addTag: (tag: string) => boolean;
};

const InputTag = ({fileTags, removeTag, addTag}: InputTagProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const inputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    const val = (e.target as HTMLInputElement)!.value.trim();

    if (e.key === 'Enter' && val) {
      if (addTag(val)) {
        // If this false, maybe give some feedback to the user that they are trying to add a duplicate tab?
        inputRef.current!.value = '';
      }
    } else if (e.key === 'Backspace' && !val) {
      removeTag(fileTags.length - 1);
    }
  };

  return (
    <div className="input-tag">
      <ul className="input-tag__tags">
        {fileTags.map((tag, i) => (
          <li key={tag}>
            {tag}
            <button
              type="button"
              onClick={() => {
                removeTag(i);
              }}
            >
              +
            </button>
          </li>
        ))}
        <li className="input-tag__tags__input">
          <input type="text" onKeyDown={inputKeyDown} ref={inputRef} />
        </li>
      </ul>
    </div>
  );
};

const Description = () => {
  return (
    <Prose>
      <h1>Adding tags to files</h1>
      <p>
        Here you can add tags to already uploaded files. The table below shows
        already uploaded files.
      </p>
    </Prose>
  );
};
