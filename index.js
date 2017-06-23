if (typeof console === "undefined") {
    console = {};
}
if (typeof console.error !== "function") {
    console.error = (error) => (error);
}

const isPromise = (p) => (p && typeof p.then === "function");

const tryCall = (fn, ...args) => {
    if (typeof fn === "function") {
        try {
            return fn(...args);
        } catch (exception) {
            console.error("[TRY_CALL]", exception);
        }
    }

    return null;
};

export const createMonitor = () => {
    const monitor = (createStore) => (reducer, preloadedState, enhancer) => {
        const store = createStore(reducer, preloadedState, enhancer);
        const dispatch = store.dispatch;
        monitor.dispatch = (...actions) => {
            if (actions.length === 0) {
                return {
                    done: (fullFill) => tryCall(fullFill, store.getState())
                }
            }

            const promises = actions.reduce((res, action) => {
                try {
                    const result = dispatch(action);
                    if (isPromise(result)) {
                        res.push(result.catch((error) => {
                            console.error("[DISPATCH_ACTION]", error);
                            return Promise.resolve();
                        }));
                    } else {
                        res.push(Promise.resolve(result));
                    }
                } catch (exception) {
                    console.error("[DISPATCH_EXCEPTION]", exception)
                }

                return res;
            }, []);

            return {
                done: (fullFill) => {
                    return Promise.all(promises).then(() => tryCall(fullFill, store.getState()));
                }
            };
        };

        return store;
    };

    return monitor;
};

export default createMonitor();
