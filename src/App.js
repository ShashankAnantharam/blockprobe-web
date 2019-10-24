import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import { BrowserRouter as Router, Route, Switch, Link } from "react-router-dom";
import ViewBlockprobePublicComponent from "./view/ViewBlockprobePublic";
import ViewBlockprobePublicWrapper from './wrapper/public/ViewBlockprobePublicWrapper';
import UserSession from "./user-session/UserSession";

class App extends Component {
  render() {
    return (
      <div className="App">
        <Router>
          <Switch>
            <Route path="/view/:bId/:viewType"  
                        component={ViewBlockprobePublicWrapper}
              />

            <Route path="/view/:bId"  
                        component={ViewBlockprobePublicWrapper}
              />

            <Route path="/"  
                        component={UserSession}
              />
          </Switch>
        </Router>
      </div>
    );
  }
}

export default App;
