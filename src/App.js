import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import { BrowserRouter as Router, Route, Switch, Link,Redirect } from "react-router-dom";
import ViewBlockprobePublicComponent from "./view/ViewBlockprobePublic";
import ViewBlockprobePublicWrapper from './wrapper/public/ViewBlockprobePublicWrapper';
import UserSession from "./user-session/UserSession";
import PublicWallComponent from './view/viewWall/PublicWall';

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

            <Route path="/wall/:userId"  
                        component={PublicWallComponent}
              /> 

            <Route exact path="/"  
                        component={UserSession}
              />

            <Redirect from="*" to="/" />
          </Switch>
        </Router>
      </div>
    );
  }
}

export default App;
