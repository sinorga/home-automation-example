export function requestStates (auth) {
  return (dispatch) => {
    dispatch({
      type: 'ATTEMPT_REQUEST_STATES'
    })
  }
}

export function requestShares (auth) {
  return (dispatch) => {
    dispatch({
      type: 'ATTEMPT_REQUEST_SHARES',
      serial: serial
    })

    var oReq = new window.XMLHttpRequest()
    oReq.withCredentials = true;
    oReq.open('DELETE', 'http://127.0.0.1:3000/api/v1/sessions/_')
    oReq.setRequestHeader('Token', '')
    oReq.send()
  }
}

export function resultShares (result) {
  return (dispatch) => {
    dispatch({
      type: 'RESULT_SHARES'
    })
  }
}

export function attemptShare (email, serialnumber) {
  return (dispatch) => {
    dispatch({
      type: 'ATTEMPT_SHARE',
      email: email,
      serialnumber: serialnumber
    })

    window.setTimeout(() => {
      if (true) {
        dispatch({
          type: 'SHARE_SUCCESS',
          email: email,
          serialnumber: serialnumber
        })
      } else {
        dispatch({
          type: 'SHARE_ERROR',
          serialnumber: serialnumber,
          error: "some error"
        })
      }
    }, 1000)
  }
}

export function attemptToggleLightbulbState (serialnumber) {
  return (dispatch, getState) => {
    dispatch({
      type: 'ATTEMPT_TOGGLE_LIGHTBULB_STATE',
      serialnumber: serialnumber
    })

    let { auth, lightbulbs } = getState()

    let { token, email } = auth.session

    // HACK
    email = email || window.sessionStorage.getItem('email')

    let current_state = lightbulbs.statuses.filter(v => v.serialnumber == serialnumber)[0].state
    let new_state = current_state == "off" ? "on" : "off"

    function toggleLightbulbResonseHandler () {
      if (this.status === 200) {
        toggleLightbulbStateSuccess(serialnumber, new_state)(dispatch)
      } else if (this.status === 401 || this.status === 403) {
        toggleLightbulbStateError('Invalid Credentials')(dispatch)
      } else if (this.status === 0) {
        toggleLightbulbStateError('Unable to Reach Server')(dispatch)
      } else {
        toggleLightbulbStateError('Invalid Server Response Status: ' + this.status)(dispatch)
      }
    }

    let body = {
      state: new_state
    }

    var oReq = new window.XMLHttpRequest()
    oReq.withCredentials = true;
    oReq.addEventListener('load', toggleLightbulbResonseHandler)
    oReq.addEventListener('error', toggleLightbulbResonseHandler)
    oReq.open('POST', API_BASE_URL + '/lightbulb/'+serialnumber)
    oReq.setRequestHeader('Content-Type', 'application/json')
    oReq.setRequestHeader('Accept', '*/*')
    oReq.setRequestHeader('Authorization', 'Token ' + token)
    oReq.send(JSON.stringify(body))
  }
}

function toggleLightbulbStateSuccess (serialnumber, state) {
  return (dispatch) => {
    dispatch({
      type: 'TOGGLE_LIGHTBULB_STATE_SUCCESS',
      serialnumber: serialnumber,
      state: state
    })
  }
}

function toggleLightbulbStateError (error) {
  return (dispatch, getState) => {
    dispatch({
      type: 'TOGGLE_LIGHTBULB_STATE_ERROR',
      error: error
    })
  }
}


export function requestLightbulbs () {
  return (dispatch, getState) => {
    dispatch({
      type: 'REQUEST_LIGHTBULBS'
    })

    function requestLightbulbsResponseHandler () {
      if (this.status === 200) {
        try {
          let resp = JSON.parse(this.responseText)
          requestLightbulbsSuccess(resp)(dispatch)
        } catch (e) {
          requestLightbulbsError(this.responseText)(dispatch)
        }
      } else if (this.status === 401) {
        requestLightbulbsError('Invalid Credentials')(dispatch)
      } else if (this.status === 0) {
        requestLightbulbsError('Unable to Reach Server')(dispatch)
      } else {
        requestLightbulbsError('Invalid Server Response Status: ' + this.status)(dispatch)
      }
    }

    let { auth } = getState()

    let { token, email } = auth.session

    // HACK
    email = email || window.sessionStorage.getItem('email')

    var oReq = new window.XMLHttpRequest()
    oReq.withCredentials = true;
    oReq.addEventListener('load', requestLightbulbsResponseHandler)
    oReq.addEventListener('error', requestLightbulbsResponseHandler)
    oReq.open('GET', API_BASE_URL + '/user/'+email+'/lightbulbs')
    oReq.setRequestHeader('Accept', '*/*')
    oReq.setRequestHeader('Authorization', 'Token ' + token)
    oReq.send()
  }
}

