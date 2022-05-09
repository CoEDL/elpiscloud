import type {AppProps} from 'next/app';
import {NextPage} from 'next/types';
import 'semantic-ui-css/semantic.min.css';
import 'styles/globals.css';
import MainLayout from '../layouts/MainLayout';

type PageWithLayout = NextPage & {
  getLayout?: (page: React.ReactElement) => React.ReactElement;
};

function MyApp({Component, pageProps}: AppProps) {
  const getLayout =
    (Component as PageWithLayout).getLayout ||
    (page => <MainLayout>{page}</MainLayout>);
  return getLayout(<Component {...pageProps} />);
}

export default MyApp;
