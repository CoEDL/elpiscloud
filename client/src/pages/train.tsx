import React, {useState} from 'react';
import {
  Container,
  Dropdown,
  Form,
  Grid,
  Header,
  Segment,
  Table,
} from 'semantic-ui-react';
import {MOCK_DATASETS, MOCK_L2S, MOCK_ENGINES, MOCK_WORDLIST} from '../mock';

export default function Train() {
  const [engine, setEngine] = useState(MOCK_ENGINES[0].value);
  const [dataset, setDataset] = useState(MOCK_DATASETS[0].value);
  const [l2s, setL2S] = useState(MOCK_L2S[0].value);

  return (
    <Container style={{padding: '7em 0em 3em 0em'}}>
      <Header as="h1">Train</Header>
      <Segment>
        Here you can train models by selecting a dataset, creating a
        pronunciation dictionary with letter-to-sound files, and selecting
        various model settings.
      </Segment>
      <Grid>
        <Grid.Column width={8}>
          <Form>
            <Form.Field>
              <label>Engine</label>
              <Dropdown
                placeholder="Engine"
                fluid
                selection
                options={MOCK_ENGINES}
                onChange={(_, {value}) => setEngine(value as string)}
              />
            </Form.Field>
            <Form.Field>
              <label>Dataset</label>
              <Dropdown
                placeholder="Dataset"
                fluid
                selection
                options={MOCK_DATASETS}
                onChange={(_, {value}) => setDataset(value as string)}
              />
            </Form.Field>

            {engine === 'Kaldi' && (
              <Form.Field>
                <label>Letter-to-sound file</label>
                <Dropdown
                  placeholder="Letter-to-sound file"
                  fluid
                  selection
                  options={MOCK_L2S}
                  onChange={(_, {value}) => setL2S(value as string)}
                />
              </Form.Field>
            )}
          </Form>
        </Grid.Column>
        <Grid.Column width={8}>
          {engine === 'Kaldi' && (
            <Header as="h3">Letter-to-sound mappings</Header>
          )}
          <Container>
            <Header as="h3">Word list</Header>
            <Table>
              <Table.Header>
                <Table.HeaderCell>Word</Table.HeaderCell>
                <Table.HeaderCell>Count</Table.HeaderCell>
              </Table.Header>
              {Array.from(MOCK_WORDLIST).map(([k, v]) => (
                <Table.Row key={k}>
                  <Table.Cell>{k}</Table.Cell>
                  <Table.Cell>{v}</Table.Cell>
                </Table.Row>
              ))}
            </Table>
          </Container>
        </Grid.Column>
      </Grid>
    </Container>
  );
}
