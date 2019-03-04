import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import ViewBlockprobePublicComponent from "./view/ViewBlockprobePublic";


class App extends Component {
  render() {
    return (
      <div className="App">
        <div> Blockprobe</div>

        <Router>
          <Route path="/view/:bId"  
                      component={ViewBlockprobePublicComponent}
            />
        </Router>
      </div>
    );
  }
}

export default App;
