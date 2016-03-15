import React from 'react'
import { browserHistory } from 'react-router'

export default React.createClass({
  handleLogout(event) {
    event.preventDefault()

    //localStorage.removeItem('username');
    localStorage.removeItem('password');
  },

  render() {
    return (
      <div>
        <h2>Login</h2>
        <form id="logout-form" onSubmit={this.handleLogout}>
          <button type="submit">Logout</button>
        </form>
      </div>
    )
  }
})