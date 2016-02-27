import _ from 'lodash'
import uuid from 'node-uuid'
import * as types from '../types'

const names = {
    vegetable: ['artichoke','arugula','asparagus','avocado','bamboo shoots','bean sprouts','beet','belgian endive','bell pepper','bok choy','broccoli','brussels sprouts','cabbage','calabash','capers','carrot','yuca','cauliflower','celery','celery root','celtuce','chayote','chinese broccoli/kai-lan','corn/maize','baby corn/candle corn','cucumber','english cucumber','gherkin','pickling cucumbers','daikon radish','edamame','eggplant/aubergine','elephant garlic','endive','curly/frisee','escarole','fennel','fiddlehead','galangal','garlic','ginger','grape leaves','wax beans','greens','amaranth leaves/chinese spinach','beet greens','collard greens','dandelion greens','kale','kohlrabi greens','mustard greens','rapini','spinach','swiss chard','turnip greens','hearts of palm','horseradish','jerusalem artichoke/sunchokes','jícama','kale','curly','lacinato','ornamental','kohlrabi','leeks','lemongrass','lettuce','butterhead- bibb, boston','iceberg','romaine','lotus root','lotus seed','mushrooms','napa cabbage','nopales','okra','olive','onion','green onions/scallions','parsley','parsley root','parsnip','peas','green peas','snow peas','sugar snap peas','plantain','potato','pumpkin','purslane','radicchio','radish','rutabaga','shallots','spinach','squash','sweet potato','swiss chard','taro','tomatillo','tomato','turnip','water chestnut','water spinach','watercress','winter melon','yams','zucchini'],
    fruit: ['apple','apricot','avocado','banana','breadfruit','carob','cherry','citron','coconut','date','dragon fruit/pitaya','durian','fig','ginger','grapes','currant','raisin','grapefruit','guava','jackfruit','jujube','kiwifruit','kumquat','lemon','lime','longan','loquat','lucuma','lychee','mamey sapote','mango','mangosteen','nance','nectarine','noni','oranges','blood orange','clementine','navel','seville','valencia','papaya','passion fruit','peach','pear','asian pear','persimmon','pineapple','plantain','plum','damson','prunes','pomegranate','pomelo','prickly pear/cactus pear','quince','rambutan','rhubarb','starfruit','tamarillo','tamarind','tangerine','tangelo','tomato'],
    protein: ['new york strip', 'pork loin', 'chicken wings', 'frog legs', 'veal cutlets', 'lamb chops', 'beef ribs', 'chicken breast', 'rib eye steak'],
    grain: ['amaranth','barley','barley grits','buckwheat','buckwheat grits','corn','hominy','popcorn','millet','oats','oat groats','oat bran','quinoa','rice','rye','rye berries','cracked rye','rye flakes','sorghum','spelt','spelt berries','spelt flakes','teff','triticale','triticale berries','triticale flakes','wheat','wheat berries','bulgur wheat','cracked wheat','farina','semolina','pasta','couscous','wheat bran','wheat flakes','farro','kamut','durum wheat','wild rice'],
    herb: ['basil'],
    bean: ['black beans', 'pinto beans', 'lentils', 'split peas', 'garbanzo beans']
}

export const COMPOSITES_LIST = [
    {name: 'tomato', state: 'pureed'}, {name: 'basil', state: 'minced'}
]

// Ingredient generator
export function makeRandomIngredient (subclass) {
    return types.Ingredient({
        id: uuid.v4(),
        name: _.shuffle(names[subclass])[0],
        subclass: subclass,
        expiresIn: _.random(5, 30),
        quality: _.random(0, 100),
        time: 0,
        processCount: 0,
        cookedState: 'raw',
        processedState: 'unprocessed'
    })
    
}

// Tools
const TOOLS_LIST = [
    {
        name: 'joshs chefs knife',
        skills: [{name: 'mince', level: 1}],
        quality: 1
    },
    {
        name: 'richs trusty blade',
        skills: [{name: 'chop', level: 1}],
        quality: 1
    },
    {
        name: 'masamune',
        skills: [{name: 'slice', level: 100}],
        quality: 100
    },
    {
        name: 'blend-o-matic',
        skills: [{name: 'puree', level: 10}, {name: 'powder', level: 1}],
        quality: 100
    }
]

function makeAllTools () {
    return _.keyBy(TOOLS_LIST.map(tool => types.Tool(tool)), 'name')
}

// User
export const user = types.User({
    id: uuid.v4(),
    first: 'Duke',
    last: 'Of York',
    xp: 1000,
    tools: makeAllTools()
})

