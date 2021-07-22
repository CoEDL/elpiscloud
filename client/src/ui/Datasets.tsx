import React, { useState } from "react";
import { Container, Header, Image, Label, Table } from "semantic-ui-react";

export const Datasets = () => {
  const [uploadedFiles, setUploadedFiles] = useState([{
    fileName: "1_1_1.wav",
    type: "Audio file",
    fileSize: "123KB"
  }]);

  return <Container style={{ padding: "7em 0em 3em 0em" }}>
    <Container text>
    <Header as="h1">Datasets</Header>
    <p>
      Here you can create datasets by collecting and uploading audio. There are two types of transcription supported in Elpisnet: word and phoneme.
      <ul>
        <li><b>Word transcription</b> requires recordings, corresponding transcriptions and a letter-to-sound file. The letter-to-sound file is required to generate a pronunciation dictionary, which we call the <i>grapheme-to-phoneme</i> or <i>G2P</i> process.</li>
        <li><b>Phoneme transcription</b> only requires recordings and corresponding transcriptions.</li>    
      </ul> 
    </p>
    </Container>
    <Container>
    <Table celled>
        <Table.Header>
        <Table.Row>
            <Table.HeaderCell>File name</Table.HeaderCell>
            <Table.HeaderCell>Type</Table.HeaderCell>
            <Table.HeaderCell>File size</Table.HeaderCell>
        </Table.Row>
        </Table.Header>

        <Table.Body>
        {uploadedFiles.map(file => <Table.Row>
            <Table.Cell>{file.fileName}</Table.Cell>
            <Table.Cell>{file.type}</Table.Cell>
            <Table.Cell>{file.fileSize}</Table.Cell>
        </Table.Row>)}
        </Table.Body>
    </Table>
    </Container>
  </Container>;
};
