import React from "react";
import { Container, Dropdown, Header, Segment } from "semantic-ui-react";

const MOCK_DATASETS = [
    {
        key: '1',
        value: 'Sample Dataset 1',
        text: 'Sample Dataset 1',
    },
    {
        key: '2',
        value: 'Sample Dataset 2',
        text: 'Sample Dataset 2',
    },
    {
        key: '3',
        value: 'Sample Dataset 3',
        text: 'Sample Dataset 3',
    },
]

const MOCK_LETTER_TO_SOUND = [
    {
        key: '1',
        value: 'Sample letter-to-sound file 1',
        text: 'Sample letter-to-sound file 1',
    },
    {
        key: '2',
        value: 'Sample letter-to-sound file 2',
        text: 'Sample letter-to-sound file 2',
    },
    {
        key: '3',
        value: 'Sample letter-to-sound file 3',
        text: 'Sample letter-to-sound file 3',
    },
]

export const Train: () => JSX.Element = () => (
  <Container style={{ padding: "7em 0em 3em 0em" }}>
    <Header as="h1">Train</Header>
    <Segment>
        Here you can train models by selecting a dataset, creating a pronunciation dictionary with letter-to-sound files, and selecting various model settings.
      </Segment>
    <Dropdown
        placeholder='Select dataset'
        fluid
        selection
        options={MOCK_DATASETS}
    />
    <Dropdown
        placeholder='Select letter-to-sound file'
        fluid
        selection
        options={MOCK_LETTER_TO_SOUND}
    />
  </Container>
);
