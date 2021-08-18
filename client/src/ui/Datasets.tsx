import React, { useEffect, useState } from "react";
import Dropzone from "react-dropzone";
import {
  Button,
  Container,
  Grid,
  Header,
  Icon,
  Segment,
  Table,
} from "semantic-ui-react";

type FileObject = {
  type: string;
  fileSize: number;
};

export const Datasets: () => JSX.Element = () => {
  const [uploadedFiles, setUploadedFiles] = useState(
    new Map<string, FileObject>()
  );

  const updateAcceptedFiles = (acceptedFiles: File[]) => {
    acceptedFiles.forEach((file) =>
      setUploadedFiles(
        (prev) =>
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

  const nameExtensionMap = new Map([['Audio files', '.wav'], ['Transcription files', '.eaf']])

  const deleteFile = (fileName: string) => {
    setUploadedFiles((prev) => {
      const newState = new Map(prev);
      newState.delete(fileName);
      return newState;
    });
  };

  return (
    <Container style={{ padding: "7em 0em 3em 0em" }}>
      <Header as="h1">Datasets</Header>
      <Segment>
        Here you can create datasets by collecting and uploading audio. There
        are two types of transcription supported in Elpisnet: word and phoneme.
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
      </Segment>
      <Dropzone onDrop={(acceptedFiles) => updateAcceptedFiles(acceptedFiles)}>
        {({ getRootProps, getInputProps }) => (
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
          {Array.from(nameExtensionMap).map(name => <Grid.Column>
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
                  .filter((file) => file[0].includes(name[1]))
                  .map((file) => (
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
          </Grid.Column>)}
        </Grid.Row>
      </Grid>
    </Container>
  );
};
