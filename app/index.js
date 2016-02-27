import React from 'react'
import _ from 'lodash'
import {render} from 'react-dom'

import store from './store'
import { connect, Provider } from 'react-redux'

import {addToBag, applySkill} from './domains/bag'
import * as fixtures from './domains/fixtures'

let KitchenContainer = ({...props}) => {
    return (
        <div> 
            <Bag {...props} />
            <ToolBelt {...props} />
        </div>
    )
}

const mapStateToProps = (state, ownProps) => {
    return {
        items: _.values(state.bag),
        skills: _.values(state.user.skills),
        user: state.user
    }
}

const mapDispatchToProps = (dispatch, ownProps) => {
    return {
        addToBag: () => {
            dispatch(addToBag())
        },
        applySkill: () => {
            dispatch(applySkill)
        }
    }
}

KitchenContainer = connect(mapStateToProps, mapDispatchToProps)(KitchenContainer)

const ToolBelt = ({ user: { tools }}) => {
    return (
        <div>
            <h1>Toolbelt</h1>
            <ul>
                { _.values(tools).map(tool => <li key={tool.name}>{ `${tool.name} ${tool.rating}` }</li>) }
            </ul>
        </div>
    )
}

const Bag = ({ items, skills, addToBag, applySkill }) => {
    return (
        <div>
            <h1>Bag</h1>
            <header>
                <button onClick={addToBag}>Add random item</button>
            </header>
            <BagItems items={items} applySkill={applySkill} />
        </div>
    )
}

const BagItem = ({ name, id }) => {}

const BagItems = ({ items }) => {
    const grouped = _.groupBy(items, 'name')
    const formattedItems = []
    _.forIn(grouped, (value, key) => {
        const string = value.length ? `${key} (${value.length})` : `${key}`
        formattedItems.push(<li key={key}>{string}</li>)
    })
    return <ul> {formattedItems} </ul>
}


const Staging = ({ items }) => {
    
}

const Root = () => {
    return (
        <main>
            <KitchenContainer />
        </main>
    )
}

render(
    <Provider store={store}>
        <Root/>
    </Provider>,
    document.querySelector('#app')
)