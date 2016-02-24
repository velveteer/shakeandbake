import t from 'tcomb'
import _ from 'lodash'
import {vegetables as vegetablesFixture} from '../fixtures'

export const SKILLS_LIST = ['chop', 'slice', 'beat', 'crush', 'mince', 'peel', 'dice']
export const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack', 'dessert']

const Rating = t.subtype(t.Num, n => n >= 0 && n <= 100)

// A Skill has a name and a rating
// The rating is used to calculate speed and resulting quality
export const Skill = t.struct({
    name: t.enums.of(SKILLS_LIST),
    rating: Rating
})

// A user can process an ingredient with various Skills
// The time it takes to process an ingredient depends on Skill rating + Ingredient Rating
// Certain skills can only be applied to certain ingredients
export const Ingredient = t.struct({
    _id: t.Str,
    name: t.Str,
    rating: Rating,
    expiresIn: t.Num,
    quality: t.Num
})

Ingredient.prototype.getFullLabel = function () {
    if (this.state) {
        return _.capitalize(this.state) + ' ' + _.startCase(this.name)
    } else {
        return _.startCase(this.name)
    }
}

Ingredient.prototype.getExpirationDate = function () {
    let date = new Date()
    let expirationDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() + this.expiresIn)
    return expirationDate.toString()
}

const HERB_STATES = ['whole', 'chopped', 'crushed', 'minced']
export const Herb = Ingredient.extend({ state: t.enums.of(HERB_STATES)})

//does raw mean uncooked or whole?
//should we add cook-states to vegetables, as well?
// it's an idea -- still thinking about it
// not sure if we need raw states vs. cooked states yet -- would make it pretty complex
// will require a rethinking of skills
const VEGETABLE_STATES = ['raw', 'roasted', 'steamed', 'pureed']
export const Vegetable = Ingredient.extend({ state: t.enums.of(VEGETABLE_STATES)})
export const makeSomeVegetables = () => {
    return vegetablesFixture.map(i => Vegetable(i))
}

const PROTEIN_STATES = ['raw', 'rare', 'medium rare', 'medium', 'medium well', 'well done']
export const Protein = Ingredient.extend({ state: t.enums.of(PROTEIN_STATES)})

// A recipe consists of a list of ingredients
// we can have a requirements or prerequisites property that will match
// element(s) of a user's given skillset (or not match it, and thus be unavailable to them)
// then all we have to check is if the intersection of skills and prerequisites equals prerequisites 
// now we're talkin
// so is the rating the accumlated skills required? as in, we have separate skills
// so they might need separate rating requirements in recipes
export const Recipe = t.struct({
    _id: t.Str,
    name: t.Str,
    items: t.list(Ingredient),
    rating: Rating,
    prereqs: t.list(t.tuple([t.enums.of(SKILLS_LIST), Rating])),
    mealType: t.enums.of(MEAL_TYPES)
})

//for some reason _.differenceBy isn't working like I think it should, so maybe
//you can figure it out
// How do we make this check ratings on skills instead?
// instead? or as well?
// I feel like all skills could be available, just at very low levels
// User could decide which skills to boost on a new character
// we probably should move back to where we instantiate recipes -- how do we define a rating requirement on recipe skills?
// hmm. I mean, our skill struct already has a rating, so it just depends on if we want to
// create a new skill instance for each recipe and feed it a rating
// then we can check against the skill.ratings between prereqs and user skills
// probably want to do a >= check

Recipe.prototype.checkPrereqs = function (skills) {
    const prereqs = _.fromPairs(this.prereqs)
    const realSkills = skills.filter(s => prereqs[s.name])
    return _.every(realSkills, s => s.rating >= prereqs[s.name])
}

