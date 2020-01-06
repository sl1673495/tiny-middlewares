export type Actions<S, A> = {
  [key in keyof A]: (state: S, payload: any) => Promise<any>
}

export type ActionArguments<A> = {
  type: keyof A
  payload?: any
}

export type Subscriber<S, A> = (action: ActionArguments<A>, state: S) => any

export type ActionSubscriber<S, A> = {
  before: Subscriber<S, A>
  after?: Subscriber<S, A>
}

export type ActionSubscribers<S, A> = ActionSubscriber<S, A>[]

export interface Dispatch<A> {
  (action: A, ...extraArgs: any[]): any
}

export default class Vuex<S, A> {
  state: S

  action: Actions<S, A>

  _actionSubscribers: ActionSubscribers<S, A>

  constructor({state, action}: {state: S; action: Actions<S, A>}) {
    this.state = state
    this.action = action
    this._actionSubscribers = []
  }

  dispatch(action: ActionArguments<A>) {
    this._actionSubscribers.forEach(sub => sub.before(action, this.state))

    const {type, payload} = action
    this.action[type](this.state, payload).then(() => {
      this._actionSubscribers.forEach(sub => sub.after(action, this.state))
    })
  }

  subscribeAction(subscriber: ActionSubscriber<S, A>) {
    this._actionSubscribers.push(subscriber)
  }

  createDispatch<A>() {
    return this.dispatch.bind(this) as Dispatch<A>
  }
}

const store = new Vuex({
  state: {
    count: 0,
    message: '',
  },
  action: {
    async add(state, payload) {
      state.count += payload
    },
    async chat(state, message) {
      state.message = message
    },
  },
})

store.subscribeAction({
  before: (action, state) => {
    console.log(
      `before action ${action.type}, before state is ${JSON.stringify(state)}`,
    )
  },
  after: (action, state) => {
    console.log(
      `after action ${action.type},  after state is ${JSON.stringify(state)}`,
    )
  },
})

type ActionTypes =
  | {
      type: 'add'
      payload: number
    }
  | {
      type: 'chat'
      payload: string
    }

// for TypeScript support
const dispatch = store.createDispatch<ActionTypes>()

dispatch({
  type: 'add',
  payload: 3,
})

dispatch({
  type: 'chat',
  payload: 'Hello World',
})
