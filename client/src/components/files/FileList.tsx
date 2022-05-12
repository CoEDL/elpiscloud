import React from 'react';
import {Icon} from 'semantic-ui-react';

type Props = {
  files: Map<string, File>;
  deleteFile: (filename: string) => void;
};

const FileList = ({files, deleteFile}: Props) => {
  return (
    <div>
      <table className="w-full rounded">
        <thead className="bg-slate-200 text-left font-bold">
          <tr>
            <th className="table-padding">File name</th>
            <th className="table-padding">Type</th>
            <th className="table-padding">File size</th>
            <th className="table-padding"></th>
          </tr>
        </thead>
        <tbody>
          {Array.from(files)
            .sort()
            .map(([filename, file]) => (
              <tr
                key={filename}
                className="border border-y border-slate-200 py-4 font-normal text-slate-600"
              >
                <td className="table-padding">{filename}</td>
                <td className="table-padding">{file.type}</td>
                <td className="table-padding">{file.size}</td>
                <td className="table-padding">
                  {/* TODO TODO TODO */}
                  <button onClick={() => deleteFile(filename)}>
                    <Icon name="delete" />
                  </button>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
};

export default FileList;
