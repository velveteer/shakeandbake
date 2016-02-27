import React from 'react'
import _ from 'lodash'
import {render} from 'react-dom'
import cx from 'classnames'

import store from './store'
import { connect, Provider } from 'react-redux'

import {addToBag, applySkill, selectTool} from './domains/bag'
import * as fixtures from './domains/fixtures'

let KitchenContainer = ({...props}) => {
    return (
        <div> 
            <Bag {...props} />
            <ToolBelt {...props} />
            <Staging {...props} />
        </div>
    )
}

const filterItemsBySkill = (items, currentTool, masterTable) => {
    if (currentTool) {
        return items.filter(i => {
            return _.intersection(currentTool.skills, masterTable[i.subclass]).length
        })
    }
    return items
}

const mapStateToProps = (state, ownProps) => {
    return {
        items: filterItemsBySkill(_.values(state.bag), state.currentTool, state._masterTable),
        currentTool: state.currentTool,
        preppedItems: _.values(state.preppedItems),
        user: state.user
    }
}

const mapDispatchToProps = (dispatch, ownProps) => {
    return {
        addToBag: () => {
            return dispatch(addToBag())
        },
        applySkill: (ownProps) => {
            return dispatch(applySkill(state.currentTool))
        },
        selectTool: (tool) => {
            return dispatch(selectTool(tool))
        }
    }
}

KitchenContainer = connect(mapStateToProps, mapDispatchToProps)(KitchenContainer)

const ToolBelt = ({ user: { tools }, selectTool, currentTool }) => {
    return (
        <div>
            <h1>Toolbelt</h1>
            <div>
                { _.values(tools).map(tool => {
                    const className = cx('tool', { 'tool--selected': currentTool && currentTool.name === tool.name })
                    return (
                        <div key={tool.name} className={className} onClick={() => selectTool(tool)}>
                            { `${tool.name} ${tool.rating}` }
                        </div>
                    )}
                )}
            </div>
        </div>
    )
}

const BagItem = ({ children, items, applySkill, currentTool }) => {
    return (
        <div>
            {children}
        </div>
    )
    
}

const BagItems = ({ ...props }) => {
    const grouped = _.groupBy(props.items, 'name')
    const bagItems= []
    _.forIn(grouped, (value, key) => {
        const string = value.length ? `${key} (${value.length})` : `${key}`
        bagItems.push(
            <BagItem key={key} {...props}>{string}</BagItem>
        )
    })
    return <div>{bagItems}</div>
}


const Bag = ({ items, addToBag, ...props }) => {
    return (
        <div>
            <h1>Bag</h1>
            <header>
                <button onClick={addToBag}>Add random item</button>
            </header>
            <BagItems items={items} {...props} />
        </div>
    )
}


const Staging = ({ preppedItems }) => {
    return (
        <div>
            <h1>Prepped</h1>
        </div>
    )
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