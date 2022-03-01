import React from 'react';
import {Table, Button, Icon} from 'semantic-ui-react';

type Props = {
  title: string;
  extensionFilter?: string;
  files: Map<string, File>;
  deleteFile: (filename: string) => void;
};

const FileList = ({title, extensionFilter = '', files, deleteFile}: Props) => {
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
            .filter(([filename, _]) => filename.includes(extensionFilter))
            .map(([filename, file]) => (
              <Table.Row key={filename}>
                <Table.Cell>{filename}</Table.Cell>
                <Table.Cell>{file.type}</Table.Cell>
                <Table.Cell>{file.size}</Table.Cell>
                <Table.Cell textAlign="right">
                  <Button size="tiny" icon onClick={() => deleteFile(filename)}>
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
