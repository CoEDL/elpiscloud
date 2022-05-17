import {useAuth} from 'contexts/auth';
import {getFile} from 'lib/api/files';
import {getDataset} from 'lib/api/datasets';
import React, {useEffect, useState} from 'react';
import {UserFile} from 'types/UserFile';
import {Dataset} from 'types/Dataset';
import {DownloadState} from 'types/LoadingStates';
import {useRouter} from 'next/router';
import Prose from 'components/Prose';
import LoadingIndicator from 'components/LoadingIndicator';
import Link from 'next/link';

export default function DatasetViewer() {
  const router = useRouter();
  const datasetName = router.query.datasetName as string;

  const {user} = useAuth();
  const [currentDatasetFiles, setCurrentDatasetFiles] = useState<UserFile[]>(
    new Array<UserFile>()
  );
  const [currentState, setCurrentState] =
    useState<DownloadState>('downloading');
  const [currentDataset, setCurrentDataset] = useState<Dataset>();

  useEffect(() => {
    if (user) {
      getDatasetFiles();
    }
  }, [user]);

  const getDatasetFiles = async () => {
    const dataset: Dataset = await getDataset(user!, datasetName!);
    const allFiles: UserFile[] = await Promise.all(
      dataset.files.map(filename => getFile(user!, filename))
    );
    setCurrentDataset(dataset);
    setCurrentDatasetFiles(allFiles);
    setCurrentState('completed');
  };

  /**
   * A dictionary-like object to map object properties to user friendly
   * text in tables
   */
  const keysToStrings: {[key: string]: string} = {
    punctuationToRemove: 'Punctuation to remove',
    punctuationToReplace: 'Punctuation to replace',
    tagsToRemove: 'Tags to remove',
    wordsToRemove: 'Words to remove',
    selectionMechanism: 'Selection Mechanism',
    selectionValue: 'Selection Value',
  };

  /**
   * Gets a list of JSX elements that represent the rows of the table containing
   * DataPreparationOptions for the given dataset
   *
   * @param dataset Dataset whose Data-Preparation-options need to be obtained
   * @returns A list of JSX elements
   */
  const getDataPreparationOptionsTableRows = (dataset: Dataset) => {
    const dataPrepOptions = dataset.options;
    let key: keyof typeof dataPrepOptions;
    const tableRows = [];
    for (key in dataPrepOptions) {
      if (typeof dataPrepOptions[key] !== 'string') {
        continue; // That means the type is ElanOptions
      }
      tableRows.push(
        <tr
          key={key}
          className="border border-y border-slate-200 py-4 font-light text-gray-400"
        >
          <td className="table-padding font-normal text-slate-600">
            {keysToStrings[key]}
          </td>
          <td className="table-padding">{dataPrepOptions[key] as string}</td>
        </tr>
      );
    }

    return tableRows;
  };

  /**
   * Gets a list of JSX elements that represent the rows of the table containing
   * ElanOptions for the given dataset
   *
   * @param dataset Dataset whose Elan-options need to be obtained
   * @returns A list of JSX elements
   */
  const getElanOptionsTableRows = (dataset: Dataset) => {
    const elanOptions = dataset.options.elanOptions;
    let key: keyof typeof elanOptions;
    const tableRows = [];
    for (key in elanOptions) {
      tableRows.push(
        <tr
          key={key}
          className="border border-y border-slate-200 py-4 font-light text-gray-400"
        >
          <td className="table-padding font-normal text-slate-600">
            {keysToStrings[key]}
          </td>
          <td className="table-padding">{elanOptions[key]}</td>
        </tr>
      );
    }

    return tableRows;
  };

  return (
    <>
      <div className="flex justify-end">
        <Link href="/datasets">
          <button className="button-secondary m-1">Back to Datasets</button>
        </Link>
      </div>
      <div>
        <div>
          <Description datasetName={datasetName} />
          <br />
          {currentState === 'downloading' && (
            <LoadingIndicator text="Loading dataset" />
          )}
          <div className="rounded bg-white shadow-md">
            <table className="w-full rounded">
              <thead className=" bg-slate-200">
                <tr className="text-left font-bold">
                  <th className="table-padding">Data Preparation Options</th>
                  <th className="table-padding">Value</th>
                </tr>
              </thead>
              {currentState === 'completed' && (
                <tbody>
                  {getDataPreparationOptionsTableRows(currentDataset!)}
                </tbody>
              )}
            </table>
          </div>
          <br />
          <br />
          <div className="rounded bg-white shadow-md">
            <table className="w-full rounded">
              <thead className=" bg-slate-200">
                <tr className="text-left font-bold">
                  <th className="table-padding">Elan Options</th>
                  <th className="table-padding">Value</th>
                </tr>
              </thead>
              {currentState === 'completed' && (
                <tbody>{getElanOptionsTableRows(currentDataset!)}</tbody>
              )}
            </table>
          </div>
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
                {currentDatasetFiles.map(
                  ({fileName, size, tags, timeCreated}) => (
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
                  )
                )}
              </tbody>
            </table>
          </div>
          <br />
          <br />
        </div>
      </div>
    </>
  );
}

const Description = ({datasetName}: {datasetName: string}) => {
  return (
    <Prose>
      <h2 className="title">{datasetName}</h2>
      <p>
        Below are the list of all files in <u>{datasetName}</u>.
      </p>
    </Prose>
  );
};
