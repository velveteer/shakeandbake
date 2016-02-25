// TODO: Look into normalizr when setting up Redux state
import t from 'tcomb'
import _ from 'lodash'
import {vegetables as vegetablesFixture} from '../fixtures'

// Enums will be constructed out of these constant/finite lists
export const SKILLS_LIST = ['bake', 'toast', 'chop', 'slice', 'beat', 'crush', 'mince', 'peel', 'dice']

export const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack', 'dessert']

// States for processable ingredients
export const BASE_STATE = ['raw']
export const VEGETABLE_STATES = ['roasted', 'steamed', 'pureed']
export const PROTEIN_STATES = ['rare', 'medium rare', 'medium', 'medium well', 'well done']
export const BAKED_STATES = ['baked', 'burnt']
export const COOKED_STATES = _.union(BASE_STATE, VEGETABLE_STATES, PROTEIN_STATES, BAKED_STATES)

// A Rating is an integer between 0-100
export const Rating = t.subtype(t.Num, n => n >= 0 && n <= 100)

// A Skill has a name and a rating
// The rating is used to calculate speed and resulting quality
export const Skill = t.struct({
    name: t.enums.of(SKILLS_LIST),
    rating: Rating
})

// A user can process an ingredient with various Skills
// The time it takes to process an ingredient depends on Skill rating + Ingredient Rating + Tool Quality
// Quality should begin at 100 and decrease as the expiration date nears
// Some ingredients can be PROCESSED to YIELD NEW INGREDIENTS -- this is a supplementary mechanic to COMBINING ingredients with a recipe to yield new ingredients
// TODO: Certain skills can only be applied to certain ingredients...How? Does this logic live in the model?
export const Ingredient = t.declare('Ingredient')
Ingredient.define(t.struct({
    _id: t.Str,
    name: t.Str,
    rating: Rating,
    expiresIn: t.Num,
    yields: t.maybe(t.list(t.tuple([t.enums.of(SKILLS_LIST), Ingredient]))),
    quality: t.Num,
    state: t.maybe(t.enums.of(COOKED_STATES))
}))

// Apply a skill to an ingredient and get a new ingredient
Ingredient.prototype.applySkill = function (skill) {
    const match = _.flatten(this.yields.filter(y => y[0] === skill.name))
    if (match.length) {
        return match[1]
    } else {
        return this
    }
}

// Pretty print the state + name of an ingredient i.e. Raw Taro, Steamed Carrots
Ingredient.prototype.getFullLabel = function () {
    if (this.state) {
        return _.capitalize(this.state) + ' ' + _.startCase(this.name)
    } else {
        return _.startCase(this.name)
    }
}

// TODO: Format this with moment
Ingredient.prototype.getExpirationDate = function () {
    let date = new Date()
    let expirationDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() + this.expiresIn)
    return expirationDate.toString()
}

export const makeSomeVegetables = () => {
    return vegetablesFixture.map(i => Ingredient(i))
}

// A Recipe is simple -- a list of ingredients required, a list of skills required
// Meal type is a RECOMMENDED meal type, and does not count towards a meal type prefrence for Barons 
export const Recipe = t.struct({
    _id: t.Str,
    name: t.Str,
    items: t.list(Ingredient),
    prereqs: t.list(t.tuple([t.enums.of(SKILLS_LIST), Rating])),
    quality: t.maybe(t.Num),
    mealType: t.enums.of(MEAL_TYPES)
})

// A recipe RATING should be a measure of complexity, and how much XP is rewarded for discovering it
Recipe.prototype.getRating = function () {
    this.items.length * 120;
}

// Return true if the User has prerequisite Skill ratings for this recipe instance
Recipe.prototype.checkPrereqs = function (skills) {
    const prereqs = _.fromPairs(this.prereqs)
    const realSkills = skills.filter(s => prereqs[s.name])
    return _.every(realSkills, s => s.rating >= prereqs[s.name])
}

// Returns a new Recipe with a specific quality based on the ingredients
// If a Recipe has a quality it can be added to a Menu as an entree
Recipe.prototype.cook = function () {
    const qs = this.items.map(i => i.quality)
    const quality = Math.floor(qs.reduce((x, y) => x + y, 0) / this.items.length)
    return Recipe.update(this, { quality: { '$set': quality }})
}

// TODO: Flesh out menu concept. A Baron will want full courses for each meal of the day. The User needs to devise a full menu given their budget and skillset.
export const Menu = t.struct({
    course: t.list(t.struct({
        meal: t.enums.of(MEAL_TYPES),
        entrees: t.list(Recipe)
    }))
})

// TODO: Is this a fun mechanic? 
// Higher quality equipment allows skills to be completed quicker. Low quality means low skill times.
// Having to maintain equipment is tedious, but upgrading equipment can be rewarding.
export const Equipment = t.struct({
    price: t.Num,
    type: t.Str,
    quality: t.Num,
    wear: t.Num
})

// A user maintains experience and an array of various skills that increase in rating with repeated use
export const User = t.struct({
    _id: t.Str,
    first: t.Str,
    last: t.Str,
    xp: t.Num, 
    skills: t.list(Skill),
    bag: t.list(Ingredient)
})

User.prototype.getLevel = function () { 
    return Math.sqrt(this.xp/1000)
}

