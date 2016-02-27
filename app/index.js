import React from 'react'
import ReactCSSTransitionGroup from 'react-addons-css-transition-group'
import _ from 'lodash'
import {render} from 'react-dom'
import cx from 'classnames'

import store from './store'
import { connect, Provider } from 'react-redux'

import {generateItemName, addToBag, applySkill, selectTool} from './domains/bag'
import * as fixtures from './domains/fixtures'

let KitchenContainer = ({...props}) => {
    return (
        <div> 
            <Bag {...props} />
            <ToolBelt {...props} />
            <Prepped {...props} />
        </div>
    )
}

const filterItemsBySkill = (items, currentTool, subclassSkillsTable) => {
    if (currentTool) {
        return items.filter(i => {
            return _.intersection(currentTool.skills, subclassSkillsTable[i.subclass]).length
        })
    }
    return items
}

const mapStateToProps = (state, ownProps) => {
    return {
        items: filterItemsBySkill(_.values(state.bag), state.currentTool, state._subclassSkillsTable),
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
        applySkill: (ingredient, skill, tool) => {
            return dispatch(applySkill(ingredient, skill, tool))
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

// TODO SKILL PICKER for items that have multiple options
const BagItem = ({ children, applySkill, currentTool, items, user }) => {
    const isNotProcessing = _.every(items, i => !i.time)
    const isProcessing = _.some(items, i => i.time)
    const className = cx('bag-item', {'bag-item--processing': isProcessing })
    let onClick = _.noop
    if (currentTool && isNotProcessing) {
        let skill = user.skills[currentTool.skills[0]]
        onClick = () => applySkill(items[0], skill, currentTool)
    }
    return (
        <div className={className} onClick={onClick}>
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
            <BagItem key={key} {...props} items={value}>{string}</BagItem>
        )
    })
    return (
        <div>
            <ReactCSSTransitionGroup transitionName="bag-items" transitionEnterTimeout={10} transitionLeaveTimeout={600}>
                {bagItems}
            </ReactCSSTransitionGroup>
        </div>
    )
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


const Prepped = ({ preppedItems }) => {
    return (
        <div>
            <h1>Prepped</h1>
            <div className="prepped-container">
                { _.values(preppedItems).map(item=> {
                    return (
                        <div key={item.id}>
                            { generateItemName(item) }
                        </div>
                    )}
                )}
            </div>
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