import React from "react";
import { Link } from "react-router-dom";
import { Container, Menu } from "semantic-ui-react";

export const Navigation: () => JSX.Element = () => (
  <Menu fixed="top" inverted>
    <Container>
      <Link to="/">
        <Menu.Item header>Elpiscloud</Menu.Item>
      </Link>
      <Link to="/files">
        <Menu.Item>Files</Menu.Item>
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
