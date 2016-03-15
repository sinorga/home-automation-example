import React from 'react'
import { browserHistory } from 'react-router'
import Form from 'muicss/lib/react/form';
import Button from 'muicss/lib/react/button';
import Input from 'muicss/lib/react/input';

export default React.createClass({
  handleLogin(event) {
    event.preventDefault()
    const username = event.target.elements[0].value
    const password = event.target.elements[1].value

    localStorage.setItem('username', username);
    localStorage.setItem('password', password);

    console.log(username, password)

    // fakey fake fake
    browserHistory.push("/account")
  },

  render() {
    return (
      <div>
        <h2>Login</h2>
        <Form onSubmit={this.handleLogin}>
          <Input label="username" floatingLabel={true}/>
          <Input type="password" label="password" floatingLabel={true}/>
          <Button color="primary">Login</Button>
        </Form>
      </div>
    )
  }
})