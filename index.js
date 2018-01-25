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

const INIT_ERROR = () => {
    throw new Error(`Compose monitor into Redux store first. e.g. 
const monitor = createMonitor();
const store = createStore(reducers, compose(monitor, applyMiddleware(...middlewares)));
monitor.dispatch(...actions).done(fullFill);`);
}

const monitorPromise = (getState, tasks = []) => {
    const p = tasks.length === 0 ?
        Promise.resolve() :
        Promise.all(tasks).then(() => Promise.resolve());

    p.done = (fullFill) => p.then(() => tryCall(fullFill, getState()));
    return p;
};

export const createMonitor = () => {
    const monitor = (createStore) => (reducer, preloadedState, enhancer) => {
        const store = createStore(reducer, preloadedState, enhancer);
        const { dispatch, getState } = store;
        monitor.dispatch = (...actions) => {
            const tasks = actions.reduce((res, action) => {
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

            return monitorPromise(getState, tasks);
        };

        return store;
    };

    monitor.dispatch = INIT_ERROR;
    return monitor;
};

export default createMonitor();
