import {useAuth} from 'contexts/auth';
import {deleteDataset, getDatasets} from 'lib/api/datasets';
import React, {ReactNode, useEffect, useState} from 'react';
import {Dataset} from 'types/Dataset';
import Link from 'next/link';

export default function DatasetViewer() {
  const {user} = useAuth();
  const [datasets, setDatasets] = useState<Dataset[]>([]);

  useEffect(() => {
    if (user) {
      getUserDatasets();
    }
  }, [user]);

  async function getUserDatasets() {
    const userDatasets = await getDatasets(user!);
    setDatasets(userDatasets);
  }

  async function _deleteDataset(name: string) {
    await deleteDataset(user!, name);
    getUserDatasets();
  }

  if (!user || datasets.length === 0) {
    return EmptyState();
  }

  return (
    <Container>
      <table className="w-full rounded">
        <thead className=" bg-slate-200">
          <tr className="text-left font-bold">
            <th className="table-padding">Dataset Name</th>
            <th className="table-padding">Processed</th>
            <th className="table-padding">View Dataset</th>
            <th className="table-padding text-right">Delete Dataset</th>
          </tr>
        </thead>
        <tbody>
          {datasets.map(({name, processed}) => (
            <tr
              key={name}
              className="border border-y border-slate-200 py-4 font-light text-gray-400"
            >
              <td className="table-padding font-normal text-slate-600">
                {name}
              </td>
              <td className="table-padding">
                {!processed ? (
                  <p className="text-orange-300">Processing</p>
                ) : (
                  <p className="text-green-500">Ready</p>
                )}
              </td>
              <td className="table-padding text-blue-500 underline">
                <Link href={`/datasets/datasetContentsView/${name}`}>
                  <p className="cursor-pointer">View</p>
                </Link>
              </td>
              <td className="table-padding text-right text-red-400">
                <button onClick={() => _deleteDataset(name)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Container>
  );
}

interface ContainerProps {
  children: ReactNode;
}

function EmptyState() {
  return (
    <Container>
      <div className="flex h-full flex-col items-center justify-center">
        <p className="select-none text-gray-400">
          No datasets for current user
        </p>
      </div>
    </Container>
  );
}

function Container({children}: ContainerProps) {
  return (
    <div className="h-64 rounded-md border-2 border-slate-200 bg-slate-100 shadow-md">
      {children}
    </div>
  );
}
