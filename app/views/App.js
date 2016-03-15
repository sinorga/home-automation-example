import React from 'react'
import { Provider } from 'react-redux'
import AppStore from '../stores/app'
import { Link } from 'react-router'
import Appbar from 'muicss/lib/react/appbar'
import Container from 'muicss/lib/react/container'

export default React.createClass({
  render () {
    let logout_if_logged_in = (
      true //this.context.store.getState().auth.session !== undefined
      ? <div id='app-nav'><Link to='/logout'>Logout</Link></div>
      : <div />
    )

    return (
      <Provider store={AppStore}>
        <div>
          <Appbar>
            <div id='app-title'><Link to='/'>Sphinx Example</Link></div>
            {logout_if_logged_in}
          </Appbar>
          <Container>
            {this.props.children}
          </Container>
        </div>
      </Provider>
    )
  }
})
