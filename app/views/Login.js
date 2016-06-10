import React from 'react'
import { browserHistory } from 'react-router'
import Form from 'muicss/lib/react/form'
import Button from 'muicss/lib/react/button'
import Input from 'muicss/lib/react/input'
import Spinner from '../components/spinner'
import { attemptLogin } from '../actions/auth'

export default React.createClass({
  contextTypes: {
    store: React.PropTypes.object
  },

  handleLogin (event) {
    event.preventDefault()
    const email = event.target.elements[0].value
    const password = event.target.elements[1].value

    // HACK
    window.sessionStorage.setItem('email', email)

    attemptLogin(email, password)(this.context.store.dispatch)
  },

  componentDidMount () {
    this.unsubscribe = this.context.store.subscribe(() => {
      let state = this.context.store.getState()

      // FIXME: This is probably the wrong way to do this.
      if (state.auth.session !== undefined) {
        browserHistory.push('/lightbulbs')
        return
      }

      this.forceUpdate()
    })
  },

  componentWillUnmount () {
    if (typeof this.unsubscribe == "function") { this.unsubscribe() }
  },

  render () {
    let spinner_when_waiting = (
      this.context.store.getState().auth.status === 'waiting'
      ? <Spinner />
      : <Spinner style={{visibility: "hidden"}} />
    )

    let error_message = (
      this.context.store.getState().auth.error == null
      ? <div></div>
      : <div className='messagebox error'>{this.context.store.getState().auth.error}</div>
    )

    return (
      <div>
        <h2>Login</h2>
        {error_message}
        <Form onSubmit={this.handleLogin}>
          <Input label='Email' floatingLabel/>
          <Input type='password' label='Password' floatingLabel/>
          <Button color='secondary'>Login</Button> {spinner_when_waiting}
        </Form>
      </div>
    )
  }
})
