function compose(...funcs) {
    return funcs.reduce((a, b) => (...args) => a(b(...args)));
}
function createStore(reducer, middlewares) {
    let currentState;
    function dispatch(action) {
        currentState = reducer(currentState, action);
    }
    function getState() {
        return currentState;
    }
    dispatch({ type: 'INIT' });
    let enhancedDispatch = dispatch;
    if (middlewares) {
        enhancedDispatch = compose(...middlewares)(dispatch);
    }
    return {
        dispatch: enhancedDispatch,
        getState,
    };
}
const counterInitial = {
    count: 0,
    message: '',
};
function counterReducer(state = counterInitial, action) {
    switch (action.type) {
        case 'add': {
            return {
                ...state,
                count: state.count + action.payload,
            };
        }
        case 'chat': {
            return {
                ...state,
                message: action.message,
            };
        }
        default: {
            return state;
        }
    }
}
const typeLogMiddleware = dispatch => {
    return ({ type, ...args }) => {
        console.log(`type is ${type}`);
        return dispatch({ type, ...args });
    };
};
const otherDummyMiddleware = dispatch => {
    return action => {
        console.log(`type in dummy is ${action.type}`);
        return dispatch(action);
    };
};
const counterStore = createStore(counterReducer, [typeLogMiddleware, otherDummyMiddleware]);
console.log(counterStore.getState().count);
counterStore.dispatch({ type: 'add', payload: 2 });
console.log(counterStore.getState().count);
