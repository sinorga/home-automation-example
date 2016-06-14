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
import FlatButton from 'material-ui/lib/flat-button';
import Dialog from 'material-ui/lib/dialog';

export default React.createClass({

  contextTypes: {
    store: React.PropTypes.object
  },

  showLightbulbModal() {
    console.log("in showLightbulbModal");
    this.lightbulbOpen = true;
  },

  closeLightbulbModal() {
    console.log("in closeLightbulbModal");
    this.lightbulbOpen = false;
  },

  handleAddLightbulb (request) {
    attemptAddLightbulb(request.sn)(this.context.store.dispatch, this.context.store.getState)
  },

  componentWillMount () {
    this.lightbulbOpen = false;

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
      color: '#FF9300',
      marginRight: 10,
      marginTop: 10,
      marginBottom:30
    };

    const actions = [
      <FlatButton
        label="Cancel"
        secondary={true}
        onTouchTap={this.closeLightbulbModal}
        />,
      <FlatButton
        label="Submit"
        primary={true}
        disabled={true}
        onTouchTap={this.handleAddLightbulb}
        />,
    ];

    return (
      <div>
        <h2>Devices {spinner_when_waiting}</h2>
        {error_message}
        {info_message_when_none}
        <List>
        {state.lightbulbs.statuses.sort((a,b) => a.serialnumber > b.serialnumber).map( (m,i) => {
            const rightIconMenu = (
              <IconMenu
                iconButtonElement={<IconButton><MoreVertIcon color={Colors.grey400} /></IconButton>}
                anchorOrigin={{horizontal: 'right', vertical: 'top'}}
                targetOrigin={{horizontal: 'right', vertical: 'top'}} >
                <MenuItem primaryText="Turn on" />
                <MenuItem primaryText="Add Alert" />
                <MenuItem primaryText="Share" />
                <MenuItem primaryText="Edit" />
                <MenuItem primaryText="Delete" />
              </IconMenu>
            );

            return (
                <div key={i}>
                  <ListItem leftAvatar={<Avatar icon={<LightbulbIcon />} backgroundColor={ m.state === 'on' ? Colors.yellow600 : Colors.grey300} />}
                            rightIconButton={rightIconMenu}
                            primaryText={m.name}
                            secondaryText={m.serialnumber}/>
                    <Divider />
                </div>
              )
          })}
        </List>

        <div>
          <FloatingActionButton
            onMouseDown={this.showLightbulbModal}
            backgroundColor={ExositeTheme.palette.accent1Color}
            mini={true}
            style={actionButtonStyle}>
            <ContentAdd />
          </FloatingActionButton>
        </div>

        <Dialog
          title="Dialog With Actions"
          actions={actions}
          modal={false}
          open={this.lightbulbOpen}
          onRequestClose={this.handleClose} >
          The actions in this window were passed in as an array of React objects.
        </Dialog>
       </div>
    )
  }
})

