type Reducer<S, A> = (state: S, action: A) => S;

type Action<T = any> = {
  type: T;
};

function compose(...funcs: Function[]) {
  return funcs.reduce((a, b) => (...args: any) => a(b(...args)));
}

function createStore<S, A extends Action>(reducer: Reducer<S, A>, middlewares?: any[]) {
  let currentState: S;

  function dispatch(action: A) {
    currentState = reducer(currentState, action);
  }

  function getState() {
    return currentState;
  }

  dispatch({ type: 'INIT' } as A);

  let enhancedDispatch = dispatch;
  if (middlewares) {
    enhancedDispatch = compose(...middlewares)(dispatch);
  }

  return {
    dispatch: enhancedDispatch,
    getState,
  };
}

type AddAction = {
  type: 'add';
  payload: number;
};

type ChatAction = {
  type: 'chat';
  message: string;
};

const counterInitial = {
  count: 0,
  message: '',
};

function counterReducer(state = counterInitial, action: AddAction | ChatAction) {
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
