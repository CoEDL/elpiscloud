import React from 'react';

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
            <th></th>
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
                <td className="w-fit max-w-full">
                  {/* TODO TODO TODO */}
                  <button
                    onClick={() => deleteFile(filename)}
                    className="m-0 justify-center rounded bg-slate-200 px-1"
                  >
                    <i className="bi bi-x"></i>
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
