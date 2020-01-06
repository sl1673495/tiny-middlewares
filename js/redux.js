function createStore(reducer) {
    let currentState;
    function dispatch(action) {
        currentState = reducer(currentState, action);
    }
    function getState() {
        return currentState;
    }
    dispatch({ type: 'INIT' });
    return {
        dispatch,
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
const counterStore = createStore(counterReducer);
console.log(counterStore.getState().count);
counterStore.dispatch({ type: 'add', payload: 2 });
console.log(counterStore.getState().count);
