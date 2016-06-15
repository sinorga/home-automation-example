import React from 'react'
import { browserHistory } from 'react-router'
import Form from 'muicss/lib/react/form'
import Button from 'muicss/lib/react/button'
import Input from 'muicss/lib/react/input'
import Spinner from '../components/spinner'
import ShareLightbulbForm from '../components/share_lightbulb_form'
import { toggleLightbulbState, attemptShare, attemptDeleteLightbulb } from '../actions/lightbulbs'

export default React.createClass({
  contextTypes: {
    store: React.PropTypes.object
  },

  componentWillMount() {
    let state = this.context.store.getState()
    this.unsubscribe = this.context.store.subscribe(() => {
      if (state.lightbulbs.statuses.filter(v => v.serialnumber == this.props.params.sn).length == 0) {
        browserHistory.push('/lightbulbs')
      }

      // FIXME: This is probably the wrong way to do this.
      if (state.auth.session === undefined) {
        browserHistory.push('/login')
      }
      // FIXME: This is definitely the wrong way to do this, use react-redux's `connect`
      this.forceUpdate()
    })
  },

  componentWillUnmount () {
    if (typeof this.unsubscribe == "function") { this.unsubscribe() }
  },

  handleShare (r) {
    attemptShare(r.email, this.props.params.sn)(this.context.store.dispatch)
  },

  handleDelete (r) {
    attemptDeleteLightbulb(this.props.params.sn)(this.context.store.dispatch,this.context.store.getState)
  },

  render() {
    let spinner_when_waiting = (
      this.context.store.getState().lightbulbs.isFetching
      ? <Spinner />
      : <Spinner style={{visibility: "hidden"}} />
    )

    let error_message = (
      this.context.store.getState().auth.error == null
      ? <div></div>
      : <div className='messagebox error'>{this.context.store.getState().auth.error}</div>
    )

    let state = this.context.store.getState()

    return (
      <div>
        <h2>The {this.props.params.sn} Lightbulb {spinner_when_waiting}</h2>
        {error_message}

        <h3>Shares</h3>
        {state.lightbulbs.shares.filter(v => v.id == this.props.params.sn).length > 0 ?
          (
            <ul>
              {state.lightbulbs.shares.filter(v => v.id == this.props.params.sn).map((v) => {
                return (<li>{v.email}</li>)
              })}
            </ul>
          ) :
          <span>Not yet shared.</span>}
        <ShareLightbulbForm onSubmit={this.handleShare} />

        <h3>Delete</h3>
        <Button color='danger' onClick={this.handleDelete}>Delete</Button>

      </div>
    )
  }
})
