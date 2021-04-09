import React from 'react'
import {BrowserRouter as Router, Switch, Route, Link, useRouteMatch, useParams} from 'react-router-dom'

import AceEditorPage from './ace_editor'
import SamplePage from './sample'

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
              <Link to="/ace-editor">Ace Editor</Link>
            </li>
            <li>
              <Link to='/sample-page'>Editor Sample</Link>
            </li>
            <li>
              <Link to="/topics">Topics</Link>
            </li>
          </ul>
        </nav>

        <Switch>
          <Route path="/ace-editor">
            <AceEditorPage />
          </Route>
          <Route path='/sample-page'>
            <SamplePage />
          </Route>
          <Route path="/topics">
            <Topics />
          </Route>
          <Route path="/">
            <Home />
          </Route>
        </Switch>
      </div>
    </Router>
  )
}

const Home: React.FC = () => <h2>Home</h2>

const Topics = () => {
  const match = useRouteMatch()

  return (
    <div>
      <h2>Topics</h2>

      <ul>
        <li>
          <Link to={`${match.url}/components`}>Components</Link>
        </li>
        <li>
          <Link to={`${match.url}/props-v-state`}>Props v. State</Link>
        </li>
      </ul>

      <Switch>
        <Route path={`${match.path}/:topicId`}>
          <Topic />
        </Route>
        <Route path={`${match.path}`}>
          <h3>Please select a topic.</h3>
        </Route>
      </Switch>
    </div>
  )
}

const Topic = () => {
  const {topicId} = useParams<{ topicId: string }>()
  return <h3>Requested topic ID: {topicId}</h3>
}

export default App
