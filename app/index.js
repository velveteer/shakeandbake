import React from 'react'
import _ from 'lodash'
import {render} from 'react-dom'

import store from './store'
import { connect, Provider } from 'react-redux'

import {ADD_TO_BAG} from './domains/bag'
import * as fixtures from './domains/fixtures'

// TODO: Move actions into action creators
let Bag = ({ items, dispatch }) => {
    const grouped = _.groupBy(items, 'name')
    const itemsWithCount = () => {
        const arr = []
        _.forIn(grouped, (value, key) => {
            const string = value.length ? `${key} (${value.length})` : `${key}`
            arr.push(<li key={key}>{string}</li>)
        })
        return arr
    }
    return (
        <div>
            <h1>Bag</h1>
            <nav>
                <button onClick={ () => dispatch({ type: ADD_TO_BAG, payload: { ingredient: fixtures.makeRandomIngredient('vegetable')}}) }>Add random vegetable</button>
                <button onClick={ () => dispatch({ type: ADD_TO_BAG, payload: { ingredient: fixtures.makeRandomIngredient('fruit')}}) }>Add random fruit</button>
                <button onClick={ () => dispatch({ type: ADD_TO_BAG, payload: { ingredient: fixtures.makeRandomIngredient('protein')}}) }>Add random protein</button>
                <button onClick={ () => dispatch({ type: ADD_TO_BAG, payload: { ingredient: fixtures.makeRandomIngredient('grain')}}) }>Add random grain</button>
            </nav>
            <ul>
            {  itemsWithCount() }
            </ul>
        </div>
    )
}

Bag = connect(state => ({ items: _.values(state.bag) }))(Bag)

const Root = () => {
    return (
        <main>
            <Bag />
        </main>
    )
}

render(
    <Provider store={store}>
        <Root/>
    </Provider>,
    document.querySelector('#app')
)