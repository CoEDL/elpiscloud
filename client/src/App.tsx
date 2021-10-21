import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import common_en from './i18n/en-GB/common.json';
import common_fr from './i18n/fr/common.json';
import { Navigation } from "./ui/Navigation";
import { Home } from "./ui/Home";
import { Datasets } from "./ui/Datasets";
import { Footer } from "./ui/Footer";
import { Files } from "./ui/Files";
import { Train } from "./ui/Train";
import { Transcribe } from "./ui/Transcribe";

import flatten from "flat";
import { IntlProvider } from "react-intl";

const messages = {
    'en': common_en,
    'fr': common_fr
}

const language = navigator.language.split(/[-_]/)[0];

export const App: () => JSX.Element = () => {
  return (
    <IntlProvider locale={language} messages={flatten(messages[language])}>
      <Router>
        <Navigation />
        <Switch>
          <Route exact path="/">
            <Home />
          </Route>
          <Route path="/files">
            <Files />
          </Route>
          <Route path="/datasets">
            <Datasets />
          </Route>
          <Route path="/train">
            <Train />
          </Route>
          <Route path="/transcribe">
            <Transcribe />
          </Route>
        </Switch>
        <Footer />
      </Router>
    </IntlProvider>
  );
};
