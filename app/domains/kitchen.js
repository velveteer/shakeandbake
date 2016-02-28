import _ from 'lodash'
import t from 'tcomb'
import {Ingredient, AppState, Course, SUBCLASSES, SKILL_STATE_TABLE, SUBCLASS_SKILLS_TABLE} from '../types'
import * as fixtures from './fixtures'

// Action Types (Constants)
export const APPLY_SKILL_START = 'APPLY_SKILL_START'
export const APPLY_SKILL_END = 'APPLY_SKILL_END'
export const COOK_ITEM = 'COOK_ITEM'
export const MAKE_COURSE = 'MAKE_COURSE'
export const ADD_TO_BAG = 'ADD_TO_BAG'
export const SHUFFLE_BAG = 'SHUFFLE_BAG'
export const SELECT_TOOL = 'SELECT_TOOL'


// Action Creators
export const addToBag = ingredient => {
    return { type: ADD_TO_BAG, payload: { ingredient: fixtures.makeRandomIngredient(_.shuffle(SUBCLASSES)[0]) }}
}

export const shuffleBag = () => {
    const ingredients = _.keyBy(SUBCLASSES.map(i => fixtures.makeRandomIngredient(i)), 'id')
    return { type: SHUFFLE_BAG, payload: { ingredients: ingredients }}
}

export const applySkill = (ingredient, skill, tool) => {
    return dispatch => {
        const time = getTime(ingredient, skill, tool)
        dispatch({ type: APPLY_SKILL_START, payload: { ingredient, skill, tool, time }})
        setTimeout(() => dispatch({ type: APPLY_SKILL_END, payload: { ingredient, skill, tool }}), time)
    }
}

export const selectTool = tool => {
    return { type: SELECT_TOOL, payload: { tool }}
}

// Reducer
const initialState = AppState({
    // TODO: Populate bag with some kind of seeding event
    bag: {},
    currentTool: null,
    preppedItems: {},
    menu: {},
    _skillTable: SKILL_STATE_TABLE,
    _subclassSkillsTable: SUBCLASS_SKILLS_TABLE
})

export function kitchen (state = initialState, action) {
    switch (action.type) {
        case SELECT_TOOL: {
            const { tool } = action.payload
            if (tool === state.currentTool) {
                return AppState.update(state, { currentTool: { '$set': null }})
            }
            return AppState.update(state, { currentTool: { '$set': tool }})
        }
        case APPLY_SKILL_START: {
            const { ingredient, time } = action.payload
            const newIngredient = Ingredient.update(ingredient, { time: { '$set': time }})
            return AppState.update(state, { bag: { '$merge': { [newIngredient.id]: newIngredient }}, skillOptions: { '$set': null }})
        }
        case APPLY_SKILL_END: {
            // Apply state to ingredient, remove it from the bag, move it to prep area
            const { ingredient, skill: { name }} = action.payload
            const processedState = state._skillTable[name]
            const newIngredient = Ingredient.update(ingredient, { processedState: { '$set': processedState}, time: { '$set': 0 }})
            // Rename ingredient based on new state
            const renamedIngredient = Ingredient.update(newIngredient, { name: { '$set': generateItemName(newIngredient) }})
            return AppState.update(state, { bag: { '$remove': [newIngredient.id] }, preppedItems: { '$merge': { [newIngredient.id]: renamedIngredient } }})
        }
        case COOK_ITEM: {
            // Can only cook items that are staged (processed)
            const { ingredient } = action.payload
            // TODO
        }
        case MAKE_COURSE: {
            const ingredients = _.values(state.preppedItems)
            // Construct course for menu -- ingredients must be processed somehow, but being cooked is optional
            if (ingredients.length) {
                const name = generateCourseName(ingredients)
                const newMenu = { [name]: ingredients }
                // Remove all ingredients from prep 
                return AppState.update(state, { preppedItems: { '$set': {} }, menu: { '$merge': newMenu }})
            }
            return state
        }
        case ADD_TO_BAG: {
            const { ingredient } = action.payload
            const newBag = { [ingredient.id]: ingredient }
            return AppState.update(state, { bag: { '$merge': newBag }})
        }
        case SHUFFLE_BAG: {
            const { ingredients } = action.payload
            return AppState.update(state, { bag: { '$set': ingredients }})
        }
        default: {
            return state
        }
    }
}

// Util functions
const weights = {
    'protein': 1,
    'fruit': 1.3,
    'vegetable': 1.3,
    'grain': 1.5,
    'dairy': 1.6,
    'herb': 1.7,
    'bean': 1.5,
    'dough': 1.2
}

function getTime (ingredient, skill, tool) {
    const x = 1/(-(weights[ingredient.subclass] + skill.level/100))
    const time = ((3 * (Math.pow(x, 2))) - 2 *(Math.pow(x, 3)) * 20000) - (tool.quality * 10) - (skill.level * 20)
    return Math.round(time)
}

function sortBySubclass (ingredients) {
    const sortedIngredients = _.sortBy(ingredients, x => {
        return weights[x.subclass]
    })
    return sortedIngredients
}

function removeDupes (ingredients) {
    return _.uniqWith(ingredients, (x, y) => {
        if (x.name === y.name && x.processedState === y.processedState && x.cookedState === y.cookedState) {
            return true
        }
    })
}

// TODO
function lookupCommonNames (ingredients) {}

function generateItemName (item) {
    if (item.cookedState === 'raw' && item.processedState === 'unprocessed') {
        return item.name
    }
    else if (item.cookedState !== 'raw' && item.processedState === 'unprocessed'){
        return item.cookedState + ' ' + item.name
    }
    else if (item.cookedState !== 'raw' && item.processedState !== 'unprocessed'){
        return item.cookedState  + ' ' + item.name
    }
    else if (item.cookedState === 'raw' && item.processedState !== 'unprocessed') {
        return item.processedState + ' ' + item.name
    } 
    else {
        return item.name
    }
}

function generateCourseName (ingredients) {
    let finalIngredients = sortBySubclass(removeDupes(ingredients))
    let final = []
    let i 

    for (i = 0; i < finalIngredients.length; i++){
        let item = finalIngredients[i]
        let string = generateItemName(item)
        
        if (i === 0 && finalIngredients.length > 3){
            final.push(string + ', ')
        }
        else if (i === 0 && finalIngredients.length === 3){
            final.push(string + ' and ')
        }
        else if (i === 0 && finalIngredients.length === 2){
            final.push(string + ' and ')
        }
        else if (i < finalIngredients.length - 2){
            final.push(string + ', and ')
        }
        else if ( i === finalIngredients.length - 2){
            final.push(string + ' with a side of ')
        }
        else{
            final.push(string)
        }

    }
    return final.join('');
}