import React from 'react';
import {Table, Button, Icon} from 'semantic-ui-react';

type FileObject = {
  type: string;
  fileSize: number;
};

type Props = {
  title: string;
  extension?: string;
  files: Map<string, FileObject>;
  deleteFile: (filename: string) => void;
};

const FileList = ({title, extension = '', files, deleteFile}: Props) => {
  return (
    <div>
      <h3>{title}</h3>
      <Table>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>File name</Table.HeaderCell>
            <Table.HeaderCell>Type</Table.HeaderCell>
            <Table.HeaderCell>File size</Table.HeaderCell>
            <Table.HeaderCell></Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {Array.from(files)
            .sort()
            .filter(file => file[0].includes(extension))
            .map(file => (
              <Table.Row key={file[0]}>
                <Table.Cell>{file[0]}</Table.Cell>
                <Table.Cell>{file[1].type}</Table.Cell>
                <Table.Cell>{file[1].fileSize}</Table.Cell>
                <Table.Cell textAlign="right">
                  <Button size="tiny" icon onClick={() => deleteFile(file[0])}>
                    <Icon name="delete" />
                  </Button>
                </Table.Cell>
              </Table.Row>
            ))}
        </Table.Body>
      </Table>
    </div>
  );
};

export default FileList;
