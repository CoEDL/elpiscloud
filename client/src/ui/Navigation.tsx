import React from "react";
import { Link } from "react-router-dom";
import { Container, Header, Image, Menu } from "semantic-ui-react";

export const Navigation = () => (
  <Menu fixed="top" inverted>
    <Container>
      <Link to="/"><Menu.Item header>
        Elpisnet
      </Menu.Item></Link>
      <Link to="/datasets">
      <Menu.Item>Datasets</Menu.Item>
      </Link>
      <Link to="/train">
      <Menu.Item>Train</Menu.Item>
      </Link>
      <Link to="/transcribe">
      <Menu.Item>Transcribe</Menu.Item>
      </Link>
    </Container>
  </Menu>
);