function requestLightbulbsSuccess (statuses) {
  console.log('requestLightbulbsSuccess', statuses);
  return (dispatch) => {
    dispatch({
      type: 'REQUEST_LIGHTBULBS_SUCCESS',
      statuses: statuses 
    })
  }
}

function requestLightbulbsError (error) {
  return (dispatch, getState) => {
    dispatch({
      type: 'REQUEST_LIGHTBULBS_ERROR',
      error: error
    })
  }
}


export function attemptAddLightbulb (serialnumber) {
  return (dispatch, getState) => {
    dispatch({
      type: 'ATTEMPT_ADD_LIGHTBULB',
      serialnumber: serialnumber
    })

    let { auth, lightbulbs } = getState()

    let { token, email } = auth.session

    // HACK
    email = email || window.sessionStorage.getItem('email')

    function toggleLightbulbResonseHandler () {
      if (this.status === 200) {
        addLightbulbSuccess({})(dispatch)
      } else if (this.status === 401 || this.status === 403) {
        // TODO: should log out here
        addLightbulbError('Invalid Credentials')(dispatch)
      } else if (this.status === 409) {
        addLightbulbError('Another user owns lightbulb ' + serialnumber)(dispatch)
      } else if (this.status === 0) {
        addLightbulbError('Unable to Reach Server')(dispatch)
      } else if (this.status === 400) {
        addLightbulbError(this.responseText)(dispatch)
      } else {
        addLightbulbError('Invalid Server Response Status: ' + this.status)(dispatch)
      }
    }

    let body = {
      serialnumber: serialnumber,
      link: true
    }

    var oReq = new window.XMLHttpRequest()
    oReq.withCredentials = true;
    oReq.addEventListener('load', toggleLightbulbResonseHandler)
    oReq.addEventListener('error', toggleLightbulbResonseHandler)
    oReq.open('POST', API_BASE_URL + '/user/' + email + '/lightbulbs')
    oReq.setRequestHeader('Content-Type', 'application/json')
    oReq.setRequestHeader('Accept', '*/*')
    oReq.setRequestHeader('Authorization', 'Token ' + token)
    oReq.send(JSON.stringify(body))

    window.setTimeout(() => {
      dispatch({
        type: 'ADD_LIGHTBULB_SUCCESS',
        serialnumber: serialnumber,
        state: "off"
      })
    }, 1000)
  }
}export function attemptDeleteLightbulb (serialnumber) {
  return (dispatch, getState) => {
    dispatch({
      type: 'ATTEMPT_DELETE_LIGHTBULB',
      serialnumber: serialnumber
    })

    let { auth, lightbulbs } = getState()

    let { token, email } = auth.session

    // HACK
    email = email || window.sessionStorage.getItem('email')

    function deleteLightbulbResonseHandler () {
      if (this.status === 200) {
        deleteLightbulbSuccess(serialnumber)(dispatch)
      } else if (this.status === 401 || this.status === 403) {
        deleteLightbulbError('Invalid Credentials')(dispatch)
      } else if (this.status === 0) {
        deleteLightbulbError('Unable to Reach Server')(dispatch)
      } else {
        deleteLightbulbError('Invalid Server Response Status: ' + this.status)(dispatch)
      }
    }

    let body = {
      link: false,
      serialnumber: serialnumber
    }

    var oReq = new window.XMLHttpRequest()
    oReq.withCredentials = true;
    oReq.addEventListener('load', deleteLightbulbResonseHandler)
    oReq.addEventListener('error', deleteLightbulbResonseHandler)
    oReq.open('POST', API_BASE_URL + '/user/' + email + '/lightbulbs')
    oReq.setRequestHeader('Content-Type', 'application/json')
    oReq.setRequestHeader('Accept', '*/*')
    oReq.setRequestHeader('Authorization', 'Token ' + token)
    oReq.send(JSON.stringify(body))
  }
}

function deleteLightbulbSuccess (serialnumber) {
  return (dispatch) => {
    dispatch({
      type: 'DELETE_LIGHTBULB_SUCCESS',
      serialnumber: serialnumber,
      state: state
    })
  }
}

function deleteLightbulbError (error) {
  return (dispatch, getState) => {
    dispatch({
      type: 'DELETE_LIGHTBULB_ERROR',
      error: error
    })
  }
}

function addLightbulbSuccess (status) {
  return (dispatch) => {
    dispatch({
      type: 'ADD_LIGHTBULB_SUCCESS',
      status: status
    })
  }
}

function addLightbulbError (error) {
  return (dispatch, getState) => {
    dispatch({
      type: 'ADD_LIGHTBULB_ERROR',
      error: error
    })
  }
}
