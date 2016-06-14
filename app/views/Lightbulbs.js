import React from 'react'
import ReactDOM from 'react-dom';
import Row from 'muicss/lib/react/row';
import Col from 'muicss/lib/react/col';
import { browserHistory } from 'react-router'
import Form from 'muicss/lib/react/form'
import Button from 'muicss/lib/react/button'
import Input from 'muicss/lib/react/input'
import mui from 'muicss';
import Spinner from '../components/spinner'
import AddLightbulbForm from '../components/add_lightbulb_form'
import { attemptToggleLightbulbState, attemptAddLightbulb, requestLightbulbs } from '../actions/lightbulbs'

export default React.createClass({
  contextTypes: {
    store: React.PropTypes.object
  },

  showLightbulbMenu(event) {
    console.log("in showLightbulbMenu");
    // initialize modal element
    //var modalEl = document.createElement('div');
    //modalEl.style.width = '100px';
    //modalEl.style.height = 'auto';
    //modalEl.style.position = 'relative';
    //modalEl.style.left = event.screenX;
    //modalEl.style.top = event.screenY;
    //modalEl.style.backgroundColor = '#fff';

    // show modal
    //mui.overlay('on', modalEl);
  },

  showAddLightbulbForm() {
    console.log("in showAddLightbulbForm");
    mui.overlay('on');
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

    this.unsubscribe = this.context.store.subscribe(() => {
      // FIXME: This is definitely the wrong way to do this, use react-redux's `connect`
      this.forceUpdate()
    })

    // TODO: replace all these calls with redux-thunk
    requestLightbulbs()(this.context.store.dispatch, this.context.store.getState)

    this.pollInterval = 1000

    this.updateStatuses()

    window.addEventListener("blur", this.onblur)
    window.addEventListener("focus", this.onfocus)
  },

  onblur () {
    this.pollInterval = 10000
  },

  onfocus () {
    this.pollInterval = 1000
    this.updateStatuses()
  },

  updateStatuses () {
    let state = this.context.store.getState()
    if (state.lightbulbs.isFetching == false) {
      requestLightbulbs()(this.context.store.dispatch, this.context.store.getState)
    }

    this.pollTimer = window.setTimeout(() => {
      this.updateStatuses()
    }, this.pollInterval)
  },

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

    return (
      <div>
        <h2>Devices {spinner_when_waiting}</h2>
        {error_message}
        {info_message_when_none}
          {state.lightbulbs.statuses.sort((a,b) => a.serialnumber > b.serialnumber).map( (m,i) => {
            const statusIconClass = "material-icons md-36 status-icon " + m.state;

            return (
              <Row className="device-list-item">
                <Col xs="2" md="1" className="status-icon-col"><i className={statusIconClass}>lightbulb_outline</i></Col>
                <Col xs="8" md="10" className="name-and-serial">
                  <Row>
                    <Col xs="12">{m.name}</Col>
                  </Row>
                  <Row>
                    <Col xs="12" className="serialnumber">{m.serialnumber}</Col>
                  </Row>
                </Col>
                <Col xs="2" md="1">
                  <div onClick={this.showLightbulbMenu} className="item-menu-icon">
                    <i className="material-icons md-36">more_vert</i>
                  </div>
                </Col>
              </Row>
            )
          })}
        <Row>
          <Col xs="12">
            <AddLightbulbForm onSubmit={this.handleAddLightbulb} isLoading={state.lightbulbs.isAdding} />
          </Col>
        </Row>
      </div>

    )
  }
})

// <Button onClick={this.showAddLightbulbForm} className="add-device-btn" size="small" color="accent" variant="fab">+</Button>
