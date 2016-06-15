import React from 'react'
import { Provider } from 'react-redux'
import AppStore from '../stores/app'
import { Link } from 'react-router'
import Container from 'muicss/lib/react/container'

//import ThemeManager from 'material-ui/lib/styles/theme-manager';
//import ExositeTheme from './ExositeTheme';

import injectTapEventPlugin from 'react-tap-event-plugin';

// Needed for onTouchTap
// Check this repo:
// https://github.com/zilverline/react-tap-event-plugin
injectTapEventPlugin();


export default React.createClass({

  //the key passed through context must be called "muiTheme"
  //childContextTypes : {
  //  muiTheme: React.PropTypes.object
  //},

  //getChildContext() {
  //  return {
  //    muiTheme: ThemeManager.getMuiTheme(ExositeTheme),
  //  };
  //},

  render () {
   return (
      <Provider store={AppStore}>
        <div>
          {this.props.children}
        </div>
      </Provider>
    )
  }
})
