// Display logic
import React from 'react'
import ReactCSSTransitionGroup from 'react-addons-css-transition-group'
import {render} from 'react-dom'
import cx from 'classnames'

// Redux
import store from './store'
import { connect, Provider } from 'react-redux'

// Action creators
import {addToBag, shuffleBag, applySkill, selectTool} from './domains/kitchen'

// Utils
import _ from 'lodash'

let KitchenContainer = ({...props}) => {
    return (
        <div> 
            <ToolBelt {...props} />
            <Bag {...props} />
            <Prepped {...props} />
        </div>
    )
}

const mapStateToProps = state => {
    return {
        items: _.values(state.kitchen.bag),
        preppedItems: _.values(state.kitchen.preppedItems),
        currentTool: state.kitchen.currentTool,
        user: state.user.user,
        _skillsTable: state.kitchen._subclassSkillsTable
    }
}

const mapDispatchToProps = dispatch => {
    return {
        addToBag: () => {
            return dispatch(addToBag())
        },
        shuffleBag: () => {
            return dispatch(shuffleBag())
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

const renderToolSkills = (tool) => {
    return tool.skills.map(s => {
        return <div className="tool-info" key={s.name}>{s.name}: {s.level}</div>
    })
    
}
const ToolBelt = ({ user: { tools }, selectTool, currentTool }) => {
    return (
        <div>
            <h1>Toolbelt</h1>
            <div className="toolbelt-container">
                { _.values(tools).map(tool => {
                    const className = cx('tool', { 'tool--selected': currentTool && currentTool.name === tool.name })
                    return (
                        <div key={tool.name} className={className} onClick={() => selectTool(tool)}>
                            <div>{ tool.name }</div>
                            <div className="tool-info">quality: { tool.quality }</div>
                            <div>{ renderToolSkills(tool) }</div>
                        </div>
                    )}
                )}
            </div>
        </div>
    )
}

const BagItem = ({ children, applySkill, currentTool, items, _skillsTable }) => {
    const subclass = items[0].subclass
    const skills = currentTool && currentTool.skills.filter(s => _skillsTable[subclass].indexOf(s.name) !== -1)
    const isProcessing = _.some(items, i => i.time)
    const className = cx('bag-item', {'bag-item--processing': isProcessing, 'bag-item--has-skills': skills && skills.length })
    return (
        <div className={className}>
            <span className="bag-item-name">{children}</span>
            { currentTool && !isProcessing && 
                <span>{ skills.map(s => <button onClick={() => applySkill(items[0], s, currentTool) }key={s.name}>{s.name}</button>) }</span>
            }
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
            <ReactCSSTransitionGroup className="bag-items-container" transitionName="bag-items" transitionEnterTimeout={10} transitionLeaveTimeout={500}>
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


// TODO Cooking AND COMBINING prepped items
const PreppedItem = ({ items }) => {}

const Prepped = ({ preppedItems }) => {
    const grouped = _.groupBy(preppedItems, 'name')
    const groupedItems = []
    _.forIn(grouped, (value, key) => {
        const string = value.length ? `${key} (${value.length})` : `${key}`
        groupedItems.push(
            <div className="bag-item bag-item-prepped" key={string}>
                <span className="bag-item-name">{string}</span>
            </div>
        )
    })
    return (
        <div>
            <h1>Prepped</h1>
            <div className="prepped-container">
                { groupedItems }
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