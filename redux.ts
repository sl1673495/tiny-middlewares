type Reducer<S, A> = (state: S, action: A) => S

type Action<T = any> = {
  type: T
}

function createStore<S, A extends Action>(reducer: Reducer<S, A>) {
  let currentState: S

  function dispatch(action: A) {
    currentState = reducer(currentState, action)
  }

  function getState() {
    return currentState
  }

  dispatch({type: 'INIT'} as A)

  return {
    dispatch,
    getState,
  }
}

type AddAction = {
  type: 'add'
  payload: number
}

type ChatAction = {
  type: 'chat'
  message: string
}

const counterInitial = {
  count: 0,
  message: '',
}

function counterReducer(
  state = counterInitial,
  action: AddAction | ChatAction,
) {
  switch (action.type) {
    case 'add': {
      return {
        ...state,
        count: state.count + action.payload,
      }
    }

    case 'chat': {
      return {
        ...state,
        message: action.message,
      }
    }

    default: {
        return state
    }
  }
}

const counterStore = createStore(counterReducer)

console.log(counterStore.getState().count)
counterStore.dispatch({type: 'add', payload: 2})
console.log(counterStore.getState().count)
