import React, {useState} from 'react';
import Dropzone from 'react-dropzone';
import {
  Button,
  Container,
  Grid,
  Header,
  Icon,
  Segment,
  Table,
} from 'semantic-ui-react';
import {NAME_EXTENSION_MAP} from 'lib/file_extensions';

type FileObject = {
  type: string;
  fileSize: number;
};

export default function Files() {
  const [uploadedFiles, setUploadedFiles] = useState(
    new Map<string, FileObject>()
  );

  const updateAcceptedFiles = (acceptedFiles: File[]) => {
    acceptedFiles.forEach(file =>
      setUploadedFiles(
        prev =>
          new Map([
            ...prev,
            [
              file.name,
              {
                type: file.type,
                fileSize: file.size,
              },
            ],
          ])
      )
    );
  };

  const deleteFile = (fileName: string) => {
    setUploadedFiles(prev => {
      const newState = new Map(prev);
      newState.delete(fileName);
      return newState;
    });
  };

  return (
    <Container style={{padding: '7em 0em 3em 0em'}}>
      <div className="prose max-w-none lg:prose-xl">
        <h1>Files</h1>
        <p>
          Here you can create Files by collecting and uploading audio. There are
          two types of transcription supported in Elpisnet: word and phoneme.
        </p>
        <ul>
          <li>
            <b>Word transcription</b> requires recordings, corresponding
            transcriptions and a letter-to-sound file. The letter-to-sound file
            is required to generate a pronunciation dictionary, which we call
            the <i>grapheme-to-phoneme</i> or <i>G2P</i> process.
          </li>
          <li>
            <b>Phoneme transcription</b> only requires recordings and
            corresponding transcriptions.
          </li>
        </ul>
      </div>
      <Dropzone onDrop={acceptedFiles => updateAcceptedFiles(acceptedFiles)}>
        {({getRootProps, getInputProps}) => (
          <section>
            <div {...getRootProps()}>
              <input {...getInputProps()} />
              <Segment placeholder>
                <Header icon>
                  <Icon name="long arrow alternate down" />
                  Drag and drop or click to select files.
                </Header>
              </Segment>
            </div>
          </section>
        )}
      </Dropzone>
      <br />
      <Grid columns={2}>
        <Grid.Row>
          {Array.from(NAME_EXTENSION_MAP).map(name => (
            <Grid.Column key={name[0]}>
              <h3>{name[0]}</h3>
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
                  {Array.from(uploadedFiles)
                    .sort()
                    .filter(file => file[0].includes(name[1]))
                    .map(file => (
                      <Table.Row key={file[0]}>
                        <Table.Cell>{file[0]}</Table.Cell>
                        <Table.Cell>{file[1].type}</Table.Cell>
                        <Table.Cell>{file[1].fileSize}</Table.Cell>
                        <Table.Cell textAlign="right">
                          <Button
                            size="tiny"
                            icon
                            onClick={() => deleteFile(file[0])}
                          >
                            <Icon name="delete" />
                          </Button>
                        </Table.Cell>
                      </Table.Row>
                    ))}
                </Table.Body>
              </Table>
            </Grid.Column>
          ))}
        </Grid.Row>
      </Grid>
    </Container>
  );
}
