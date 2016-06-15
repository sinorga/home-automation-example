import React from 'react'
import { Provider } from 'react-redux'
import AppStore from '../stores/app'
import { Link } from 'react-router'
import AppBar from 'material-ui/lib/app-bar';
import Container from 'muicss/lib/react/container'
import LeftNav from 'material-ui/lib/left-nav';
import MenuItem from 'material-ui/lib/menus/menu-item';

import ThemeManager from 'material-ui/lib/styles/theme-manager';
import ExositeTheme from './ExositeTheme';

import injectTapEventPlugin from 'react-tap-event-plugin';

// Needed for onTouchTap
// Check this repo:
// https://github.com/zilverline/react-tap-event-plugin
injectTapEventPlugin();


export default React.createClass({

  //the key passed through context must be called "muiTheme"
  childContextTypes : {
    muiTheme: React.PropTypes.object,
  },

  getInitialState() {
    return {
      leftNavOpen: false
    }
  },

  getChildContext() {
    return {
      muiTheme: ThemeManager.getMuiTheme(ExositeTheme),
    };
  },

  openLeftNav() {
    console.log("in openLeftNav");
    this.setState({leftNavOpen:true});
  },

  closeLeftNav() {
    console.log("in closeLeftNav");
    this.setState({leftNavOpen:false});
  },

  isLoggedIn() {
    return true // this.context.store.auth.session !== undefined
  },

  render () {
    let menuItemStyle = {
      textDecoration: 'none',
      color: ExositeTheme.palette.alternateTextColor
    };

    let logout_if_logged_in = (
      this.isLoggedIn()
        ? <MenuItem onTouchTap={this.closeLeftNav} style={menuItemStyle}><Link to='/logout' style={menuItemStyle}>Log Out</Link></MenuItem>
        : <div />
    );

    return (
      <Provider store={AppStore}>
        <div>
          <AppBar className="appbar"
                  title={<div id='app-title'><Link to='/'><img className="logo" src="images/example-app-logo.svg" /></Link></div> }
                  onLeftIconButtonTouchTap={this.openLeftNav}/>
          <Container>
            {this.props.children}
          </Container>

          <LeftNav
            docked={false}
            width={300}
            style={{
              backgroundColor: ExositeTheme.palette.primary1Color,
              paddingTop: 35,
              paddingLeft: 15
             }}
            open={this.state.leftNavOpen}
            onRequestChange={this.closeLeftNav} >

            <MenuItem onTouchTap={this.closeLeftNav} style={menuItemStyle}>My Home</MenuItem>
            <MenuItem onTouchTap={this.closeLeftNav} style={menuItemStyle}>Help</MenuItem>
            { logout_if_logged_in }
          </LeftNav>
        </div>


      </Provider>
    )
  }
})
