import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import { Navigation } from "./ui/Navigation";
import { Home } from "./ui/Home";
import { Footer } from "./ui/Footer";
import { Datasets } from "./ui/Datasets";
import { Train } from "./ui/Train";
import { Transcribe } from "./ui/Transcribe";

export const App: () => JSX.Element = () => {
  return (
    <>
      <Router>
        <Navigation />
        <Switch>
          <Route exact path="/">
            <Home />
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
    </>
  );
};
