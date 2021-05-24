import React from 'react'
import {BrowserRouter as Router, Switch, Route, Link} from 'react-router-dom'

import SamplePage from './sample'
import PrintPage from './print'
import WorkSpaceHome from './workspace-home'

const App = () => {
  return (
    <Router>
      <div>
        <nav>
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to='/workspace'>WorkSpace</Link>
            </li>
          </ul>
        </nav>

        <Switch>
          <Route path='/workspace/:id'>
            <SamplePage />
          </Route>
          <Route path='/workspace' strict={true}>
            <WorkSpaceHome />
          </Route>
          <Route path='/print'>
            <PrintPage />
          </Route>
          <Route path="/">
            <Home />
          </Route>
        </Switch>
      </div>
    </Router>
  )
}

const Home = () => <h1>Home</h1>

export default App
