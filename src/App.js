import React, { lazy, Suspense } from "react";
import Dashboard from "./components/Dashboard";
import "./app.css";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
export default function App() {
  return (
    <Router>
      <Suspense fallback={<p>Loading...</p>}>
        <Switch>
          <Route path="/" component={Dashboard} />
        </Switch>
      </Suspense>
    </Router>
  );
}
