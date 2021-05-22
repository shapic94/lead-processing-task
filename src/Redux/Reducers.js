import {combineReducers} from 'redux'

const reducer = (state = {}, action) => {
	switch (action.type) {
		case "SET_USER":
			return {...state, user: action.payload}
		case "SET_EMAIL":
			return {...state, email: action.payload}
		default:
			return state
	}
}

const rootReducer = combineReducers({
	global: reducer
});

export default rootReducer;