import {Ingredient} from '../types'

export const steak = Ingredient({
    id: 'steak',
    name: 'steak',
    amount: 1,
    subclass: 'protein',
    rating: 0,
    expiresIn: 10,
    quality: 100,
    skills: {'slice': 'sliced'},
    cookedState: 'rare',
    processedState: 'sliced'
})

export const broccoli = Ingredient({
    id: 'broccoli',
    name: 'broccoli',
    amount: 1,
    subclass: 'vegetable',
    rating: 0,
    expiresIn: 10,
    quality: 100,
    skills: {'chop': 'chopped'},
    cookedState: 'steamed',
    processedState: 'chopped'
})

export const carrots = Ingredient({
    id: 'carrots',
    name: 'carrots',
    amount: 1,
    subclass: 'vegetable',
    rating: 0,
    expiresIn: 10,
    quality: 100,
    skills: {'peel': 'peeled'},
    cookedState: 'raw',
    processedState: 'peeled'
})

export const bread = Ingredient({
    id: 'bread',
    name: 'bread',
    amount: 1,
    subclass: 'bread',
    rating: 0,
    expiresIn: 10,
    quality: 100,
    skills: {'slice': 'sliced'},
    cookedState: 'raw',
    processedState: 'unprocessed'
})

export const slicedBreadFixture = Ingredient({
    id: 'bread',
    name: 'bread',
    amount: 1,
    subclass: 'bread',
    rating: 0,
    expiresIn: 10,
    quality: 100,
    cookedState: 'raw',
    processedState: 'sliced'
})