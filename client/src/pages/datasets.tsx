import React from 'react';
import {
  Container,
  Dropdown,
  Form,
  Grid,
  Header,
  Input,
  Segment,
  Table,
} from 'semantic-ui-react';
import {NAME_EXTENSION_MAP} from 'lib/file_extensions';
import {MOCK_FILES} from 'mock';

export default function Datasets() {
  return (
    <Container>
      <Header as="h1">Datasets</Header>
      <Segment>
        Here you can create datasets, based off of the files you upload in the
        Files menu.
      </Segment>
      <Grid>
        <Grid.Column width={8}>
          {Array.from(NAME_EXTENSION_MAP).map(name => (
            <Grid.Row key={name[0]}>
              <h3>{name[0]}</h3>
              <Table selectable>
                <Table.Header>
                  <Table.Row>
                    <Table.HeaderCell>File name</Table.HeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {Array.from(MOCK_FILES)
                    .sort()
                    .filter(file => file.includes(name[1]))
                    .map(file => (
                      <Table.Row key={file}>
                        <Table.Cell>{file}</Table.Cell>
                      </Table.Row>
                    ))}
                </Table.Body>
              </Table>
            </Grid.Row>
          ))}
        </Grid.Column>
        <Grid.Column width={8}>
          <Form>
            <Form.Field>
              <label>Selection mechanism</label>
              <Dropdown placeholder="Selection mechanism" fluid selection />
            </Form.Field>
            <Form.Field>
              <label>Tier name</label>
              <Dropdown placeholder="Tier name" fluid selection />
            </Form.Field>
            <Form.Field>
              <label>Tier type</label>
              <Dropdown placeholder="Tier type" fluid selection />
            </Form.Field>
            <Form.Field>
              <label>Tier order</label>
              <Dropdown placeholder="Tier order" fluid selection />
            </Form.Field>
            <Form.Field>
              <label>Punctuation to replace with spaces</label>
              <Input placeholder="Punctuation to replace with spaces" />
            </Form.Field>
            <Form.Field>
              <label>Punctuation to remove</label>
              <Input placeholder="Punctuation to remove" />
            </Form.Field>
            <Form.Field>
              <label>Words to remove</label>
              <Input placeholder="Words to remove" />
            </Form.Field>
            <Form.Field>
              <label>Tags to remove</label>
              <Input placeholder="Tags to remove" />
            </Form.Field>
          </Form>
        </Grid.Column>
      </Grid>
    </Container>
  );
}
