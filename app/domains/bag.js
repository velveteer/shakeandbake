import _ from 'lodash'
import {Ingredient} from '../types'
import * as fixtures from './fixtures'

export const APPLY_SKILL = 'APPLY_SKILL'
export const MAKE_COURSE = 'MAKE_COURSE'
export const ADD_TO_BAG = 'ADD_TO_BAG'

const initialState = {
    bag: {'steak': fixtures.steak, 'carrots': fixtures.carrots, 'broccoli': fixtures.broccoli},
    menu: {}
}

export function bag (state = initialState, action) {
    switch (action.type) {
        case APPLY_SKILL: {
            const { ingredient, skill } = action.payload
            if (ingredient.skills) {
                const ingState = ingredient.skills[skill]
                const newIngredient = { ...ingredient, states: _.uniq(ingredient.processedState.concat(ingState)) }
                const newState = { ...state, bag: { [newIngredient.id]: newIngredient, ...state.bag }}
                return newState
            } 
            return state
        }
        case MAKE_COURSE: {
            const { ingredients } = action.payload
            const name = generateName(ingredients)
            
            // Get items in bag
            const items = _.values(state.bag)
            // Find items that match with the course ingredients
            const itemsToRemove = _.intersectionBy(items, ingredients, 'id')
            
            // Update each item and decrease its count 
            const newItems = itemsToRemove.map(i => {
                return Ingredient.update(i, { amount: { '$set': i.amount - 1 }})
            })
            
            // Convert items back to a dictionary
            const convertedItems = _.keyBy(newItems, 'id')
            // Construct new bag state, remove any ingredients who have no more amount
            const newBag = Object.assign({}, state.bag, convertedItems)
            const newNewBag = _.omitBy(newBag, x => x.amount === 0)
            
            return { ...state, bag: newNewBag, menu: { ...state.menu, [name]: ingredients }}
        }
        case ADD_TO_BAG: {
            
        }
        default: {
            return state
        }
    }
}

const weights = {
    'protein': 1,
    'fruits': 2,
    'vegetable': 2,
    'bread': 3,
    'dairy': 4,
    'jews': 5
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

const course = [fixtures.steak, fixtures.carrots]
const course2 = [fixtures.steak, fixtures.carrots, fixtures.broccoli, fixtures.bread]

//console.log(bag(initialState, { type: APPLY_SKILL, payload: { ingredient: fixtures.bread, skill: 'slice' }}))

console.log(bag(initialState, { type: MAKE_COURSE, payload: { ingredients: course }}))
console.log(bag(initialState, { type: MAKE_COURSE, payload: { ingredients: course2 }}))

