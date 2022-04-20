import type {NextPage} from 'next';
import {FormattedMessage} from 'react-intl';
import {Container, Image} from 'semantic-ui-react';

const Home: NextPage = () => {
  return (
    <Container text style={{padding: '7em 0em 3em 0em'}}>
      <Image
        src="https://github.com/CoEDL/elpis/blob/master/docs/img/elpis.png?raw=true"
        size="medium"
        centered
      />
      <h1 className="title">
        <FormattedMessage
          id="welcome.title"
          defaultMessage="Elpis"
          description="Title on main page"
        />
      </h1>

      <p className="">
        <FormattedMessage
          id="welcome.description"
          defaultMessage="Description"
          description="Description on main page"
        />
      </p>
    </Container>
  );
};

export default Home;
