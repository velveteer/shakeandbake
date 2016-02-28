import t from 'tcomb'
import _ from 'lodash'

// Enums will be constructed out of these constant/finite lists
export const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack', 'dessert']
export const SUBCLASSES = ['protein', 'vegetable', 'fruit', 'grain', 'herb', 'bean', 'dough']

export const SKILL_STATE_TABLE = {
    cube: 'cubed',
    chop: 'chopped',
    slice: 'sliced',
    mince: 'minced',
    fry: 'fried',
    bake: 'baked',
    grill: 'grilled',
    steam: 'steamed',
    roast: 'roasted',
    broil: 'broiled',
    crush: 'crushed',
    soak: 'soaked',
    puree: 'pureed',
    powder: 'powdered',
    roll: 'rolled'
}

// Processing Skills -- by subclass
// TODO Whole ingredients
export const BASE_PROCESSING_SKILLS = ['whole']
export const P_PROCESSING_SKILLS = ['cube', 'slice']
export const VF_PROCESSING_SKILLS = ['chop', 'slice', 'mince', 'puree']
export const H_PROCESSING_SKILLS = ['mince', 'crush']
export const G_PROCESSING_SKILLS = ['crush', 'powder']
export const BEAN_PROCESSING_SKILLS = ['soak', 'puree', 'powder']
export const DOUGH_PROCESSING_SKILLS = ['roll']

export const PROCESSING_SKILLS = _.union(P_PROCESSING_SKILLS, VF_PROCESSING_SKILLS, H_PROCESSING_SKILLS, G_PROCESSING_SKILLS, BEAN_PROCESSING_SKILLS, DOUGH_PROCESSING_SKILLS)
export const PROCESSING_STATES = ['unprocessed'].concat(PROCESSING_SKILLS.map(x => SKILL_STATE_TABLE[x]))

// Cooking Skills -- by subclass
export const BASE_COOKING_SKILLS = ['fry'] // because you can fry anything
export const VF_COOKING_SKILLS = ['bake', 'grill', 'steam', 'roast']
export const P_COOKING_SKILLS = ['roast', 'grill', 'broil']

export const COOKING_SKILLS = _.union(BASE_COOKING_SKILLS, VF_COOKING_SKILLS, P_COOKING_SKILLS)
export const COOKING_STATES = ['raw'].concat(COOKING_SKILLS.map(x => SKILL_STATE_TABLE[x]))

// All skills and states
export const SKILLS_LIST = _.union(PROCESSING_SKILLS, COOKING_SKILLS)
export const STATES_LIST = _.union(PROCESSING_STATES, COOKING_STATES)

export const SUBCLASS_SKILLS_TABLE = {
    protein: P_PROCESSING_SKILLS.concat(P_COOKING_SKILLS),
    vegetable: VF_PROCESSING_SKILLS.concat(VF_COOKING_SKILLS),
    fruit: VF_PROCESSING_SKILLS.concat(VF_COOKING_SKILLS),
    grain: G_PROCESSING_SKILLS,
    herb: H_PROCESSING_SKILLS,
    bean: BEAN_PROCESSING_SKILLS,
    dough: DOUGH_PROCESSING_SKILLS
}

// A Rating is an integer between 0-100
export const Rating = t.subtype(t.Num, n => n >= 0 && n <= 100)

// A Skill has a name and a rating
// The rating is used to calculate speed and resulting quality
export const Skill = t.struct({
    name: t.enums.of(SKILLS_LIST),
    level: Rating
})

// A user can process an ingredient with various Tools, which enact Skills
// The time it takes to process an ingredient depends on Base level + Skill level + Tool quality
// Quality should begin at 100 and decrease as the expiration date nears
// TODO: We can add more fields for different kinds of Baron preferences -- such as "doneness" for certain foods based on how long it was cooked for
export const Ingredient = t.struct({
    id: t.Str,
    name: t.Str,
    subclass: t.Str,
    expiresIn: t.Num,
    quality: Rating,
    time: t.maybe(t.Num),
    processCount: t.Num,
    cookedState: t.enums.of(COOKING_STATES),
    processedState: t.enums.of(PROCESSING_STATES)
})

export const Course = t.list(Ingredient)

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

// Higher quality equipment allows skills to be completed quicker. Low quality means low skill times.
// Having to maintain equipment is tedious, but upgrading equipment can be rewarding.
export const Tool = t.struct({
    name: t.Str,
    quality: Rating,
    skills: t.list(Skill)
})

// A user maintains experience and an array of various skills that increase in rating with repeated use
export const User = t.struct({
    id: t.Str,
    first: t.Str,
    last: t.Str,
    xp: t.Num, 
    tools: t.dict(t.Str, Tool)
})

User.prototype.getLevel = function () { 
    return Math.floor(Math.sqrt(this.xp/1000))
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

// A catch-all type for our kitchen state
export const AppState = t.struct({
    bag: t.dict(t.Str, Ingredient),
    preppedItems: t.dict(t.Str, Ingredient),
    currentTool: t.maybe(Tool),
    menu: t.dict(t.Str, Course),
   _skillTable: t.Object,
   _subclassSkillsTable: t.Object
})