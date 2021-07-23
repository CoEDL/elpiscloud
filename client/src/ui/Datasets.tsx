import React, { useState } from "react";
import { Container, Header, Segment, Table } from "semantic-ui-react";

export const Datasets: () => JSX.Element = () => {
  const [uploadedFiles, setUploadedFiles] = useState([]);

  setUploadedFiles([
    {
      fileName: "1_1_1.wav",
      type: "Audio file",
      fileSize: "123KB",
    },
  ]);

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
      <Table>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>File name</Table.HeaderCell>
            <Table.HeaderCell>Type</Table.HeaderCell>
            <Table.HeaderCell>File size</Table.HeaderCell>
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {uploadedFiles.map((file) => (
            <Table.Row key={file.fileName}>
              <Table.Cell>{file.fileName}</Table.Cell>
              <Table.Cell>{file.type}</Table.Cell>
              <Table.Cell>{file.fileSize}</Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </Container>
  );
};
