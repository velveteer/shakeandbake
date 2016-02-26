import _ from 'lodash'
import t from 'tcomb'
import {Ingredient} from '../types'
import * as fixtures from './fixtures'

export const APPLY_SKILL = 'APPLY_SKILL'
export const MAKE_COURSE = 'MAKE_COURSE'
export const ADD_TO_BAG = 'ADD_TO_BAG'

const Course = t.list(Ingredient)

const AppState = t.struct({
    bag: t.dict(t.Str, Ingredient),
    staging: t.list(Ingredient),
    menu: t.dict(t.Str, Course) 
})

const initialState = AppState({
    // TODO: Populate bag with some kind of seeding event 
    bag: {},
    staging: [],
    menu: {}
})

export function bag (state = initialState, action) {
    switch (action.type) {
        case APPLY_SKILL: {
            const { ingredient, skill: { name, rating }} = action.payload
            if (ingredient.skills) {
                const processedState = ingredient.skills[name]
                // Set processed state and remove used skill
                const newIngredient = Ingredient.update(ingredient, { processedState: { '$set': processedState }, skills: { '$remove': [name] }})
                const newBag = { [newIngredient.id]: newIngredient }
                return AppState.update(state, { bag: { '$merge': newBag }})
            } 
            return state
        }
        case MAKE_COURSE: {
            const { ingredients } = action.payload
            // Menu
            const name = generateName(ingredients)
            const newMenu = { [name]: ingredients }
            // Remove ingredients from bag
            const idsToRemove = ingredients.map(i => i.id)
            return AppState.update(state, { bag: { '$remove': idsToRemove }, menu: { '$merge': newMenu }})
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

//const course = Course([fixtures.steak, fixtures.carrots, fixtures.bread])
//const course2 = Course([fixtures.steak, fixtures.carrots, fixtures.broccoli, fixtures.bread])
//
//console.log('Apply skill: ', bag(initialState, { type: APPLY_SKILL, payload: { ingredient: fixtures.bread, skill: fixtures.slice }}))
//
//console.log('Make course: ', bag(initialState, { type: MAKE_COURSE, payload: { ingredients: course }}))
////console.log(bag(initialState, { type: MAKE_COURSE, payload: { ingredients: course2 }}))
//
//console.log('Add to bag: ', bag(initialState, {type: ADD_TO_BAG, payload: { ingredient: fixtures.carrots }}))
