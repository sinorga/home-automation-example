import React, { PropTypes } from 'react'
import { browserHistory } from 'react-router'
import { connect } from 'react-redux'
import AppBar from 'material-ui/lib/app-bar';
import FlatButton from 'material-ui/lib/flat-button';

import { logout } from '../actions/auth'

let appBarStyle = {
  backgroundColor: '#ffffff'
};

const NavBar = React.createClass({
  /**
   * TODO: this can't the right way to handle logging out...
   */
  handleLogout(event) {
    event.preventDefault();

    logout()(this.props.dispatch);

    browserHistory.push('/login');

    this.forceUpdate();
  },  
  render() {
    return (
      <AppBar title={ <div className='appbar-logo-container'>
                  <img src='/images/example_iot_company_logo_mark.svg' />
              </div> }
              style={ appBarStyle }
              iconElementRight={ <FlatButton label="LOGOUT"
                primary={true}
                style={{ color: 'rgb(255, 64, 129)' }}
                onTouchStart={this.handleLogout}
                onMouseUp={this.handleLogout} /> }
              showMenuIconButton={false} />
    )
  }
})

export default connect()(NavBar);
