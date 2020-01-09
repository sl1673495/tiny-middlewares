"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Vuex {
    constructor({ state, action, getters: rawGetters, }) {
        this.state = state;
        this.action = action;
        this._actionSubscribers = [];
        this.rawGetters = rawGetters;
        this.getters = {};
        this.calcGetters();
    }
    dispatch(action) {
        this._actionSubscribers.forEach(sub => sub.before(action, this.state, this.getters));
        const { type, payload } = action;
        this.action[type](this.state, payload).then(() => {
            this._actionSubscribers.forEach(sub => sub.after(action, this.state, this.getters));
            // 计算一把getters
            this.calcGetters();
        });
    }
    subscribeAction(subscriber) {
        this._actionSubscribers.push(subscriber);
    }
    calcGetters() {
        const { rawGetters } = this;
        Object.keys(this.rawGetters).forEach(rawGetterKey => {
            const rawGetter = rawGetters[rawGetterKey];
            this.getters[rawGetterKey] = rawGetter(this.state);
        });
    }
    createDispatch() {
        return this.dispatch.bind(this);
    }
}
exports.default = Vuex;
const ADD = 'ADD';
const CHAT = 'CHAT';
const store = new Vuex({
    state: {
        count: 0,
        message: '',
    },
    action: {
        async [ADD](state, payload) {
            state.count += payload;
        },
        async [CHAT](state, message) {
            state.message = message;
        },
    },
    getters: {
        countGetter(state) {
            return state.count + 1;
        },
        messageGetter(state) {
            return `Hey! ${state.message}`;
        },
    },
});
store.subscribeAction({
    before: (action, state, getters) => {
        console.log(`before action ${action.type}, before state is ${JSON.stringify(state)}, before getter is ${JSON.stringify(getters)}`);
    },
    after: (action, state, getters) => {
        console.log(`after action ${action.type},  after state is ${JSON.stringify(state)}, after getter is ${JSON.stringify(getters)}`);
    },
});
// for TypeScript support
const dispatch = store.createDispatch();
dispatch({
    type: ADD,
    payload: 3,
});
dispatch({
    type: CHAT,
    payload: 'Hello World',
});
