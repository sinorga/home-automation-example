import React from 'react'
import { browserHistory } from 'react-router'
import Form from 'muicss/lib/react/form'
import Button from 'muicss/lib/react/button'
import Input from 'muicss/lib/react/input'
import Spinner from '../components/spinner'
import AddLightbulbForm from '../components/add_lightbulb_form'
import { attemptToggleLightbulbState, attemptAddLightbulb, requestLightbulbs } from '../actions/lightbulbs'

export default React.createClass({
  contextTypes: {
    store: React.PropTypes.object
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
        <h2>Your Lightbulbs {spinner_when_waiting}</h2>
        {error_message}
        {info_message_when_none}
        <ul className="detaillist list">
          {state.lightbulbs.statuses.sort((a,b) => a.serialnumber > b.serialnumber).map( (m,i) => {
            let state_text = (
              m.isUpdating
              ? <span>...</span>
              : <a 
                  onClick={()=>{
                    attemptToggleLightbulbState(m.serialnumber)(this.context.store.dispatch, this.context.store.getState)
                  }}
                  style={{cursor:"pointer"}}
                >
                  {m.state || "???"}
                </a>
            )

            return (
              <li className="detaillist row" key={m.serialnumber}><ul className="detaillist itemlist">
                <li className="detaillist item">{m.serialnumber}</li>
                <li className="detaillist item">{state_text}</li>
                <li className="detaillist item"><a onClick={() => {
                  browserHistory.push('/lightbulbs/'+m.serialnumber)
                }}>☰</a></li>
              </ul></li>
            )
          })}
        </ul>
        <AddLightbulbForm onSubmit={this.handleAddLightbulb} isLoading={state.lightbulbs.isAdding} />
      </div>
    )
  }
})
