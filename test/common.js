const { combineReducers } = require("redux");

exports.createSeviceMiddleware = () => (store) => next => action => {
    const service = action["SERVICE"];
    if (typeof service === "undefined") {
        return next(action)
    }

    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (action.error) {
                return reject(action.error);
            }

            return resolve(next(service));
            //reject(new Error("TEST ERROR"));
        }, 800);
    });
};

exports.rootReducers = combineReducers({
    a: (state = "", action) => {
        switch (action.type) {
            case "a":
                return action.payload;
            default:
                return state;
        }
    },
    b: (state = "", action) => {
        switch (action.type) {
            case "b":
                return action.payload;
            default:
                return state;
        }
    },
    c: (state = "", action) => {
        switch (action.type) {
            case "c":
                return action.payload;
            default:
                return state;
        }
    }
});