// A Baron pays the User a weekly stipend to buy ingredients for his meals
// A User must craft recipes in order to increase their stipend and gain the trust of the Baron
// Baron's are level restricted, so a user must level up if they wish to move to richer Barons
// TODO: More trust means a User can take more liberties in the kitchen? More trust means...what? What's the real payoff?
export const Baron = t.struct({
    _id: t.Str,
    name: t.Str,
    level: t.Num, // or class
    allergies: t.list(Ingredient),
    dislikes: t.list(Ingredient),
    preferences: t.list(Ingredient), // could be a tuple of ingredients and MEAL_TYPE i.e. breakfast
    isDeceased: t.Bool,
    trust: t.Num
})

Baron.prototype.getStipend = function (xp) {
    return this.trust * this.level * xp
}

Baron.prototype.allergyCheck = function (ingredients) {
    return _.intersectionBy(ingredients, this.allergies, 'name')
}

Baron.prototype.dislikeCheck = function (ingredients) {
    return _.intersectionBy(ingredients, this.dislikes, 'name')
}

// TODO: Maybe use intersectionWith to compare STATE and NAME of recipe ingredients with preferred ingredients. Maybe get BONUS points for matching both STATE and NAME instead of just NAME
// https://lodash.com/docs#intersectionWith
Baron.prototype.preferenceCheck = function (ingredients) {
    return _.intersectionBy(ingredients, this.preferences, 'name')
}

// Feed a Baron a recipe and return a newly updated Baron based on that recipe
Baron.prototype.feed = function (recipe) {
    const ingredients = recipe.items;
    const dislikes = this.dislikeCheck(ingredients)
    const allergies = this.allergyCheck(ingredients)
    const prefs = this.preferenceCheck(ingredients)
    if (allergies.length >= 3) {
        return Baron.update(this, { isDeceased: { '$set': true }})
    } else {
        return Baron.update(this, { trust: { '$set': this.trust + prefs.length - dislikes.length - allergies.length }})
    }
    
}



// Fixtures -- testing
const Cilantro = Ingredient({
    _id: 'cilantro',
    name: 'cilantro',
    rating: 0,
    expiresIn: 7,
    quality: 50
})

const Steak = Ingredient({
    _id: 'steak',
    name: 'steak',
    rating: 0,
    expiresIn: 10,
    quality: 100,
    state: 'raw'
})

const Potatoes = Ingredient({
    _id: 'potatoes',
    name: 'potatoes',
    rating: 0,
    expiresIn: 30,
    quality: 50
})

const ToastedBread = Ingredient({
    _id: 'toast',
    name: 'toast',
    rating: 0,
    expiresIn: 10,
    quality: 100
})

const SlicedBread = Ingredient({
    _id: 'slicedBread',
    name: 'slicedBread',
    rating: 0,
    expiresIn: 10,
    quality: 100
})

const Bread = Ingredient({
    _id: 'bread',
    name: 'bread',
    rating: 0,
    expiresIn: 10,
    quality: 100,
    yields: [['toast', ToastedBread], ['slice', SlicedBread]]
})

const Dough = Ingredient({
    _id: 'dough',
    name: 'dough',
    rating: 0,
    expiresIn: 30,
    quality: 50,
    yields: [['bake', Bread]]
})

const Chop = Skill({
    name: 'chop',
    rating: 20
})

const Slice = Skill({
    name: 'slice',
    rating: 20
})

const Dice = Skill({
    name: 'dice',
    rating: 1
})

const Bake = Skill({
    name: 'bake',
    rating: 1
})

const Toast = Skill({
    name: 'toast',
    rating: 1
})

const testBaron = Baron({
    _id: 'heinz',
    name: 'Heinz the Baron Kraus von Espy', 
    level: 1, 
    allergies: [Cilantro],
    dislikes: [],
    isDeceased: false,
    preferences: [Steak],
    trust: 10
})

const deadBaron = Baron({
    _id: 'adolf',
    name: 'Baron Adolf Hans Gruber',
    level: 1, 
    allergies: [Cilantro, Steak, Potatoes],
    dislikes: [],
    preferences: [],
    isDeceased: false,
    trust: 10
})

const testRecipe1 = Recipe({
    _id: 'filet mignon',
    name: 'filet mignon',
    items: [Potatoes, Steak],
    prereqs: [['chop', 50]],
    mealType: 'dinner'
})

const testRecipe2 = Recipe({
    _id: 'street tacos',
    name: 'street tacos',
    items: [Cilantro, Steak],
    prereqs: [['chop', 10], ['slice', 20]],
    mealType: 'dinner'
})

const poisonRecipe = Recipe({
    _id: 'carne guisada',
    name: 'carne guisada',
    items: [Cilantro, Potatoes, Steak],
    prereqs: [['chop', 10], ['slice', 20]],
    mealType: 'dinner'
})

const testUser = User({ _id: 'user1', first: 'Test', last: 'Last', xp: 1000, skills: [Chop, Dice], bag: [] })

console.assert(testBaron.feed(testRecipe1).trust === 11)
console.assert(testBaron.feed(testRecipe2).trust === 10)
console.assert(deadBaron.feed(poisonRecipe).isDeceased === true)

console.assert(testUser.getLevel() === 1)
console.assert(testRecipe2.checkPrereqs(testUser.skills))
console.assert(!testRecipe1.checkPrereqs(testUser.skills)) 

console.assert(testRecipe1.cook().quality === 75)
console.assert(poisonRecipe.cook().quality === 66)

console.assert(Dough.applySkill(Bake).name === 'bread')
console.assert(Bread.applySkill(Toast).name === 'toast')
console.assert(Bread.applySkill(Slice).name === 'slicedBread')