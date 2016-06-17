import React, { PropTypes } from 'react'
import ReactDOM from 'react-dom';
import { browserHistory } from 'react-router'
import { Link } from 'react-router'
import FloatingActionButton from 'material-ui/lib/floating-action-button';
import Spinner from '../components/spinner'
import AddLightbulbForm from '../components/add_lightbulb_form'
import { attemptToggleLightbulbState, attemptAddLightbulb, requestLightbulbs } from '../actions/lightbulbs'
import Container from 'muicss/lib/react/container';
import { logout } from '../actions/auth'
import { connect } from 'react-redux'


import ContentAdd from 'material-ui/lib/svg-icons/content/add';
import AppBar from 'material-ui/lib/app-bar';
import List from 'material-ui/lib/lists/list';
import ListItem from 'material-ui/lib/lists/list-item';
import ActionInfo from 'material-ui/lib/svg-icons/action/info';
import Divider from 'material-ui/lib/divider';
import Avatar from 'material-ui/lib/avatar';
import LightbulbIcon from 'material-ui/lib/svg-icons/action/lightbulb-outline.js';
import ActionAssignment from 'material-ui/lib/svg-icons/action/assignment';
import Colors from 'material-ui/lib/styles/colors';
import RaisedButton from 'material-ui/lib/raised-button';
import FlatButton from 'material-ui/lib/flat-button';
import Dialog from 'material-ui/lib/dialog';

// Test 
import { bindActionCreators } from 'redux'

function mapStateToProps(state) {
  return { 
    error: state.lightbulbs.error,
    statuses: state.lightbulbs.statuses
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    { attemptToggleLightbulbState, attemptAddLightbulb, requestLightbulbs }, 
    dispatch)
}

let LightbulbsView = React.createClass({

  contextTypes: {
    store: React.PropTypes.object
  },

  getInitialState() {
    return {
      lightbulbModalOpen: false
    }
  },

  showLightbulbModal() {
    this.setState({lightbulbModalOpen: true});
  },

  closeLightbulbModal() {
    this.setState({lightbulbModalOpen: false});
  },

  handleAddLightbulb(request) {
    attemptAddLightbulb(request.sn)(this.context.store.dispatch, this.context.store.getState)
    this.closeLightbulbModal();
  },

  /**
   * TODO: this can't the right way to handle logging out...
   */
  handleLogout (event) {
    event.preventDefault();

    logout()(this.context.store.dispatch)

    browserHistory.push('/login')

    this.forceUpdate()
  },

  componentWillMount() {
    let state = this.context.store.getState()

    // FIXME: This is probably the wrong way to do this.
    if (state.auth.session === undefined) {
      browserHistory.push('/login')
      return
    }

    this.forceUpdate()

    //this.unsubscribe = this.context.store.subscribe(() => {
    //  // FIXME: This is definitely the wrong way to do this, use react-redux's `connect`
    //  this.forceUpdate()
    //})
    //
    //// TODO: replace all these calls with redux-thunk
    requestLightbulbs()(this.context.store.dispatch, this.context.store.getState)

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

  componentWillUnmount() {
    if (typeof this.unsubscribe == "function") { this.unsubscribe() }
    if (this.pollTimer != undefined) { window.clearTimeout(this.pollTimer); this.pollTimer = undefined}

    window.removeEventListener("blur", this.onblur)
    window.removeEventListener("focus", this.onfocus)
  },
  propTypes: {
    error: PropTypes.string,
    lightbulbs: PropTypes.arrayOf(PropTypes.shape({
      serialnumber: PropTypes.string.isRequired,
      state: PropTypes.string.isRequired
    }))
  },
  getDefaultProps() {
    return {
      error: '',
      statuses: []
    }
  },
  render() {
    let spinner_when_waiting = (
      this.context.store.getState().lightbulbs.isFetching && this.context.store.getState().lightbulbs.statuses.length == 0
      ? <Spinner />
      : <Spinner style={{visibility: "hidden"}} />
    )

    let lightbulbs_error = this.props.error; // this.context.store.getState().lightbulbs.error
    console.log('lightbulbs_error during render() is:', lightbulbs_error);
    let error_message = (
      lightbulbs_error == null
      ? <div></div>
      : <div className='messagebox error'>{lightbulbs_error}</div>
    );

    let info_message_when_none = (
      this.context.store.getState().lightbulbs.statuses.length === 0
      ? <div className='messagebox info'>You do not have any lightbulbs. <a href="javascript: void(0);" onMouseDown={this.showLightbulbModal}>+ New Lightbulb</a></div>
      : <div></div>
    );

    let appBarStyle = {
      backgroundColor: '#ffffff'
    };

    let state = this.context.store.getState();

    const actionButtonStyle = {
      'float': 'right',
      color: '#FF9300',
      marginRight: 20,
      marginTop: -10,
      marginBottom:30
    };

    const logoutButton = (
      <FlatButton label="LOGOUT"
                  primary={true}
                  style={{ color: 'rgb(255, 64, 129)' }}
                  onTouchStart={this.handleLogout}
                  onMouseUp={this.handleLogout} />
    );

    return (
      <div>
        <AppBar title={ <div className='appbar-logo-container'><img src='/images/example_iot_company_logo_mark.svg' /></div> }
                style={ appBarStyle }
                iconElementRight={ logoutButton }
                showMenuIconButton={false}  />

        <div className='masthead'>
          <div className='headline'>My Home {spinner_when_waiting}</div>
          <FloatingActionButton
            onMouseDown={this.showLightbulbModal}
            backgroundColor={ '#FF921E' }
            mini={false}
            style={actionButtonStyle}>
            <ContentAdd />
          </FloatingActionButton>
        </div>

        <Container>
          {error_message}
          {info_message_when_none}
          <List>
          {state.lightbulbs.statuses.sort((a,b) => a.serialnumber > b.serialnumber).map( (m,i) => {
            const link = `/lightbulbs/${m.serialnumber}`;
            return (
                  <Link to={link} key={i}>
                    <ListItem leftAvatar={<Avatar icon={<LightbulbIcon />} backgroundColor={ m.state === 'on' ? Colors.yellow600 : Colors.grey300} />}
                              primaryText={m.name}
                              secondaryText={m.serialnumber} />
                      <Divider />
                  </Link>
                )
            })}
          </List>
        </Container>

        <Dialog
          title=""
          contentStyle={{ maxWidth: 400 }}
          modal={true}
          open={this.state.lightbulbModalOpen}
          onRequestClose={this.closeLightbulbModal} >

          <AddLightbulbForm onSubmit={this.handleAddLightbulb} isLoading={state.lightbulbs.isAdding} />
        </Dialog>
       </div>
    )
  }
})


export default connect(mapStateToProps, mapDispatchToProps)(LightbulbsView);


//const rightIconMenu = (
//  <IconMenu
//    iconButtonElement={<IconButton><MoreVertIcon color={Colors.grey400} /></IconButton>}
//    anchorOrigin={{horizontal: 'right', vertical: 'top'}}
//    targetOrigin={{horizontal: 'right', vertical: 'top'}} >
//    <MenuItem primaryText="Turn on" />
//    <MenuItem primaryText="Add Alert" />
//    <MenuItem primaryText="Share" />
//    <MenuItem primaryText="Edit" />
//    <MenuItem primaryText="Delete" />
//  </IconMenu>
//);
