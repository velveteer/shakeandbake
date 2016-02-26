import { createStore, applyMiddleware } from 'redux'
import { bag } from './domains/bag'
import createLogger from 'redux-logger';

const logger = createLogger()
const store = createStore(bag, applyMiddleware(logger))

export default store

