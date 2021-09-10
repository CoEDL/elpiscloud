import React, { useState } from "react";
import { Container, Dropdown, Form, Grid, GridColumn, Header, Segment } from "semantic-ui-react";

const MOCK_DATASETS = [
  {
    key: "1",
    value: "Sample Dataset 1",
    text: "Sample Dataset 1",
  },
  {
    key: "2",
    value: "Sample Dataset 2",
    text: "Sample Dataset 2",
  },
  {
    key: "3",
    value: "Sample Dataset 3",
    text: "Sample Dataset 3",
  },
];

const MOCK_LETTER_TO_SOUND = [
  {
    key: "1",
    value: "Sample letter-to-sound file 1",
    text: "Sample letter-to-sound file 1",
  },
  {
    key: "2",
    value: "Sample letter-to-sound file 2",
    text: "Sample letter-to-sound file 2",
  },
  {
    key: "3",
    value: "Sample letter-to-sound file 3",
    text: "Sample letter-to-sound file 3",
  },
];

const MOCK_ENGINES = [
  {
    key: "1",
    value: "Kaldi",
    text: "Kaldi",
  },
  {
    key: "2",
    value: "ESPnet",
    text: "ESPnet",
  },
  {
    key: "3",
    value: "HFT",
    text: "HFT (beta)",
  },
];

export const Train: () => JSX.Element = () => {
  const [engine, setEngine] = useState(MOCK_ENGINES[0].value);

  return (
    <Container style={{ padding: "7em 0em 3em 0em" }}>
      <Header as="h1">Train</Header>
      <Segment>
        Here you can train models by selecting a dataset, creating a
        pronunciation dictionary with letter-to-sound files, and selecting
        various model settings.
      </Segment>
      <Form>
      <Form.Field>
      <label>Engine</label>
        <Dropdown
          placeholder="Engine"
          fluid
          selection
          options={MOCK_ENGINES}
          onChange={(_, { value }) => setEngine(value as string)}
        />
        </Form.Field>
        <Form.Field>
        <label>Dataset</label>
        <Dropdown
          placeholder="Dataset"
          fluid
          selection
          options={MOCK_DATASETS}
        />
        </Form.Field>
      {engine === "Kaldi" && (
          <Form.Field>
          <label>Letter-to-sound file</label>
          <Dropdown
            placeholder="Letter-to-sound file"
            fluid
            selection
            options={MOCK_LETTER_TO_SOUND}
          />
          </Form.Field>
      )}
      </Form>
    </Container>
  );
};
