import React from 'react';
import Link from 'next/link';
import {Container, Menu} from 'semantic-ui-react';

const Header = () => (
  <Menu inverted>
    <Container>
      <Link href="/">
        <Menu.Item header>Elpiscloud</Menu.Item>
      </Link>
      <Link href="/files">
        <Menu.Item>Files</Menu.Item>
      </Link>
      <Link href="/datasets">
        <Menu.Item>Datasets</Menu.Item>
      </Link>
      <Link href="/train">
        <Menu.Item>Train</Menu.Item>
      </Link>
      <Link href="/transcribe">
        <Menu.Item>Transcribe</Menu.Item>
      </Link>
    </Container>
  </Menu>
);

export default Header;
