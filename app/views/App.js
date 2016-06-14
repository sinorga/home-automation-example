import React from 'react'
import { Provider } from 'react-redux'
import AppStore from '../stores/app'
import { Link } from 'react-router'
import AppBar from 'material-ui/lib/app-bar';
import Container from 'muicss/lib/react/container'

import ThemeManager from 'material-ui/lib/styles/theme-manager';
import ExositeTheme from './ExositeTheme';

export default React.createClass({

  //the key passed through context must be called "muiTheme"
  childContextTypes : {
    muiTheme: React.PropTypes.object,
  },

  getChildContext() {
    return {
      muiTheme: ThemeManager.getMuiTheme(ExositeTheme),
    };
  },

  render () {
    let logout_if_logged_in = (
      true //this.context.store.getState().auth.session !== undefined
      ? <div id='app-nav'><Link to='/logout'>Logout</Link></div>
      : <div />
    )

    return (
      <Provider store={AppStore}>
        <div>
          <AppBar className="appbar" iconElementLeft={<div id='app-title'><Link to='/'><img className="logo" src="images/example-app-logo.svg" /></Link></div> }  />
          <Container>
            {this.props.children}
          </Container>
        </div>
      </Provider>
    )
  }
})
