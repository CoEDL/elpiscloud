import React from "react";
import { Container } from "semantic-ui-react";

export const Footer: () => JSX.Element = () => (
  <Container text>
    <small>
      2021,{" "}
      <a href="https://www.dynamicsoflanguage.edu.au/">
        CoEDL, Centre of Excellence for the Dynamics of Language.
      </a>
    </small>
  </Container>
);
