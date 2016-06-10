import React from 'react'
import { browserHistory } from 'react-router'
import Form from 'muicss/lib/react/form'
import Button from 'muicss/lib/react/button'
import Input from 'muicss/lib/react/input'
import Spinner from '../components/spinner'
import { attemptSignup } from '../actions/auth'

export default React.createClass({
  contextTypes: {
    store: React.PropTypes.object
  },

  handleForm (event) {
    console.log('atsu')
    event.preventDefault()
    const email = event.target.elements[0].value
    const password = event.target.elements[1].value

    attemptSignup(email, password)(this.context.store.dispatch)
  },

  componentWillMount () {
    this.unsubscribe = this.context.store.subscribe(() => {
      let state = this.context.store.getState()

      if (state.auth.session != null && state.auth.session.loginhack === true) {
        browserHistory.push('/login')
        return
      }

      // FIXME: This is definitely the wrong way to do this, use react-redux's `connect`
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

    console.log(this.context.store.getState().auth.error)

    let error_message = (
      this.context.store.getState().auth.status !== "error"
      ? <div></div>
      : (
        <div className='messagebox error'>
          {this.context.store.getState().auth.error}
        </div>
      )
    )

    console.log(this.context.store.getState().auth.status)

    let success_message = (
      this.context.store.getState().auth.status !== "good"
      ? <div></div>
      : (
        <div className='messagebox success'>
          Thanks for signing up. Check your email to activate your account.
        </div>
      )
    )

    let signup_form = (
      <div>
        <h2>Signup</h2>
        {error_message}
        {success_message}
        <Form onSubmit={this.handleForm}>
          <Input label='Email Address' floatingLabel/>
          <Input label='Password' type="password" floatingLabel/>
          <Button color='secondary'>Signup</Button> {spinner_when_waiting}
        </Form>
      </div>
    )

    return signup_form
  }
})
