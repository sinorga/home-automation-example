import React from 'react'
import { render } from 'react-dom'
import { Router, Route, browserHistory, IndexRoute } from 'react-router'

import App from './views/App'
import Login from './views/Login'
import Account from './views/Account'

render((
  <Router history={browserHistory}>
    <Route path='/' component={App}>
      <IndexRoute component={Login} />
      <Route path='/account' component={Account} />
    </Route>
  </Router>
), document.getElementById('app'))
