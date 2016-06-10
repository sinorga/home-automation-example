import React from 'react'
import { browserHistory } from 'react-router'
import Button from 'muicss/lib/react/button'

export default React.createClass({
  contextTypes: {
    store: React.PropTypes.object
  },

  isLoggedIn () {
    return this.context.store.getState().auth.session !== undefined
  },

  render () {
    if (this.isLoggedIn()) {
      return (
        <div>
          <h2>Sphinx Example</h2>
          <Button
            color='secondary'
            onClick={() => { browserHistory.push('/lightbulbs') }}>
            My Lightbulbs
          </Button>
          <Button
            color='secondary'
            onClick={() => { browserHistory.push('/account') }}>
            My Account
          </Button>
        </div>
      )
    } else {
      return (
        <div>
          <h2>Sphinx Example</h2>
          <Button
            color='secondary'
            onClick={() => { browserHistory.push('/login') }}>
            Login
          </Button>
          <Button
            color='secondary'
            onClick={() => { browserHistory.push('/signup') }}>
            Signup
          </Button>
        </div>
      )
    }
  }
})
