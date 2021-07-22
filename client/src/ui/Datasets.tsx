import React from "react";
import { Container, Header, Image } from "semantic-ui-react";

export const Datasets = () => (
  <Container text style={{ padding: "7em 0em 3em 0em" }}>
    <Header as="h1">Datasets</Header>
    <p>
      Here you can create datasets by collecting and uploading audio. There are two types of transcription supported in Elpisnet: word and phoneme.
      <ul>
        <li><b>Word transcription</b> requires recordings, corresponding transcriptions and a letter-to-sound file. The letter-to-sound file is required to generate a pronunciation dictionary, which we call the <i>grapheme-to-phoneme</i> or <i>G2P</i> process.</li>
        <li><b>Phoneme transcription</b> only requires recordings and corresponding transcriptions.</li>    
      </ul> 
    </p>
  </Container>
);
