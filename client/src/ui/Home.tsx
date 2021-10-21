import React from "react";
import { FormattedMessage } from "react-intl";
import { Container, Header, Image } from "semantic-ui-react";

export const Home: () => JSX.Element = () => (
  <Container text style={{ padding: "7em 0em 3em 0em" }}>
    <Image
      src="https://github.com/CoEDL/elpis/blob/master/docs/img/elpis.png?raw=true"
      size="medium"
      centered
    />
    <Header as="h1">
      <FormattedMessage
        id="welcome.title"
        defaultMessage="Elpis"
        description="Title on main page"
      />
    </Header>
    <p>
      <FormattedMessage
        id="welcome.description"
        defaultMessage="Description"
        description="Description on main page"
      />
    </p>
  </Container>
);
