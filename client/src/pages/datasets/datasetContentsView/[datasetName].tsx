import {useAuth} from 'contexts/auth';
import {getFilesFromDataset} from 'lib/api/files';
import React, {useEffect, useState} from 'react';
import {UserFile} from 'types/UserFile';
import {useRouter} from 'next/router';
import Prose from 'components/Prose';

export default function DatasetViewer() {
  const router = useRouter();
  const datasetName = router.query.datasetName as string;

  const {user} = useAuth();
  const [currentDatasetFiles, setCurrentDatasetFiles] = useState<UserFile[]>(
    new Array<UserFile>()
  );

  useEffect(() => {
    if (user) {
      getDatasetFiles();
    }
  }, [user]);

  const getDatasetFiles = async () => {
    console.log(datasetName);
    const allFiles: UserFile[] = await getFilesFromDataset(user!, datasetName);
    console.log(allFiles);
    allFiles.forEach(file => {
      console.log(file.fileName);
    });
    setCurrentDatasetFiles(allFiles);
  };

  return (
    <>
      <Description datasetName={datasetName} />
      <br />
      <br />
      <div className="rounded bg-white shadow-md">
        <table className="w-full rounded">
          <thead className=" bg-slate-200">
            <tr className="text-left font-bold">
              <th className="table-padding">File</th>
              <th className="table-padding">Size</th>
              <th className="table-padding">Date Uploaded</th>
              <th className="table-padding">Tags</th>
            </tr>
          </thead>
          <tbody>
            {currentDatasetFiles.map(({fileName, size, tags, timeCreated}) => (
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

const Description = ({datasetName}: {datasetName: string}) => {
  return (
    <Prose>
      <h2>{datasetName}</h2>
      <p>
        Below are the list of all files in <u>{datasetName}</u>.
      </p>
    </Prose>
  );
};
