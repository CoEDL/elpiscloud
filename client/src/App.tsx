import React from "react";
import { Container, Header, Menu } from "semantic-ui-react";

export function App(): JSX.Element | null {
  return (
    <div>
      <Menu fixed="top" inverted>
        <Container>
          <Menu.Item as="a" header>
            Elpis
          </Menu.Item>
          <Menu.Item as="a">Home</Menu.Item>
        </Container>
      </Menu>

      <Container text style={{ paddingTop: "7em" }}>
        <Header as="h1">Elpis</Header>
        <p>
          Elpis is a tool which allows language workers with minimal
          computational experience to build their own speech recognition models
          to automatically transcribe audio. It relies on the Kaldi automatic
          speech recognition (ASR) toolkit. Kaldi is notorious for being
          difficult to build, use and navigate - even for trained computer
          scientists. The goal of Elpis is to expose the power of Kaldi to
          linguists and language workers by abstracting away much of the
          needless technical complexity.
        </p>
      </Container>
    </div>
  );
}
