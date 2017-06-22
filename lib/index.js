"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
var isPromise = function isPromise(p) {
    return p && typeof p.then === "function";
};

var createMonitor = exports.createMonitor = function createMonitor() {
    var monitor = function monitor(createStore) {
        return function (reducer, preloadedState, enhancer) {
            var store = createStore(reducer, preloadedState, enhancer);
            var dispatch = store.dispatch;
            var promises = [];
            monitor.dispatch = function () {
                for (var _len = arguments.length, actions = Array(_len), _key = 0; _key < _len; _key++) {
                    actions[_key] = arguments[_key];
                }

                if (actions.length === 0) {
                    throw new Error("Actions is not allow to empty.");
                }

                actions.reduce(function (res, action) {
                    var result = dispatch(action);
                    if (isPromise(result)) {
                        res.push(result.catch(function (error) {
                            console.error("[DISPATCH_ACTION]", error);
                            return Promise.resolve();
                        }));
                    } else {
                        res.push(Promise.resolve(result));
                    }

                    return res;
                }, promises);

                return {
                    done: function done(fullFill) {
                        return Promise.all(promises).then(function () {
                            if (typeof fullFill === "function") {
                                try {
                                    return fullFill(store.getState());
                                } catch (ex) {
                                    console.error(ex);
                                }
                            }

                            return null;
                        });
                    }
                };
            };

            return store;
        };
    };

    return monitor;
};

exports.default = createMonitor();