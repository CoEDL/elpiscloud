import {useAuth} from 'contexts/auth';
import React, {useEffect, useState} from 'react';
import {collection, collectionGroup, getDocs} from 'firebase/firestore/lite';
import {firestore} from 'lib/firestore';
import {UserFile} from 'types/UserFile';

interface Props {
  title: string;
  create(files: UserFile[]): void;
  createPrompt: string;
}

export default function FileSelector({create, title, createPrompt}: Props) {
  const {user} = useAuth();
  const [files, setFiles] = useState<UserFile[]>([]);
  const [selected, setSelected] = useState(new Map<string, boolean>());
  const [searchFilter, setSearchFilter] = useState('');

  useEffect(() => {
    if (user) {
      getFiles();
    }
  }, [user]);

  // Reset on title change
  useEffect(() => {
    clearSelection();
    setSearchFilter('');
  }, [title]);

  async function getFiles() {
    const filesCollection = collection(firestore, `users/${user?.uid}/files`);
    const filesQuery = collectionGroup(firestore, filesCollection.id);
    const querySnapshot = await getDocs(filesQuery);
    const files = querySnapshot.docs.map(snapshot => snapshot.data());
    setFiles(files as UserFile[]);
    setSelected(
      new Map<string, boolean>(files.map(file => [file.fileName, false]))
    );
  }

  const canCreate = () => {
    return [...selected.values()].some(isIncluded => isIncluded);
  };

  const submit = () => {
    create(files.filter(({fileName}) => selected.get(fileName)));
  };

  const filteredFiles = () => {
    return files.filter(({fileName, tags}) => {
      if (fileName.includes(searchFilter)) return true;

      for (const tag of tags) {
        if (tag.includes(searchFilter)) return true;
      }
      return false;
    });
  };

  const selectFiltered = () => {
    setSelected(
      new Map<string, boolean>(
        filteredFiles().map(file => [file.fileName, true])
      )
    );
  };

  const clearSelection = () => {
    setSelected(new Map<string, boolean>());
  };

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold">{title}</h2>

        <div className="space-x-4">
          <label htmlFor="search">
            Filter:{' '}
            <input
              id="search"
              name="filter"
              className="ml-2 rounded border-slate-300 bg-white px-4 py-1 focus:ring-accent"
              type="text"
              value={searchFilter}
              onChange={e => setSearchFilter(e.target.value)}
            />
          </label>
          <button
            className="py-1 underline underline-offset-1"
            onClick={selectFiltered}
          >
            Select all
          </button>
          <button
            className="py-1 underline underline-offset-1"
            onClick={clearSelection}
          >
            Clear selection
          </button>
        </div>
      </div>

      <div className="rounded bg-white shadow-md">
        <table className="w-full rounded">
          <thead className=" bg-slate-200">
            <tr className="text-left font-bold">
              <th className="table-padding">File</th>
              <th className="table-padding">Size</th>
              <th className="table-padding">Date Uploaded</th>
              <th className="table-padding">Tags</th>
              <th className="table-padding text-right">Selected</th>
            </tr>
          </thead>
          <tbody>
            {filteredFiles().map(({fileName, size, tags, timeCreated}) => (
              <tr
                key={fileName}
                className="border border-y border-slate-200 py-4 font-light text-gray-400"
              >
                <td className="table-padding font-normal text-slate-600">
                  {fileName}
                </td>
                <td className="table-padding">{`${Math.round(
                  Number.parseInt(size) / 1000
                )}KB`}</td>
                <td className="table-padding">
                  {new Date(Date.parse(timeCreated)).toLocaleDateString()}
                </td>
                <td className="table-padding">
                  {tags.length === 0 ? (
                    <p>-</p>
                  ) : (
                    <ul className="flex space-x-1">
                      {tags.map(tag => (
                        <li key={tag}>{tag}</li>
                      ))}
                    </ul>
                  )}
                </td>
                <td className="table-padding text-right">
                  <input
                    className="h-4 w-4 rounded text-accent focus:ring-accent"
                    type="checkbox"
                    name="selected"
                    value="selected"
                    checked={selected.get(fileName) ?? false}
                    onChange={() => {
                      const value = selected.get(fileName) ?? false;
                      setSelected(new Map(selected.set(fileName, !value)));
                    }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button className="button mt-4" disabled={!canCreate()} onClick={submit}>
        {createPrompt}
      </button>
    </>
  );
}
