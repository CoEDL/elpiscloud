import {useAuth} from 'contexts/auth';
import {deleteModel, getModels} from 'lib/api/models';
import Link from 'next/link';
import React, {ReactNode, useEffect, useState} from 'react';
import {Model, ModelTrainingStatus} from 'types/Model';

export default function ModelViewer() {
  const {user} = useAuth();
  const [models, setModels] = useState<Model[]>([]);

  useEffect(() => {
    if (user) {
      getUserModels();
    }
  }, [user]);

  async function getUserModels() {
    const userModels = await getModels(user!);
    setModels(userModels);
  }

  async function _deleteModel(name: string) {
    await deleteModel(user!, name);
    getUserModels();
  }

  if (!user || models.length === 0) {
    return EmptyState();
  }

  const statusView = (status: ModelTrainingStatus) => {
    let colour = '';
    switch (status) {
      case 'training':
        colour = 'text-orange-300';
        break;
      default:
        colour = 'text-green-500';
    }
    return <p className={colour}>{status}</p>;
  };

  return (
    <Container>
      <table className="w-full rounded">
        <thead className=" bg-slate-200">
          <tr className="text-left font-bold">
            <th className="table-padding">Model Name</th>
            <th className="table-padding">Training Status</th>
            <th className="table-padding">View Training</th>
            <th className="table-padding text-right">Delete Model</th>
          </tr>
        </thead>
        <tbody>
          {models.map(({name, trainingStatus}) => (
            <tr
              key={name}
              className="border border-y border-slate-200 py-4 font-light text-gray-400"
            >
              <td className="table-padding font-normal text-slate-600">
                {name}
              </td>
              <td className="table-padding">{statusView(trainingStatus)}</td>
              <td className="table-padding text-blue-500 underline">
                <Link href={`/models/train/${name}`}>
                  <p className="cursor-pointer">View Training</p>
                </Link>
              </td>
              <td className="table-padding text-right text-red-400">
                <button onClick={() => _deleteModel(name)}>Delete</button>
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
        <p className="select-none text-gray-400">No models for current user</p>
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
