import React from 'react'
import { Link } from 'react-router'
import Appbar from 'muicss/lib/react/appbar'
import Container from 'muicss/lib/react/container'

export default React.createClass({
  render () {
    return (
      <div>
        <Appbar>
          <div id='app-title'><Link to='/'>Sphinx Example</Link></div>
        </Appbar>
        <Container>
          {this.props.children}
        </Container>
      </div>
    )
  }
})
