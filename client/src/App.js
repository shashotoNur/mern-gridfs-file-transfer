import React from 'react';
import { BrowserRouter as Router, Route} from "react-router-dom";

import Files from './components/Files';
import SingleFile from './components/SingleFile';

const App = () => (
  <div className='container mt-4'>
    <h4 className='display-4 text-center mb-4'>File Upload</h4>

    <Router>
      <Route path="/" exact component={Files} />
      <Route path="/:id" component={SingleFile} />
    </Router>
  </div>

);

export default App;