import { combineReducers } from 'redux';

// this is a reducer which will store the token information and user name information
// will wrap the Router to make it valid
function token (state = { token: '' }, action) {
  switch (action.type) {
    case 'setToken':
      return {
        ...state,
        token: action.payload,
      };
    default:
      return state;
  }
}

function username (state = { username: '' }, action) {
  switch (action.type) {
    case 'setUsername':
      return {
        ...state,
        username: action.payload,
      };
    default:
      return state;
  }
}

const rootReducer = combineReducers({ 
  token: token, 
  username: username });
export default rootReducer;