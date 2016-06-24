import React from 'react'
import { hashHistory } from 'react-router'
import Form from 'muicss/lib/react/form'
import Button from 'muicss/lib/react/button'
import Input from 'muicss/lib/react/input'

let cancelId = "add-lightbulb-cancel";
let submitId = "add-lightbulb-submit";

export default React.createClass({
  contextTypes: {
    store: React.PropTypes.object
  },

  componentWillMount () {
    this.unsubscribe = this.context.store.subscribe(() => {
      // FIXME: This is definitely the wrong way to do this, use react-redux's `connect`
      this.forceUpdate()
    })
  },

  componentWillUnmount () {
    if (typeof this.unsubscribe == "function") { this.unsubscribe() }
  },

  handleForm (event) {
    event.preventDefault()
    const name = event.target.elements[0].value
    const color = event.target.elements[1].value

    window.localStorage.setItem('account.name', name)
    window.localStorage.setItem('account.color', color)

    console.log(name, color)
  },

  render () {
    return (
      <div>
        <h2>Your Account</h2>
        <h3>Update Your Profile</h3>
        <Form onSubmit={this.handleForm}>
          <Input label='Name' floatingLabel/>
          <Input label='Favorite Color' floatingLabel/>
          <Button color='primary'>Update</Button>
        </Form>
      </div>
    )
  }
})
