import React from "react";
import { Container, Header, Image } from "semantic-ui-react";

export const Train = () => (
  <Container text style={{ padding: "7em 0em 3em 0em" }}>
    <Header as="h1">Train</Header>
    <p>
      Elpis is a tool which allows language workers with minimal computational
      experience to build their own speech recognition models to automatically
      transcribe audio. It relies on the Kaldi automatic speech recognition
      (ASR) toolkit. Kaldi is notorious for being difficult to build, use and
      navigate - even for trained computer scientists. The goal of Elpis is to
      expose the power of Kaldi to linguists and language workers by abstracting
      away much of the needless technical complexity.
    </p>
  </Container>
);
