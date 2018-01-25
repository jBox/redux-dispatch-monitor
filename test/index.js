const thunk = require("redux-thunk").default;
const assert = require("assert");
const { createStore, applyMiddleware, compose } = require("redux");
const { createMonitor } = require("../lib");
const { createSeviceMiddleware, rootReducers } = require("./common");

const serviceAction = { SERVICE: { type: "c", payload: "cc" } };
const serviceErrorAction = { error: "TEST ERROR", SERVICE: { type: "c", payload: "cc" } };
const objectAction = { type: "a", payload: "a" };
const serviceAction2 = { SERVICE: { type: "c", payload: "ccx" } };
const thunkAction = (dispatch, getState) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(dispatch({ type: "b", payload: "b" }));
        }, 1000);
    });
}

// usage
describe("redux-dispatch-monitor", () => {

    const g = {};
    beforeEach(() => {
        const middlewares = [thunk.withExtraArgument(), createSeviceMiddleware()];
        const monitor = createMonitor();
        createStore(rootReducers, compose(monitor, applyMiddleware(...middlewares)));
        g.monitor = monitor;
    });

    describe("Not init", () => {
        it("throw", function () {
            const monitor = createMonitor();
            assert.throws(monitor.dispatch, Error);
        });
    });

    describe("With customized middleware", () => {
        it("state should be updated", function (done) {
            g.monitor.dispatch(
                serviceAction, objectAction, thunkAction
            ).done((state) => {
                const e = JSON.stringify(state);
                const a = JSON.stringify({ a: 'a', b: 'b', c: 'cc' });
                assert.equal(a, e);
            }).then(() => done());
        });
    });

    describe("With customized middleware", () => {
        it("multiple dispatch supported", function (done) {
            g.monitor.dispatch(
                serviceAction, objectAction, thunkAction
            ).done((state) => {
                g.monitor.dispatch(
                    serviceAction2
                ).done((state) => {
                    const e = JSON.stringify(state);
                    const a = JSON.stringify({ a: 'a', b: 'b', c: 'ccx' });
                    assert.equal(a, e);
                }).then(() => done());
            });
        });
    });
    describe("Without customized middleware", () => {
        it("the state 'c' should be empty", function (done) {
            g.monitor.dispatch(
                serviceErrorAction, objectAction, thunkAction
            ).done((state) => {
                assert.equal("", state.c);
            }).then(() => done());
        });
    });
    describe("Without customized middleware", () => {
        it("the state 'c' should be empty", function (done) {
            g.monitor.dispatch(
                objectAction, thunkAction
            ).done((state) => {
                assert.equal("", state.c);
            }).then(() => done());
        });
    });
    describe("no actions", () => {
        it("initailize & sync", function (done) {
            g.monitor.dispatch().done((state) => {
                const e = JSON.stringify(state);
                const a = JSON.stringify({ a: '', b: '', c: '' });
                assert.equal(a, e);
            }).then(() => done());
        });
    });
});