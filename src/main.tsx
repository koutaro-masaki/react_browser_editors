import React from 'react'
import * as ReactDOM from 'react-dom'
import App from './app'

const renderApp = () => {
  ReactDOM.render(<App />, document.getElementById('app'))
}

renderApp()
