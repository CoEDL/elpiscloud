import Prose from 'components/Prose';
import React, {
  useState,
  useEffect,
  KeyboardEvent,
  useRef,
  useMemo,
} from 'react';

import {getUserFiles, updateDocumentTags} from 'lib/api/files';
import {UserFile} from 'types/UserFile';
import {Table} from 'semantic-ui-react';

import {useAuth} from 'contexts/auth';

export default function TaggingView() {
  const {user} = useAuth();
  const [userFiles, setUserFiles] = useState<Map<string, UserFile>>(
    new Map<string, UserFile>()
  );
  // Set of all filenames that will change in this update
  const [filesToChange, setFilesToChange] = useState<Set<string>>(
    new Set<string>()
  );
  useEffect(() => {
    if (user) {
      getUserUploadedFiles();
    }
  }, [user]);

  async function getUserUploadedFiles() {
    const newUserFiles = await getUserFiles(user!);
    setUserFiles(
      new Map(
        Array.from(newUserFiles).map(userFile => {
          return [userFile.fileName, userFile];
        })
      )
    );
  }

  const removeTagFromFile = (tagIndex: number, fileName: string) => {
    const newFiles = new Map(userFiles);
    const oldFileInfo = newFiles.get(fileName)!;
    const newFileInfo: UserFile = {
      ...oldFileInfo,
      tags: oldFileInfo.tags.slice(),
    };
    newFileInfo.tags.splice(tagIndex, 1);
    newFiles.set(oldFileInfo.fileName, newFileInfo);
    setUserFiles(newFiles);

    const newFilesToChange = new Set<string>(filesToChange);
    newFilesToChange.add(fileName);
    setFilesToChange(newFilesToChange);
  };

  const addTagToFile = (tag: string, fileName: string) => {
    if (
      userFiles
        .get(fileName)!
        .tags.find(fileTag => fileTag.toLowerCase() === tag.toLowerCase())
    ) {
      return false; // False if nothing added
    }
    const newFiles = new Map(userFiles);
    const oldFileInfo = newFiles.get(fileName)!;
    const newFileInfo: UserFile = {
      ...oldFileInfo,
      tags: [...oldFileInfo.tags.slice(), tag],
    };
    newFiles.set(oldFileInfo.fileName, newFileInfo);
    setUserFiles(newFiles);

    const newFilesToChange = new Set<string>(filesToChange);
    newFilesToChange.add(fileName);
    setFilesToChange(newFilesToChange);

    return true; // True if a new tag is added
  };

  const canUploadTags = useMemo(() => !(user === null), [user]);

  const uploadAllTags = async () => {
    if (!canUploadTags) {
      return;
    }

    const allUploadPromises: Promise<void>[] = Array.from(filesToChange).map(
      fileName => {
        const fileInfo = userFiles.get(fileName)!;
        return updateDocumentTags(user!, fileName, fileInfo.tags);
      }
    );

    await Promise.all(allUploadPromises);
    setFilesToChange(new Set<string>());
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
            .map(([filename, userFile]) => (
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

/* Adapted from https://jerrylowm.medium.com/build-a-tags-input-react-component-from-scratch-1524f02acb9a */
const InputTag = ({fileTags, removeTag, addTag}: InputTagProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const inputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    const val = (e.target as HTMLInputElement)!.value.trim();

    if (e.key === 'Enter' && val) {
      if (addTag(val)) {
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