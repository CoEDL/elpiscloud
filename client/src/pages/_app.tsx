import type {AppProps} from 'next/app';
import {NextComponentType} from 'next/types';
import 'semantic-ui-css/semantic.min.css';
import 'styles/globals.css';
import MainLayout from '../layouts/MainLayout';

type ElpisComponentType = NextComponentType & {
  getLayout?: Function;
};

type ElpisAppProps = AppProps & {Component: ElpisComponentType};

function MyApp({Component, pageProps}: ElpisAppProps) {
  const getLayout =
    Component.getLayout ||
    ((page: ElpisComponentType) => <MainLayout>{page}</MainLayout>);
  return getLayout(<Component {...pageProps} />);
}

export default MyApp;
