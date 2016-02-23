import React from 'react'
import {render} from 'react-dom'
import {makeSomeIngredients} from './types'

const renderIngredients = ({ ingredients }) => {
    return ingredients.map((i,k) => {
        return (
            <div key={k}>
                <p>{i.name}</p>
                <p>{i.expirationDate.toString()}</p>
            </div>
        )
    })
}
const Root = () => {
    return (
        <main>
            <header>
                <h1>Ingredients</h1>
            </header>
            <section>{renderIngredients({ ingredients: makeSomeIngredients(10) })}</section>
        </main>
    )
}

render(<Root/>, document.querySelector('#app'))