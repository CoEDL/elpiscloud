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
        <Head>
          <title>Elpis Cloud</title>
        </Head>
        <div className="flex flex-col max-w-5xl mx-auto min-h-screen">
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </IntlProvider>
    </AuthProvider>
  );
}
