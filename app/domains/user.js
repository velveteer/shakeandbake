import * as fixtures from './fixtures'

const initialState = {
    user: fixtures.user
}

export function user (state = initialState, action) {
    switch (action.type) {
        default: {
            return state
        }
    }
    
}