//just a start, fill in and edit as you see fit
// I am thinking each model here is going to be a database in whichever db we choose
// So we'd have a database called Equipment with all the equipment in it 
// gotcha, so just name: t.Str then? yeah, makes sense?
//yeah
// there's a chance I lessen the priority of "processing" ingredients and focus on recipe building, to remove complexity as we start
// yeah, that's fine. maybe I'm getting ahead of myself
// I want it to be detailed and not tedious, but leave this anyhow -- if it's a fun mechanic we will incorporate it
// cool, sounds good. what should I be thinking about at this point, as in, what
// would be a good thing for me to model or logic out?
// yeah, we're just trying to think of the state of the application at any point in time. something we can save to a db and rehydrate 
// so equipment is pretty static besides the wear
// we'd need a way to associate equipment with a user
// we already have skills --- so how would skills tie in with equipment? or can they be merged?
// hm... I guess if we're not worrying about anything other than static props, skills
// can be merged with equipment. so if you have knife skills, you can chop. or maybe
// chop and dice are separate skills, and there is no generic "knife" skill
// if you have the chop skill, then you can cook anything with chopped x as a requirement, 
// yeah nice -- how do we define chopped x as a requirement? 
// ^^
export const Equipment = t.struct({
    type: t.Str, // enums may not be necessary, this could just as well be "name"
    quality: t.Num,
    wear: t.Num // haha the user is gonna have to hone their blades? 
    //-- maybe, or maybe as it gets used, its wear increases, which will deduct from a recipe's quality (e.g., badly diced onions with dull blade)
    // yeah cool idea -- repairs or buying new equipment could be a mechanism 
    // yeah, exactly. and you could maybe sell and buy used blades, for cheaper, but with higher "wear" damage
})

// A user maintains a level and an array of various skills
// New skills are added as level increases
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

// just a quick outline of a baron/ess model 
// level is, I figure, a representation of the baron/ess's level in the royalty
// prefs are unknown to the user -- and we will not be letting the user know them explicitly

////// How fine grained can we get prefs? Like does the Baron like FISH for BREAKFAST?
// I think that would be cool. I like the idea of hiding the preferences from the user
// but it would be cool if there were enough visible side effects that a user could
// intuitively "learn" the baron/esses prferences -- e.g., you serve them
// fish for breakfast twice, you get a sense that gets you better scores
export const Baron = t.struct({
    _id: t.Str,
    name: t.Str,
    level: t.Num, // or class
    allergies: t.list(Ingredient),
    preferences: t.list(Ingredient),
    trust: t.Num
})

Baron.prototype.getStipend = function (xp) {
    return this.trust * this.level * xp
}

Baron.prototype.allergyCheck = function (ingredients) {
    return _.intersectionBy(ingredients, this.allergies, 'name')
}

Baron.prototype.preferenceCheck = function (ingredients) {
    return _.intersectionBy(ingredients, this.preferences, 'name')
}

Baron.prototype.updateTrust = function (ingredients) {
    const allergies = this.allergyCheck(ingredients)
    const prefs = this.preferenceCheck(ingredients)
    return (this.trust + prefs.length) - allergies.length
}






// Fixtures -- testing
const Cilantro = Herb({
    _id: 'cilantro',
    name: 'cilantro',
    rating: 0,
    expiresIn: 7,
    quality: 0,
    state: 'whole'
})

const Steak = Protein({
    _id: 'steak',
    name: 'steak',
    rating: 0,
    expiresIn: 10,
    quality: 0,
    state: 'raw'
})

const Potatoes = Vegetable({
    _id: 'potatoes',
    name: 'potatoes',
    rating: 0,
    expiresIn: 30,
    quality: 0,
    state: 'roasted'
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

const testBaron = Baron({
    _id: 'heinz',
    name: 'Heinz the Baron Kraus von Espy', 
    level: 1, 
    allergies: [Cilantro],
    preferences: [Steak],
    trust: 10
})

const testRecipe1 = Recipe({
    _id: 'filet mignon',
    name: 'filet mignon',
    items: [Potatoes, Steak],
    rating: 1,
    prereqs: [['chop', 50]],
    mealType: 'dinner'
})

const testRecipe2 = Recipe({
    _id: 'street tacos',
    name: 'street tacos',
    items: [Cilantro, Steak],
    rating: 100,
    prereqs: [['chop', 10], ['slice', 20]],
    mealType: 'dinner'
})

console.assert(testBaron.updateTrust(testRecipe1.items) === 11)
console.assert(testBaron.updateTrust(testRecipe2.items) === 10)

const testUser = User({ _id: 'user1', first: 'Test', last: 'Last', xp: 1000, skills: [Chop, Dice], bag: [] })

console.assert(testUser.getLevel() === 1)
console.assert(testRecipe2.checkPrereqs(testUser.skills))
console.assert(!testRecipe1.checkPrereqs(testUser.skills)) 