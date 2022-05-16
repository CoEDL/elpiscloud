import type {AppProps} from 'next/app';
import {NextPage} from 'next/types';
import 'styles/globals.css';
import MainLayout from '../layouts/MainLayout';
import 'bootstrap-icons/font/bootstrap-icons.css';

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
