import type {NextPage} from 'next';
import {FormattedMessage} from 'react-intl';

const Home: NextPage = () => {
  return (
    <>
      <div className="relative flex justify-center pt-[90px] pb-[20px]">
        <img
          className="h-28"
          src="https://github.com/CoEDL/elpis/blob/master/docs/img/elpis.png?raw=true"
        />
      </div>
      <div>
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
      </div>
    </>
  );
};

export default Home;
