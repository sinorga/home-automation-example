import React from 'react'
import { browserHistory } from 'react-router'
import Button from 'muicss/lib/react/button'
import Appbar from 'muicss/lib/react/appbar'

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
          <h2>My Home</h2>
          <Button
            color='primary'
            onClick={() => { browserHistory.push('/lightbulbs') }}>
            My Lightbulbs
          </Button>
          <Button
            color='primary'
            onClick={() => { browserHistory.push('/account') }}>
            My Account
          </Button>
        </div>
      )
    } else {
      return (
        <div>
          <h1>Brilliant Beacon</h1>
          <h4>Smart home lighting solution</h4>
          <Button
            color='primary'
            onClick={() => { browserHistory.push('/login') }}>
            Login
          </Button>
          <Button
            color='primary'
            onClick={() => { browserHistory.push('/signup') }}>
            Create Account
          </Button>
        </div>
      )
    }
  }
})
