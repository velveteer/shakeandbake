import { createStore, applyMiddleware } from 'redux'
import { bag } from './domains/bag'
import createLogger from 'redux-logger';
import thunk from 'redux-thunk';

const logger = createLogger()
const store = createStore(bag, applyMiddleware(thunk, logger))

export default store

