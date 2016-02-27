import _ from 'lodash'
import t from 'tcomb'
import {Ingredient, AppState, Course, SKILL_STATE_TABLE} from '../types'
import * as fixtures from './fixtures'

export const APPLY_SKILL_START = 'APPLY_SKILL_START'
export const APPLY_SKILL_END = 'APPLY_SKILL_END'
// APPLY_SKILL_CANCEL ?
export const COOK_ITEM = 'COOK_ITEM'
export const MAKE_COURSE = 'MAKE_COURSE'
export const ADD_TO_BAG = 'ADD_TO_BAG'

export const addToBag = ingredient => {
    const subclasses = ['protein', 'vegetable', 'fruit', 'grain']
    return { type: ADD_TO_BAG, payload: { ingredient: fixtures.makeRandomIngredient(_.shuffle(subclasses)[0]) }}
}

export const applySkill = (ingredient, skill, tool) => {
    return dispatch => {
        const time = getTime(ingredient, skill, tool)
        dispatch({ type: APPLY_SKILL_START, payload: { ingredient, skill, tool, time }})
        setTimeout(() => dispatch({ type: APPLY_SKILL_END, payload: { ingredient, skill, tool }}), time)
    }
}

const weights = {
    'protein': 1,
    'fruits': 1.2,
    'vegetable': 1.3,
    'grain': 1.4,
    'dairy': 1.5,
    'jews': 1.6 
}

function getTime (ingredient, skill, tool) {
    const x = 1/(-(weights[ingredient.subclass] + skill.level/100))
    const time = ((3 * (Math.pow(x, 2))) - 2 *(Math.pow(x, 3)) * 5000) - (tool.quality * 3) - (tool.rating * 3)
    return time
}

const initialState = AppState({
    // TODO: Populate bag with some kind of seeding event
    bag: {},
    user: fixtures.user,
    staging: {},
    menu: {},
    skillTable: SKILL_STATE_TABLE
})

export function bag (state = initialState, action) {
    switch (action.type) {
        case APPLY_SKILL_START: {
            const { ingredient, time } = action.payload
            const newIngredient = Ingredient.update(ingredient, { isProcessing: { '$set': true }})
            return AppState.update(state, { bag: { '$merge': { [newIngredient.id]: newIngredient }}})
        }
        case APPLY_SKILL_END: {
            // Apply state to ingredient, remove it from the bag, move it to staging area
            const { ingredient, skill: { name, rating }} = action.payload
            console.log(action)
            const processedState = state.skillTable[name]
            const newIngredient = Ingredient.update(ingredient, { processedState: { '$set': processedState }})
            return AppState.update(state, { bag: { '$remove': [newIngredient.id] }, staging: { '$merge': { [newIngredient.id]: newIngredient } }})
        }
        case COOK_ITEM: {
            // Can only cook items that are staged (processed)
            const { ingredient } = action.payload
            // TODO
        }
        case MAKE_COURSE: {
            const ingredients = _.values(state.staging)
            // Construct course for menu -- ingredients must be processed somehow, but being cooked is optional
            if (ingredients.length) {
                const name = generateName(ingredients)
                const newMenu = { [name]: ingredients }
                // Remove all ingredients from staging
                return AppState.update(state, { staging: { '$set': {} }, menu: { '$merge': newMenu }})
            }
            return state
        }
        case ADD_TO_BAG: {
            const { ingredient } = action.payload
            const newBag = { [ingredient.id]: ingredient }
            return AppState.update(state, { bag: { '$merge': newBag }})
        }
        default: {
            return state
        }
    }
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

function lookupCommonNames (ingredients) {
    const table = {
    }
}

function generateName (ingredients) {
    let finalIngredients = sortBySubclass(removeDupes(ingredients))
    let final = []
    let i 

    for (i = 0; i < finalIngredients.length; i++){
        let item = finalIngredients[i]
        
        let string
        
        if (item.cookedState === 'raw' && item.processedState === 'unprocessed') {
            string = item.name
        }
        else if (item.cookedState !== 'raw' && item.processedState === 'unprocessed'){
            string = item.cookedState + ' ' + item.name
        }
        else if (item.cookedState !== 'raw' && item.procssedState !== 'unprocessed'){
            string = item.cookedState  + ' ' + item.name
        }
        else {
            string = item.name
        }
        
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

const ingredient = fixtures.makeRandomIngredient('protein')
const slice = fixtures.slice
const knife = fixtures.knife
const user = fixtures.user

//const state1 = bag(initialState, { type: APPLY_SKILL_START, payload: { ingredient: fixtures.makeRandomIngredient('vegetable'), skill: fixtures.slice }})
//const state2 = bag(state1, { type: APPLY_SKILL_START, payload: { ingredient: fixtures.makeRandomIngredient('protein'), skill: fixtures.slice }})
//const state3 = bag(state2, { type: APPLY_SKILL_START, payload: { ingredient: fixtures.makeRandomIngredient('grain'), skill: fixtures.slice }})
//console.log('Make course: ', bag(state3, { type: MAKE_COURSE }))
//console.log('Add to bag: ', bag(initialState, {type: ADD_TO_BAG, payload: { ingredient: fixtures.carrots }}))
//console.log(applySkill(ingredient, slice, knife))