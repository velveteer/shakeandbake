import _ from 'lodash'
import PouchDB from 'pouchdb'
import {Ingredient, Vegetable} from './types'
import {ingredients} from '../fixtures'

const ingredientsDB = new PouchDB('ingredients')
ingredientsDB.bulkDocs(ingredients)
    .then(function () {
        return db.allDocs({include_docs: true})
        
    }).then(function (response) {
        console.log(response)
        
    }).catch(function (err) {
        console.log(err)
        
    })