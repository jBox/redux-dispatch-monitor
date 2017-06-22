## Initialize redux state asynchronously with multiple async actions.

# Install
```js
npm install --save redux-dispatch-monitor
```
# Usage
```js
import { createStore, applyMiddleware, compose } from "redux";
import monitor from "redux-dispatch-monitor";
import thunk from "redux-thunk";
import customizedMiddleware from "./middlewares/customized";
import rootReducers from "./reducers";
import { action1, action2, actionN } from "./actions";

const middlewares = [thunk, customizedMiddleware];
const initActions = [
    action1(params),
    action2(params),
    actionN(params)
];

const enhancer = compose(monitor, applyMiddleware(...middlewares));
const store = createStore(rootReducers, enhancer);
monitor.dispatch(...initActions).done((preloadedState) => {
    // do some things initializing
})
```