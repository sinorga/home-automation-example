export function attemptSignup (email, password) {
  return (dispatch) => {
    dispatch({
      type: 'SIGNUP_ATTEMPT',
      email: email
    })

    function signupAttemptResponseHandler () {
      if (this.status === 200 && this.responseText === 'Ok') {
        // HACK
        reportSignupSuccess({loginhack: true})(dispatch)
      } else if (this.status === 401) {
        reportSignupError('Invalid Credentials')(dispatch)
      } else if (this.status === 400) {
        reportSignupError(this.responseText)(dispatch)
      } else if (this.status === 0) {
        reportSignupError('Unable to Reach Server')(dispatch)
      } else {
        reportSignupError('Invalid Server Response Status: ' + this.status)(dispatch)
      }
    }

    var body = JSON.stringify({
      password: password
    })

    var oReq = new window.XMLHttpRequest()
    oReq.withCredentials = true;
    oReq.addEventListener('load', signupAttemptResponseHandler)
    oReq.addEventListener('error', signupAttemptResponseHandler)
    oReq.open('PUT', API_BASE_URL + '/user/' + email)
    oReq.setRequestHeader('Content-Type', 'application/json')
    oReq.setRequestHeader('Accept', '*/*')
    oReq.send(body)
  }
}

export function reportSignupSuccess (session) {
  return (dispatch) => {
    dispatch({
      type: 'SIGNUP_SUCCESS',
      session: session
    })
  }
}

export function reportSignupError (error) {
  return (dispatch) => {
    dispatch({
      type: 'SIGNUP_ERROR',
      error: error
    })
  }
}

export function attemptPasswordChange (password) {
  return (dispatch) => {
    dispatch({
      type: 'PASSWORD_CHANGE_ATTEMPT',
      password: password
    })

    window.setTimeout(() => {
      if (password === "1234") {
        reportPasswordChangeSuccess()(dispatch)
      } else {
        reportPasswordChangeError('Your password can only be "1234".')(dispatch)
      }
    }, 1000)
  }
}

export function reportPasswordChangeSuccess () {
  return (dispatch) => {
    dispatch({
      type: 'PASSWORD_CHANGE_SUCCESS'
    })
  }
}

export function reportPasswordChangeError (error) {
  return (dispatch) => {
    dispatch({
      type: 'PASSWORD_CHANGE_ERROR',
      error: error
    })
  }
}

export function attemptLogin (email, password) {
  return (dispatch) => {
    dispatch({
      type: 'LOGIN_ATTEMPT',
      email: email,
      password: password
    })

    function loginAttemptResponseHandler () {
      if (this.status === 200) {
        try {
          let resp = JSON.parse(this.responseText)
          reportLoginSuccess(resp)(dispatch)
        } catch (e) {
          reportLoginError(this.responseText)(dispatch)
        }
      } else if (this.status === 401) {
        reportLoginError('Invalid Credentials')(dispatch)
      } else if (this.status === 400) {
        reportSignupError(this.responseText)(dispatch)
      } else if (this.status === 0) {
        reportLoginError('Unable to Reach Server')(dispatch)
      } else {
        reportLoginError('Invalid Server Response Status: ' + this.status)(dispatch)
      }
    }

    var body = JSON.stringify({
      email: email,
      password: password
    })

    var oReq = new window.XMLHttpRequest()
    oReq.withCredentials = true;
    oReq.addEventListener('load', loginAttemptResponseHandler)
    oReq.addEventListener('error', loginAttemptResponseHandler)
    oReq.open('POST', API_BASE_URL + '/session')
    oReq.setRequestHeader('Content-Type', 'application/json')
    oReq.setRequestHeader('Accept', '*/*')
    oReq.send(body)
  }
}

export function reportLoginSuccess (session) {
  return (dispatch) => {
    dispatch({
      type: 'LOGIN_SUCCESS',
      session: session
    })

    window.sessionStorage.setItem('session', JSON.stringify(session))
  }
}

export function reportLoginError (error) {
  return (dispatch) => {
    dispatch({
      type: 'LOGIN_ERROR',
      error: error
    })
  }
}

export function logout () {
  return (dispatch) => {
    dispatch({
      type: 'LOGOUT'
    })

    window.sessionStorage.removeItem('session')
  }
}
