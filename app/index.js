import React from 'react'
import {render} from 'react-dom'
import {makeSomeVegetables} from './types'
// import './seed'

const renderIngredients = ({ ingredients }) => {
    return ingredients.map((i,k) => {
        return (
            <div key={k}>
                <p>{i.getFullLabel()}</p>
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
            <section>{renderIngredients({ ingredients: makeSomeVegetables() })}</section>
        </main>
    )
}

render(<Root/>, document.querySelector('#app'))