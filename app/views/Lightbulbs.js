import React from 'react'
import ReactDOM from 'react-dom';
import { browserHistory } from 'react-router'
import FloatingActionButton from 'material-ui/lib/floating-action-button';
import ContentAdd from 'material-ui/lib/svg-icons/content/add';
import Spinner from '../components/spinner'
import AddLightbulbForm from '../components/add_lightbulb_form'
import { attemptToggleLightbulbState, attemptAddLightbulb, requestLightbulbs } from '../actions/lightbulbs'

import ExositeTheme from './ExositeTheme'

import List from 'material-ui/lib/lists/list';
import ListItem from 'material-ui/lib/lists/list-item';
import ActionInfo from 'material-ui/lib/svg-icons/action/info';
import Divider from 'material-ui/lib/divider';
import Avatar from 'material-ui/lib/avatar';
import LightbulbIcon from 'material-ui/lib/svg-icons/action/lightbulb-outline.js';
import ActionAssignment from 'material-ui/lib/svg-icons/action/assignment';
import Colors from 'material-ui/lib/styles/colors';
import IconButton from 'material-ui/lib/icon-button';
import MoreVertIcon from 'material-ui/lib/svg-icons/navigation/more-vert';
import IconMenu from 'material-ui/lib/menus/icon-menu';
import MenuItem from 'material-ui/lib/menus/menu-item';
import Checkbox from 'material-ui/lib/checkbox';
import Popover from 'material-ui/lib/popover/popover';
import RaisedButton from 'material-ui/lib/raised-button';

export default React.createClass({

  contextTypes: {
    store: React.PropTypes.object
  },

  showLightbulbMenu(event) {
    console.log("in showLightbulbMenu");
    // initialize modal element
    var modalEl = document.createElement('div');
    //modalEl.style.width = '100px';
    //modalEl.style.height = 'auto';
    //modalEl.style.position = 'relative';
    //modalEl.style.left = event.screenX;
    //modalEl.style.top = event.screenY;
    //modalEl.style.backgroundColor = '#fff';

    // show modal
    mui.overlay('on', modalEl);
  },

  openMenu() {
    console.log("in openMenu")
  },

  showAddLightbulbForm() {
    console.log("in showAddLightbulbForm");
    //var modalEl = document.createElement('div');
    //
    ////ReactDOM.render(<AddLightbulbForm onSubmit={this.handleAddLightbulb} isLoading={false} />, modalEl);
    //
    //mui.overlay('on');
  },

  handleAddLightbulb (request) {
    attemptAddLightbulb(request.sn)(this.context.store.dispatch, this.context.store.getState)
  },

  componentWillMount () {
    let state = this.context.store.getState()

    // FIXME: This is probably the wrong way to do this.
    if (state.auth.session === undefined) {
      browserHistory.push('/login')
      return
    }

    //this.unsubscribe = this.context.store.subscribe(() => {
    //  // FIXME: This is definitely the wrong way to do this, use react-redux's `connect`
    //  this.forceUpdate()
    //})
    //
    //// TODO: replace all these calls with redux-thunk
    //requestLightbulbs()(this.context.store.dispatch, this.context.store.getState)
    //
    //this.pollInterval = 1000
    //
    //this.updateStatuses()
    //
    //window.addEventListener("blur", this.onblur)
    //window.addEventListener("focus", this.onfocus)
  },

  //onblur () {
  //  this.pollInterval = 10000
  //},
  //
  //onfocus () {
  //  this.pollInterval = 1000
  //  this.updateStatuses()
  //},

  //updateStatuses () {
  //  let state = this.context.store.getState()
  //  if (state.lightbulbs.isFetching == false) {
  //    requestLightbulbs()(this.context.store.dispatch, this.context.store.getState)
  //  }
  //
  //  this.pollTimer = window.setTimeout(() => {
  //    this.updateStatuses()
  //  }, this.pollInterval)
  //},

  componentWillUnmount () {
    if (typeof this.unsubscribe == "function") { this.unsubscribe() }
    if (this.pollTimer != undefined) { window.clearTimeout(this.pollTimer); this.pollTimer = undefined}

    window.removeEventListener("blur", this.onblur)
    window.removeEventListener("focus", this.onfocus)
  },

  render () {
    let spinner_when_waiting = (
      this.context.store.getState().lightbulbs.isFetching && this.context.store.getState().lightbulbs.statuses.length == 0
      ? <Spinner />
      : <Spinner style={{visibility: "hidden"}} />
    )

    let error_message = (
      this.context.store.getState().auth.error == null
      ? <div></div>
      : <div className='messagebox error'>{this.context.store.getState().auth.error}</div>
    )

    let info_message_when_none = (
      this.context.store.getState().lightbulbs.statuses.length === 0
      ? <div className='messagebox info'>You do not have any lightbulbs, you can add one below.</div>
      : <div></div>
    )

    let state = this.context.store.getState()

    const actionButtonStyle = {
      'float': 'right',
      color: '#FF9300'
    };

    var addMoreButton = (
      <FloatingActionButton
        onMouseDown={this.showAddLightbulbForm}
        onTouchTap={this.showAddLightbulbForm}
        backgroundColor={ExositeTheme.palette.accent1Color}
        mini={true} >
        <ContentAdd />
      </FloatingActionButton> );

    const iconButtonElement = (
      <IconButton
        touch={true}
        disabled={false}
        >
        <MoreVertIcon color={Colors.grey400} />
      </IconButton>
    );

    const rightIconMenu = (
      <IconMenu
        iconButtonElement={<IconButton><MoreVertIcon /></IconButton>}
        anchorOrigin={{horizontal: 'left', vertical: 'top'}}
        targetOrigin={{horizontal: 'left', vertical: 'top'}}
        >
        <MenuItem primaryText="Refresh" />
        <MenuItem primaryText="Send feedback" />
        <MenuItem primaryText="Settings" />
        <MenuItem primaryText="Help" />
        <MenuItem primaryText="Sign out" />
      </IconMenu>
    );




    return (
      <div>
        <h2>Devices {spinner_when_waiting}</h2>
        {error_message}
        {info_message_when_none}
        <List>
        {state.lightbulbs.statuses.sort((a,b) => a.serialnumber > b.serialnumber).map( (m,i) => {

            return (
                <ListItem key={i}
                          leftAvatar={<Avatar icon={<LightbulbIcon />} backgroundColor={ m.state === 'on' ? Colors.yellow600 : Colors.grey300} />}

                          primaryText={m.name}/> )
          })}

          <ListItem rightIconButton={rightIconMenu} />
          <ListItem rightIconButton={addMoreButton} />
        </List>
       </div>
    )
  }
})

