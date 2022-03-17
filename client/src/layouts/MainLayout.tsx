import Head from 'next/head';
import {ReactNode} from 'react';
import Footer from 'components/branding/Footer';
import Header from 'components/branding/Header';
import {AuthProvider} from 'contexts/auth';
import {IntlProvider} from 'contexts/internationalisation';

interface layoutProps {
  children: ReactNode;
}

export default function MainLayout({children}: layoutProps) {
  return (
    <AuthProvider>
      <IntlProvider>
        <div>
          <Head>
            <title>Elpis Cloud</title>
          </Head>
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="container flex-1 py-8">{children}</main>
            <Footer />
          </div>
        </div>
      </IntlProvider>
    </AuthProvider>
  );
}
