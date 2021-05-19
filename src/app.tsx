import React from 'react'
import {BrowserRouter as Router, Switch, Route, Link} from 'react-router-dom'

import SamplePage from './sample'
import PrintPage from './print'

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
          <Route path='/workspace'>
            <SamplePage />
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
