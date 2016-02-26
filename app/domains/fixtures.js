import _ from 'lodash'
import uuid from 'node-uuid'
import {Ingredient, Skill} from '../types'

const names = {
    vegetable: ['artichoke','arugula','asparagus','avocado','bamboo shoots','bean sprouts','beet','belgian endive','bell pepper','bok choy','broccoli','brussels sprouts','cabbage','calabash','capers','carrot','yuca','cauliflower','celery','celery root','celtuce','chayote','chinese broccoli/kai-lan','corn/maize','baby corn/candle corn','cucumber','english cucumber','gherkin','pickling cucumbers','daikon radish','edamame','eggplant/aubergine','elephant garlic','endive','curly/frisee','escarole','fennel','fiddlehead','galangal','garlic','ginger','grape leaves','wax beans','greens','amaranth leaves/chinese spinach','beet greens','collard greens','dandelion greens','kale','kohlrabi greens','mustard greens','rapini','spinach','swiss chard','turnip greens','hearts of palm','horseradish','jerusalem artichoke/sunchokes','jícama','kale','curly','lacinato','ornamental','kohlrabi','leeks','lemongrass','lettuce','butterhead- bibb, boston','iceberg','leaf- green leaf, red leaf','romaine','lotus root','lotus seed','mushrooms- see mushroom list','napa cabbage','nopales','okra','olive','onion','green onions/scallions','parsley','parsley root','parsnip','peas','green peas','snow peas','sugar snap peas','plantain','potato','pumpkin','purslane','radicchio','radish','rutabaga','shallots','spinach','squash- see squash list','sweet potato','swiss chard','taro','tomatillo','tomato','turnip','water chestnut','water spinach','watercress','winter melon','yams','zucchini'],
    fruit: ['apple','apricot','avocado','banana','breadfruit','carob','cherry','citron','coconut','date','dragon fruit/pitaya','durian','fig','ginger','grapes','currant','raisin','grapefruit','guava','jackfruit','jujube','kiwifruit','kumquat','lemon','lime','longan','loquat','lucuma','lychee','mamey sapote','mango','mangosteen','nance','nectarine','noni','oranges','blood orange','clementine','navel','seville','valencia','papaya','passion fruit','peach','pear','asian pear','persimmon','pineapple','plantain','plum','damson','prunes','pomegranate','pomelo','prickly pear/cactus pear','quince','rambutan','rhubarb','starfruit','tamarillo','tamarind','tangerine','tangelo','tomato'],
    protein: ['steak', 'pork', 'chicken', 'frog legs'],
    grain: ['amaranth','barley','barley grits','buckwheat','buckwheat grits','corn','hominy','popcorn','millet','oats','oat groats','oat bran','quinoa','rice','rye','rye berries','cracked rye','rye flakes','sorghum','spelt','spelt berries','spelt flakes','teff','triticale','triticale berries','triticale flakes','wheat','wheat berries','bulgur wheat','cracked wheat','farina','semolina','pasta','couscous','wheat bran','wheat flakes','farro','kamut','durum wheat','wild rice']
}

const skills = [{'slice': 'sliced'}, {'chop': 'chopped'}, {'mince': 'minced'}, {'peel': 'peeled'}]

// Ingredient generator
export function makeRandomIngredient(subclass) {
    return Ingredient({
        id: uuid.v4(),
        name: _.shuffle(names[subclass])[0],
        subclass: subclass,
        rating: _.random(0, 10),
        expiresIn: _.random(5, 30),
        quality: _.random(0, 100),
        skills: _.shuffle(skills)[0],
        cookedState: 'raw',
        processedState: 'unprocessed'
    })
    
}

// Skills
export const slice = Skill({
    name: 'slice',
    rating: 10
})