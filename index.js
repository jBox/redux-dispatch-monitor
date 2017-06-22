const isPromise = (p) => (p && typeof p.then === "function");

export const createMonitor = () => {
    const monitor = (createStore) => (reducer, preloadedState, enhancer) => {
        const store = createStore(reducer, preloadedState, enhancer);
        const dispatch = store.dispatch;
        const promises = [];
        monitor.dispatch = (...actions) => {
            if (actions.length === 0) {
                throw new Error("Actions is not allow to empty.");
            }

            actions.reduce((res, action) => {
                const result = dispatch(action);
                if (isPromise(result)) {
                    res.push(result.catch((error) => {
                        console.error("[DISPATCH_ACTION]", error);
                        return Promise.resolve();
                    }));
                } else {
                    res.push(Promise.resolve(result));
                }

                return res;
            }, promises);

            return {
                done: (fullFill) => {
                    return Promise.all(promises).then(() => {
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

    return monitor;
};

export default createMonitor();
