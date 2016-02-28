import { createStore, combineReducers, applyMiddleware } from 'redux'
import { kitchen } from './domains/kitchen'
import { user } from './domains/user'
import createLogger from 'redux-logger';
import thunk from 'redux-thunk';

const rootReducer = combineReducers({ kitchen, user })
const logger = createLogger()
const store = createStore(rootReducer, applyMiddleware(thunk, logger))

export default store

