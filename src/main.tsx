import React from 'react'
import * as ReactDOM from 'react-dom'

const App: React.FC = () => {
  return <div>bbbb</div>
}

const renderApp = () => {
  ReactDOM.render(<App />, document.getElementById('app'))
}

renderApp()
