import { combineReducers } from 'redux'
import auth from './auth'
import lightbulbs from './lightbulbs'

const app = combineReducers({
  auth,
  lightbulbs
})

export default app
