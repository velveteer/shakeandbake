import t from 'tcomb'

export const SKILLS_LIST = ['chop', 'slice', 'beat', 'crush', 'mince', 'peel']

const Rating = t.subtype(t.Num, n => n >= 0 && n <= 100)

// A Skill has a name and a rating
// The rating is used to calculate speed and resulting quality
export const Skill = t.struct({
    name: t.enums.of(SKILLS_LIST),
    rating: Rating
})

// A user maintains a level and an array of various skills
// New skills are added as level increases
export const User = t.struct({
    first: t.Str,
    last: t.Str,
    level: t.Num,
    skills: t.list(Skill)
})

// Rating determines level requirement for processing
// A user can process an ingredient with various Skills
// The time it takes to process an ingredient depends on Skill rating + Ingredient Rating
// Certain skills can only be applied to certain ingredients
export const Ingredient = t.struct({
    name: t.Str,
    rating: Rating,
    expirationDate: t.Date,
    state: t.Str, 
    quality: t.Num
})

// A recipe consists of a list of ingredients
// It is restricted by rating and availability of ingredients
export const Recipe = t.struct({
    items: t.list(Ingredient),
    rating: t.Num
})

export const makeSomeIngredients = (amount) => {
    let ingrs = Array.apply(null, {length: amount}).map(Function.call, Math.random)
    return ingrs.map(i => {
        return new Ingredient({
            name: `Ingr ${i}`,
            rating: 0,
            expirationDate: new Date(),
            state: 'whole',
            quality: 0
        })
    })
}