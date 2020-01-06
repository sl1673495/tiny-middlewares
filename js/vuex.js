"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Vuex {
    constructor({ state, action }) {
        this.state = state;
        this.action = action;
        this._actionSubscribers = [];
    }
    dispatch(action) {
        this._actionSubscribers.forEach(sub => sub.before(action, this.state));
        const { type, payload } = action;
        this.action[type](this.state, payload).then(() => {
            this._actionSubscribers.forEach(sub => sub.after(action, this.state));
        });
    }
    subscribeAction(subscriber) {
        this._actionSubscribers.push(subscriber);
    }
    createDispatch() {
        return this.dispatch.bind(this);
    }
}
exports.default = Vuex;
const store = new Vuex({
    state: {
        count: 0,
        message: '',
    },
    action: {
        async add(state, payload) {
            state.count += payload;
        },
        async chat(state, message) {
            state.message = message;
        },
    },
});
store.subscribeAction({
    before: (action, state) => {
        console.log(`before action ${action.type}, before state is ${JSON.stringify(state)}`);
    },
    after: (action, state) => {
        console.log(`after action ${action.type},  after state is ${JSON.stringify(state)}`);
    },
});
// for TypeScript support
const dispatch = store.createDispatch();
dispatch({
    type: 'add',
    payload: 3,
});
dispatch({
    type: 'chat',
    payload: 'Hello World',
});
